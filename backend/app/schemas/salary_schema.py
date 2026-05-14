from pydantic import BaseModel, Field, validator
from typing import List, Optional

class PredictionRequest(BaseModel):
    country: str
    education: str
    experience: float = Field(..., ge=0, le=50, description="Years of experience (0-50)")

    @validator('education')
    def validate_education(cls, v):
        if v not in ['Undergraduate', 'Postgraduate']:
            raise ValueError('Education must be "Undergraduate" or "Postgraduate"')
        return v

class PredictionResponse(BaseModel):
    predicted_salary: float
    predicted_salary_usd: float
    currency: str

class SalaryDataPoint(BaseModel):
    category: str
    mean_salary: float

class AnalyticsResponse(BaseModel):
    mean_salary_by_country: List[SalaryDataPoint]
    mean_salary_by_experience: List[SalaryDataPoint]
    salary_distribution: List[dict]   # for histogram
    education_salary_comparison: List[dict]