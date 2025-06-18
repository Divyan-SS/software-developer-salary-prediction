import streamlit as st
import pickle
import numpy as np

# Updated currency conversion rates (1 unit of currency to other currencies)
conversion_rates = {
    "United States": {
        "United States": 1.0,
        "India": 83.50,
        "United Kingdom": 0.81,
        "Germany": 0.94,
        "Canada": 1.36,
        "Brazil": 5.19,
        "France": 0.94,
        "Spain": 0.94,
        "Australia": 1.50,
        "Netherlands": 0.94,
        "Poland": 4.18,
        "Italy": 0.94,
        "Russian Federation": 76.00,
        "Sweden": 9.63,
    },
    "India": {
        "United States": 1 / 83.50,
        "India": 1.0,
        "United Kingdom": 0.81 / 83.50,
        "Germany": 0.94 / 83.50,
        "Canada": 1.36 / 83.50,
        "Brazil": 5.19 / 83.50,
        "France": 0.94 / 83.50,
        "Spain": 0.94 / 83.50,
        "Australia": 1.50 / 83.50,
        "Netherlands": 0.94 / 83.50,
        "Poland": 4.18 / 83.50,
        "Italy": 0.94 / 83.50,
        "Russian Federation": 76.00 / 83.50,
        "Sweden": 9.63 / 83.50,
    },
    "United Kingdom": {
        "United States": 1 / 0.81,
        "India": 83.50 * (1 / 0.81),
        "United Kingdom": 1.0,
        "Germany": 0.94 / 0.81,
        "Canada": 1.36 / 0.81,
        "Brazil": 5.19 / 0.81,
        "France": 0.94 / 0.81,
        "Spain": 0.94 / 0.81,
        "Australia": 1.50 / 0.81,
        "Netherlands": 0.94 / 0.81,
        "Poland": 4.18 / 0.81,
        "Italy": 0.94 / 0.81,
        "Russian Federation": 76.00 / 0.81,
        "Sweden": 9.63 / 0.81,
    },
    "Germany": {
        "United States": 1 / 0.94,
        "India": 83.50 * (1 / 0.94),
        "United Kingdom": 0.81 * (1 / 0.94),
        "Germany": 1.0,
        "Canada": 1.36 / 0.94,
        "Brazil": 5.19 / 0.94,
        "France": 1.0,  # EUR to EUR
        "Spain": 1.0,  # EUR to EUR
        "Australia": 1.50 / 0.94,
        "Netherlands": 1.0,  # EUR to EUR
        "Poland": 4.18 / 0.94,
        "Italy": 1.0,  # EUR to EUR
        "Russian Federation": 76.00 / 0.94,
        "Sweden": 9.63 / 0.94,
    },
    "Canada": {
        "United States": 1 / 1.36,
        "India": 83.50 * (1 / 1.36),
        "United Kingdom": 0.81 * (1 / 1.36),
        "Germany": 0.94 * (1 / 1.36),
        "Canada": 1.0,
        "Brazil": 5.19 / 1.36,
        "France": 0.94 / 1.36,
        "Spain": 0.94 / 1.36,
        "Australia": 1.50 / 1.36,
        "Netherlands": 0.94 / 1.36,
        "Poland": 4.18 / 1.36,
        "Italy": 0.94 / 1.36,
        "Russian Federation": 76.00 / 1.36,
        "Sweden": 9.63 / 1.36,
    },
    "Brazil": {
        "United States": 1 / 5.19,
        "India": 83.50 * (1 / 5.19),
        "United Kingdom": 0.81 * (1 / 5.19),
        "Germany": 0.94 * (1 / 5.19),
        "Canada": 1.36 * (1 / 5.19),
        "Brazil": 1.0,
        "France": 0.94 / 5.19,
        "Spain": 0.94 / 5.19,
        "Australia": 1.50 / 5.19,
        "Netherlands": 0.94 / 5.19,
        "Poland": 4.18 / 5.19,
        "Italy": 0.94 / 5.19,
        "Russian Federation": 76.00 / 5.19,
        "Sweden": 9.63 / 5.19,
    },
    "France": {
        "United States": 1 / 0.94,
        "India": 83.50 * (1 / 0.94),
        "United Kingdom": 0.81 * (1 / 0.94),
        "Germany": 1.0,  # EUR to EUR
        "Canada": 0.94 * (1 / 0.94),
        "Brazil": 5.19 * (1 / 0.94),
        "France": 1.0,
        "Spain": 1.0,  # EUR to EUR
        "Australia": 1.50 / 0.94,
        "Netherlands": 1.0,  # EUR to EUR
        "Poland": 4.18 / 0.94,
        "Italy": 1.0,  # EUR to EUR
        "Russian Federation": 76.00 / 0.94,
        "Sweden": 9.63 / 0.94,
    },
    "Spain": {
        "United States": 1 / 0.94,
        "India": 83.50 * (1 / 0.94),
        "United Kingdom": 0.81 * (1 / 0.94),
        "Germany": 1.0,  # EUR to EUR
        "Canada": 0.94 * (1 / 0.94),
        "Brazil": 5.19 * (1 / 0.94),
        "France": 1.0,  # EUR to EUR
        "Spain": 1.0,
        "Australia": 1.50 / 0.94,
        "Netherlands": 1.0,  # EUR to EUR
        "Poland": 4.18 / 0.94,
        "Italy": 1.0,  # EUR to EUR
        "Russian Federation": 76.00 / 0.94,
        "Sweden": 9.63 / 0.94,
    },
    "Australia": {
        "United States": 1 / 1.50,
        "India": 83.50 * (1 / 1.50),
        "United Kingdom": 0.81 * (1 / 1.50),
        "Germany": 0.94 * (1 / 1.50),
        "Canada": 1.36 * (1 / 1.50),
        "Brazil": 5.19 * (1 / 1.50),
        "France": 0.94 * (1 / 1.50),
        "Spain": 0.94 * (1 / 1.50),
        "Australia": 1.0,
        "Netherlands": 0.94 * (1 / 1.50),
        "Poland": 4.18 * (1 / 1.50),
        "Italy": 0.94 * (1 / 1.50),
        "Russian Federation": 76.00 * (1 / 1.50),
        "Sweden": 9.63 * (1 / 1.50),
    },
    "Netherlands": {
        "United States": 1 / 0.94,
        "India": 83.50 * (1 / 0.94),
        "United Kingdom": 0.81 * (1 / 0.94),
        "Germany": 1.0,  # EUR to EUR
        "Canada": 0.94 * (1 / 0.94),
        "Brazil": 5.19 * (1 / 0.94),
        "France": 1.0,  # EUR to EUR
        "Spain": 1.0,  # EUR to EUR
        "Australia": 1.50 * (1 / 0.94),
        "Netherlands": 1.0,
        "Poland": 4.18 * (1 / 0.94),
        "Italy": 1.0,  # EUR to EUR
        "Russian Federation": 76.00 * (1 / 0.94),
        "Sweden": 9.63 * (1 / 0.94),
    },
    "Poland": {
        "United States": 1 / 4.18,
        "India": 83.50 * (1 / 4.18),
        "United Kingdom": 0.81 * (1 / 4.18),
        "Germany": 0.94 * (1 / 4.18),
        "Canada": 1.36 * (1 / 4.18),
        "Brazil": 5.19 * (1 / 4.18),
        "France": 0.94 * (1 / 4.18),
        "Spain": 0.94 * (1 / 4.18),
        "Australia": 1.50 * (1 / 4.18),
        "Netherlands": 0.94 * (1 / 4.18),
        "Poland": 1.0,
        "Italy": 0.94 * (1 / 4.18),
        "Russian Federation": 76.00 * (1 / 4.18),
        "Sweden": 9.63 * (1 / 4.18),
    },
    "Italy": {
        "United States": 1 / 0.94,
        "India": 83.50 * (1 / 0.94),
        "United Kingdom": 0.81 * (1 / 0.94),
        "Germany": 1.0,  # EUR to EUR
        "Canada": 0.94 * (1 / 0.94),
        "Brazil": 5.19 * (1 / 0.94),
        "France": 1.0,  # EUR to EUR
        "Spain": 1.0,  # EUR to EUR
        "Australia": 1.50 * (1 / 0.94),
        "Netherlands": 1.0,  # EUR to EUR
        "Poland": 4.18 * (1 / 0.94),
        "Italy": 1.0,
        "Russian Federation": 76.00 * (1 / 0.94),
        "Sweden": 9.63 * (1 / 0.94),
    },
    "Russian Federation": {
        "United States": 1 / 76.00,
        "India": 83.50 * (1 / 76.00),
        "United Kingdom": 0.81 * (1 / 76.00),
        "Germany": 0.94 * (1 / 76.00),
        "Canada": 1.36 * (1 / 76.00),
        "Brazil": 5.19 * (1 / 76.00),
        "France": 0.94 * (1 / 76.00),
        "Spain": 0.94 * (1 / 76.00),
        "Australia": 1.50 * (1 / 76.00),
        "Netherlands": 0.94 * (1 / 76.00),
        "Poland": 4.18 * (1 / 76.00),
        "Italy": 0.94 * (1 / 76.00),
        "Russian Federation": 1.0,
        "Sweden": 9.63 * (1 / 76.00),
    },
    "Sweden": {
        "United States": 1 / 9.63,
        "India": 83.50 * (1 / 9.63),
        "United Kingdom": 0.81 * (1 / 9.63),
        "Germany": 0.94 * (1 / 9.63),
        "Canada": 1.36 * (1 / 9.63),
        "Brazil": 5.19 * (1 / 9.63),
        "France": 0.94 * (1 / 9.63),
        "Spain": 0.94 * (1 / 9.63),
        "Australia": 1.50 * (1 / 9.63),
        "Netherlands": 0.94 * (1 / 9.63),
        "Poland": 4.18 * (1 / 9.63),
        "Italy": 0.94 * (1 / 9.63),
        "Russian Federation": 76.00 * (1 / 9.63),
        "Sweden": 1.0,
    },
}


currency_symbols = {
    "United States": "$",
    "India": "₹",
    "United Kingdom": "£",
    "Germany": "€",
    "Canada": "C$",
    "Brazil": "R$",
    "France": "€",
    "Spain": "€",
    "Australia": "A$",
    "Netherlands": "€",
    "Poland": "zł",
    "Italy": "€",
    "Russian Federation": "₽",
    "Sweden": "kr",
}

def load_model():
    with open('saved_steps.pkl', 'rb') as file:
        data = pickle.load(file)
    return data

data = load_model()
regressor = data["model"]
le_country = data["le_country"]
le_education = data["le_education"]

def convert_currency(amount, from_country, to_country):
    if from_country == to_country:
        return amount
    return amount * conversion_rates[from_country][to_country]

def show_predict_page():
    st.title("Software Developer Salary Prediction")
    st.write("""### We need some information to predict the salary""")

    countries = (
        "United States",
        "India",
        "United Kingdom",
        "Germany",
        "Canada",
        "Brazil",
        "France",
        "Spain",
        "Australia",
        "Netherlands",
        "Poland",
        "Italy",
        "Russian Federation",
        "Sweden",
    )

    education_levels = (
        "Undergraduate",
        "Postgraduate",
    )

    country = st.selectbox("Country", countries)
    education = st.selectbox("Education Level", education_levels)
    experience = st.slider("Years of Experience", 0, 50, 3)

    calculate_button = st.button("Calculate Salary")
    if calculate_button:
        X = np.array([[country, education, experience]])
        X[:, 0] = le_country.transform(X[:, 0])
        X[:, 1] = le_education.transform(X[:, 1])
        X = X.astype(float)

        salary = regressor.predict(X)[0]
        salary_in_local_currency = convert_currency(salary, "United States", country)
        st.session_state['salary'] = salary
        st.session_state['salary_in_local_currency'] = salary_in_local_currency
        st.session_state['country'] = country
        st.subheader(f"The estimated salary is {currency_symbols[country]}{salary_in_local_currency:.2f}")

    if 'salary' in st.session_state and 'salary_in_local_currency' in st.session_state:
        st.write("### Convert the estimated salary to another currency")
        target_country = st.selectbox("Convert to", countries, key="target_country")
        convert_button = st.button("Convert Salary")
        if convert_button:
            target_salary = convert_currency(st.session_state['salary_in_local_currency'], country, target_country)
            st.write(f"### The estimated salary in {target_country} is {currency_symbols[target_country]}{target_salary:.2f}")

    # CSS for better design
    st.markdown("""
    <style>
    .stButton button {
        background-color: black;
        color: white;
    }
    .stButton button:focus {
        background-color: black;
    }
    </style>
    """, unsafe_allow_html=True)
