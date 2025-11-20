import os
import pickle
import json
import numpy as np
import tempfile
from pathlib import Path

import pytest
from fastapi.testclient import TestClient


def make_dummy_model(pred_value=123.45, feature_names=None):
    class DummyModel:
        def __init__(self, v, cols=None):
            self._v = v
            if cols is not None:
                # mimic scikit-learn attribute
                self.feature_names_in_ = cols

        def predict(self, X):
            # return array-like
            return [self._v] * len(X)

    return DummyModel(pred_value, feature_names)


@pytest.fixture
def tmp_models_dir(tmp_path, monkeypatch):
    d = tmp_path / "models"
    d.mkdir()

    # Create feature names pickle
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

    # Create a dummy xgboost pickle model
    dummy = make_dummy_model(pred_value=250.0, feature_names=feature_names)
    with open(d / "xgboost_nutrition_model_20251103.pkl", "wb") as f:
        pickle.dump(dummy, f)

    return d


def test_local_loader_and_predict(tmp_models_dir, monkeypatch):
    # Disable HF snapshot during this test to avoid network calls
    import backend.api.models.loader as loader_mod
    monkeypatch.setattr(loader_mod, "HF_AVAILABLE", False)

    # Instantiate ModelLoader pointing to our tmp models dir
    loader = loader_mod.ModelLoader(local_model_dir=tmp_models_dir)

    assert loader.models.get('local_xgboost', {}).get('available') is True

    # Prepare input matching feature names
    input_dict = {k: 1.0 for k in loader.feature_names}
    res = loader.predict(input_dict, model_preference='auto')
    assert res['success'] is True
    assert 'prediction' in res
    assert float(res['prediction']['caloric_needs']) == pytest.approx(250.0)


def test_predict_endpoint_and_recommend(tmp_models_dir, monkeypatch):
    # Disable HF snapshot during this test
    import backend.api.models.loader as loader_mod
    monkeypatch.setattr(loader_mod, "HF_AVAILABLE", False)

    # Create loader and attach an ensemble manually
    loader = loader_mod.ModelLoader(local_model_dir=tmp_models_dir)

    # create a tiny ensemble for recommend testing
    emb = np.array([[1.0, 0.0], [0.0, 1.0]], dtype=float)
    norms = np.linalg.norm(emb, axis=1, keepdims=True)
    emb_norm = emb / norms
    loader.models['ensemble'] = {
        'embeddings': emb_norm,
        'ids': ['food_a', 'food_b'],
        'metadata': {'food_a': {'name': 'A'}, 'food_b': {'name': 'B'}},
        'available': True
    }

    # Now wire this loader into the running app routers
    from backend.api.main import app
    from backend.api.routers import predict as predict_router

    predict_router.set_model_loader(loader)

    client = TestClient(app)

    # Call predict endpoint
    payload = {k: 1.0 for k in loader.feature_names}
    r = client.post("/predict/", json=payload)
    assert r.status_code == 200
    body = r.json()
    assert body['success'] is True
    assert float(body['prediction']['caloric_needs']) == pytest.approx(250.0)

    # Call recommend by id
    r2 = client.get('/predict/recommend', params={'by_id': 'food_a', 'top_k': 2})
    assert r2.status_code == 200
    b2 = r2.json()
    assert b2['success'] is True
    assert len(b2['items']) == 2
