import pickle
import numpy as np
import pytest
from fastapi.testclient import TestClient


class DummyModel:
    def __init__(self, v, cols=None):
        self._v = v
        if cols is not None:
            self.feature_names_in_ = cols

    def predict(self, X):
        return [self._v] * len(X)


@pytest.fixture
def tmp_models_dir(tmp_path, monkeypatch):
    d = tmp_path / "models"
    d.mkdir()

    feature_names = [
        "Energy_kcal_per_serving",
        "Protein_g_per_serving",
        "Fat_g_per_serving",
        "Carbohydrates_g_per_serving",
        "Fiber_g_per_serving",
        "Calcium_mg_per_serving",
        "Iron_mg_per_serving",
        "Zinc_mg_per_serving",
        "VitaminA_ug_per_serving",
        "VitaminC_mg_per_serving",
        "Potassium_mg_per_serving",
        "Magnesium_mg_per_serving",
        "region_encoded",
        "condition_encoded",
        "age_group_encoded",
        "season_encoded",
        "portion_size_g",
        "estimated_cost_ugx",
    ]

    with open(d / "xgboost_feature_names_20251103.pkl", "wb") as f:
        pickle.dump(feature_names, f)

    dummy = DummyModel(300.0, cols=feature_names)
    with open(d / "xgboost_nutrition_model_20251103.pkl", "wb") as f:
        pickle.dump(dummy, f)

    return d


def test_health_and_model_status(tmp_models_dir, monkeypatch):
    # Disable HF network calls
    import backend.api.models.loader as loader_mod
    monkeypatch.setattr(loader_mod, "HF_AVAILABLE", False)

    loader = loader_mod.ModelLoader(local_model_dir=tmp_models_dir)

    from backend.api.main import app
    from backend.api.routers import health as health_router

    health_router.set_model_loader(loader)
    client = TestClient(app)

    r = client.get('/health/')
    assert r.status_code == 200
    j = r.json()
    assert j['status'] == 'healthy'
    assert 'models' in j

    r2 = client.get('/health/models')
    assert r2.status_code == 200
    m = r2.json()
    assert m['online_model']['available'] is True or m['online_model']['available'] is False

    r3 = client.get('/health/metrics')
    assert r3.status_code == 200
    metrics = r3.json()
    assert 'models' in metrics


def make_sample_input(feature_names):
    return {k: 1.0 for k in feature_names}


def test_batch_predict_and_recommend_vector(tmp_models_dir, monkeypatch):
    import backend.api.models.loader as loader_mod
    monkeypatch.setattr(loader_mod, "HF_AVAILABLE", False)

    loader = loader_mod.ModelLoader(local_model_dir=tmp_models_dir)

    # wire loader into routers
    from backend.api.main import app
    from backend.api.routers import predict as predict_router
    from backend.api.routers import health as health_router

    predict_router.set_model_loader(loader)
    health_router.set_model_loader(loader)

    client = TestClient(app)

    # batch with two inputs
    inputs = [make_sample_input(loader.feature_names), make_sample_input(loader.feature_names)]
    r = client.post('/predict/batch', json={'inputs': inputs, 'prefer_online': False})
    assert r.status_code == 200
    body = r.json()
    assert body['success'] is True
    assert body['total'] == 2

    # Test recommend with a vector (length 2) after attaching a small ensemble
    emb = np.array([[1.0, 0.0], [0.0, 1.0]], dtype=float)
    emb_norm = emb / np.linalg.norm(emb, axis=1, keepdims=True)
    loader.models['ensemble'] = {'embeddings': emb_norm, 'ids': ['a', 'b'], 'metadata': {}, 'available': True}

    vec = '1.0,0.0'
    r2 = client.get('/predict/recommend', params={'vector': vec, 'top_k': 1})
    assert r2.status_code == 200
    out = r2.json()
    assert out['success'] is True
    assert len(out['items']) == 1


def test_predict_missing_fields_returns_422(tmp_models_dir, monkeypatch):
    import backend.api.models.loader as loader_mod
    monkeypatch.setattr(loader_mod, "HF_AVAILABLE", False)

    loader = loader_mod.ModelLoader(local_model_dir=tmp_models_dir)
    from backend.api.main import app
    from backend.api.routers import predict as predict_router

    predict_router.set_model_loader(loader)
    client = TestClient(app)

    # Provide incomplete payload (missing many required fields)
    r = client.post('/predict/', json={'Energy_kcal_per_serving': 100})
    assert r.status_code == 422
