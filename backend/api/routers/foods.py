from fastapi import APIRouter
from pathlib import Path
import pandas as pd

router = APIRouter(prefix="/foods", tags=["Foods"])


def _normalize_region(r):
    if not isinstance(r, str):
        return 'all'
    r = r.strip().lower()
    if r in ('national', 'all', 'countrywide'):
        return 'all'
    return r


def _normalize_category(cat):
    if not isinstance(cat, str):
        return 'other'
    return cat.strip().lower()


@router.get('/local')
def get_local_foods(limit: int = 500):
    """
    Return a list of local foods derived from the uploaded `food_composition_clean.csv` file.
    The endpoint maps CSV columns to a compact JSON shape used by the frontend.
    """
    # Try several common locations for the dataset:
    # 1) repository root: ../../..
    # 2) frontend public data: ../../../../frontend/public/data/
    repo_root = Path(__file__).resolve().parents[3]
    candidates = [
        repo_root / 'food_composition_clean.csv',
        repo_root / 'frontend' / 'public' / 'data' / 'food_composition_clean.csv'
    ]

    csv_path = None
    for p in candidates:
        if p.exists():
            csv_path = p
            break

    if csv_path is None:
        return {"error": "food composition dataset not found", "checked": [str(x) for x in candidates]}

    df = pd.read_csv(csv_path)

    foods = []
    seen = set()
    for i, row in df.iterrows():
        try:
            name = row.get('food_name_english') or row.get('food_name') or ''
            category = _normalize_category(row.get('food_category', 'other'))
            region = _normalize_region(row.get('region', 'all'))

            energy = float(row.get('energy_kcal_per_100g', 0) or 0)
            protein = float(row.get('protein_g_per_100g', 0) or 0)
            fat = float(row.get('fat_g_per_100g', 0) or 0)
            carbs = float(row.get('carbohydrate_g_per_100g', 0) or 0)
            fiber = float(row.get('fiber_g_per_100g', 0) or 0)
            calcium = float(row.get('calcium_mg_per_100g', 0) or 0)
            iron = float(row.get('iron_mg_per_100g', 0) or 0)

            price = row.get('avg_market_price_ugx_per_kg')
            try:
                price = int(float(price)) if pd.notna(price) else 0
            except Exception:
                price = 0

            availability_score = float(row.get('availability_score', 0) or 0)
            available = availability_score >= 0.5

            # normalize name for deduplication
            clean_name = str(name).strip()
            key = clean_name.lower()
            if key in seen:
                # skip duplicates by normalized name
                continue
            seen.add(key)

            foods.append({
                'id': f"food_{i}",
                'name': clean_name,
                'category': category,
                'region': region,
                'energy': round(energy, 1),
                'protein': round(protein, 2),
                'fat': round(fat, 2),
                'carbs': round(carbs, 2),
                'fiber': round(fiber, 2),
                'calcium': round(calcium, 1),
                'iron': round(iron, 2),
                'pricePerKg': price,
                'available': bool(available),
            })
        except Exception:
            # Skip problematic rows
            continue

    # Limit the number of returned items to keep payload small
    return foods[:int(limit)]
