import pandas as pd
from .preprocessing import get_model, preprocess_input

def predict_salary(country: str, education: str, experience: float) -> float:
    """
    Returns predicted salary in USD. Raises ValueError if country/education invalid.
    """
    model = get_model()
    X_array = preprocess_input(country, education, experience)
    
    if hasattr(model, "feature_names_in_"):
        X = pd.DataFrame(X_array, columns=model.feature_names_in_)
    else:
        X = X_array
    
    salary = model.predict(X)[0]
    return float(salary)

def safe_predict_salary(country: str, education: str, experience: float):
    """
    Returns (salary, error_message). If successful, error_message is None.
    """
    try:
        salary = predict_salary(country, education, experience)
        return salary, None
    except ValueError as e:
        return None, str(e)
    except Exception as e:
        return None, f"Prediction error: {str(e)}"