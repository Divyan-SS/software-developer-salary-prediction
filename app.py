import streamlit as st
from predict_page import show_predict_page
from explore_page import show_explore_page

st.set_page_config(page_title="Salary Prediction App", layout="wide")

st.markdown(
    """
    <style>
    .sidebar .sidebar-content {
        background-image: linear-gradient(120deg, #4e73df, #1cc88a);
        color: white;
    }
    .css-18e3th9 {
        padding-top: 4rem;
    }
    .css-1d391kg {
        background-color: #f8f9fc;
    }
    .stButton button {
        background-color: #4CAF50;
        color: white;
    }
    .stButton button:focus {
        background-color: #45a049;
    }
    </style>
    """,
    unsafe_allow_html=True,
)

page = st.sidebar.selectbox("Explore Or Predict", ("Predict", "Explore"))

if page == "Predict":
    show_predict_page()
else:
    show_explore_page()
