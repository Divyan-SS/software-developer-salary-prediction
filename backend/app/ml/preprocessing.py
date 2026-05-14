import pickle
import pandas as pd
import numpy as np
from pathlib import Path

_MODEL_PATH = Path(__file__).parent.parent / "models" / "saved_steps.pkl"
_model_data = None

def load_model_data():
    global _model_data
    if _model_data is None:
        with open(_MODEL_PATH, 'rb') as f:
            _model_data = pickle.load(f)
    return _model_data

def get_model():
    return load_model_data()["model"]

def get_country_encoder():
    return load_model_data()["le_country"]

def get_education_encoder():
    return load_model_data()["le_education"]

def clean_experience(x):
    """Convert string experience to float (same as original)"""
    if x is None:
        return None

    if isinstance(x, float) and np.isnan(x):
        return None

    if isinstance(x, str):
        x = x.strip()
        if x == '':
            return None
        if x == 'More than 50 years':
            return 50.0
        if x == 'Less than 1 year':
            return 0.5
        try:
            return float(x)
        except:
            return None

    try:
        value = float(x)
    except:
        return None

    if value < 0 or value > 50:
        return None

    return value


def clean_education(x):
    """Map raw education string to 'Undergraduate' or 'Postgraduate'"""
    if isinstance(x, str):
        if 'Bachelor’s degree' in x:
            return 'Undergraduate'
        if 'Master’s degree' in x or 'Professional degree' in x or 'Other doctoral' in x:
            return 'Postgraduate'
    return None

def preprocess_input(country: str, education: str, experience: float):
    """
    Transforms raw inputs into the format expected by the model.
    Returns a numpy array of shape (1,3) with encoded values.
    """
    le_country = get_country_encoder()
    le_education = get_education_encoder()

    # Ensure education is correctly capitalized
    if education not in ['Undergraduate', 'Postgraduate']:
        raise ValueError(f"Invalid education: {education}")

    # Encoders were fitted on the original training set
    try:
        country_enc = le_country.transform([country])[0]
    except ValueError:
        # Fallback: if country not seen, map to 'Other'? Original code removed 'Other'.
        # Here we raise a clear error.
        raise ValueError(f"Country '{country}' not recognized by the model. Supported countries: {list(le_country.classes_)}")

    edu_enc = le_education.transform([education])[0]

    if experience is None:
        raise ValueError("Invalid YearsCodePro value")
    if isinstance(experience, (int, float)) and (experience < 0 or experience > 50):
        raise ValueError("Invalid YearsCodePro value")

    return np.array([[country_enc, edu_enc, experience]], dtype=float)