import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
from sklearn.ensemble import RandomForestRegressor
import joblib

df = pd.read_csv("backend/dataset/survey_results_public.csv")

df = df[["Country", "EdLevel", "YearsCodePro", "ConvertedComp"]]
df = df.dropna()

df["YearsCodePro"] = pd.to_numeric(df["YearsCodePro"], errors="coerce")
df = df.dropna()

X = df[["Country", "EdLevel", "YearsCodePro"]]
y = df["ConvertedComp"]

categorical = ["Country", "EdLevel"]
numeric = ["YearsCodePro"]

preprocessor = ColumnTransformer([
    ("cat", OneHotEncoder(handle_unknown="ignore"), categorical)
], remainder="passthrough")

model = Pipeline([
    ("preprocessor", preprocessor),
    ("regressor", RandomForestRegressor())
])

model.fit(X, y)

joblib.dump(model, "backend/app/models/salary_model.pkl")

print("Model trained successfully")