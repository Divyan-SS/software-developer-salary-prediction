import streamlit as st
import pandas as pd
import plotly.express as px

def shorten_categories(categories, cutoff):
    categorical_map = {}
    for i in range(len(categories)):
        if categories.values[i] >= cutoff:
            categorical_map[categories.index[i]] = categories.index[i]
        else:
            categorical_map[categories.index[i]] = 'Other'
    return categorical_map

def clean_experience(x):
    if x == 'More than 50 years':
        return 50  # Changed to 50 to reflect more realistic values
    if x == 'Less than 1 year':
        return 0.5
    return float(x)

def clean_education(x):
    if 'Bachelor’s degree' in x:
        return 'Undergraduate'
    if 'Master’s degree' in x or 'Professional degree' in x or 'Other doctoral' in x:
        return 'Postgraduate'
    return None  # Change this to None to filter out

@st.cache_data  # Updated cache to use cache_data (if using Streamlit >= 1.10)
def load_data():
    df = pd.read_csv("survey_results_public.csv")
    df = df[["Country", "EdLevel", "YearsCodePro", "Employment", "ConvertedComp"]]
    df = df[df["ConvertedComp"].notnull()]
    df = df.dropna()
    df = df[df["Employment"] == "Employed full-time"]
    df = df.drop("Employment", axis=1)

    country_map = shorten_categories(df.Country.value_counts(), 400)
    df["Country"] = df["Country"].map(country_map)
    df = df[df["ConvertedComp"] <= 250000]
    df = df[df["ConvertedComp"] >= 10000]
    df = df[df["Country"] != "Other"]

    df["YearsCodePro"] = df["YearsCodePro"].apply(clean_experience)
    df["EdLevel"] = df["EdLevel"].apply(clean_education)
    df = df.rename({"ConvertedComp": "Salary"}, axis=1)
    
    # Filter out entries with no education level
    df = df[df["EdLevel"].notna()]  # Only keep rows with valid EdLevel

    # Filter out experience less than 1 year and more than 50 years
    df = df[(df["YearsCodePro"] >= 0) & (df["YearsCodePro"] <= 50)]

    return df

def show_explore_page():
    df = load_data()  # Ensure you call load_data here or pass df as an argument
    st.title("Explore Software Engineer Salaries")

    st.write(
        """
    ### Stack Overflow Developer Survey 2020
    """
    )

    st.sidebar.header("Filters")
    country = st.sidebar.multiselect("Select Country", df["Country"].unique(), default=df["Country"].unique())
    df_filtered = df[df["Country"].isin(country)]

    st.write("#### Number of Data from Different Countries")
    country_data = df_filtered["Country"].value_counts()
    fig1 = px.pie(country_data, names=country_data.index, values=country_data.values, title="Country Distribution")
    st.plotly_chart(fig1)

    st.write("#### Mean Salary Based on Country")
    country_salary = df_filtered.groupby("Country")["Salary"].mean().sort_values()
    fig2 = px.bar(country_salary, x=country_salary.index, y=country_salary.values, title="Mean Salary by Country")
    st.plotly_chart(fig2)

    st.write("#### Mean Salary Based on Experience")
    experience_salary = df_filtered.groupby("YearsCodePro")["Salary"].mean().sort_values()
    fig3 = px.line(experience_salary, x=experience_salary.index, y=experience_salary.values, title="Mean Salary by Experience")
    st.plotly_chart(fig3)

    # Salary Distribution by Education Level
    st.write("#### Salary Distribution by Education Level")
    salary_education = df_filtered.groupby(["EdLevel", "Country"])["Salary"].mean().unstack().T
    fig4 = px.bar(salary_education, barmode="group", title="Salary by Education Level Across Countries")
    st.plotly_chart(fig4)

    # Salary Distribution by Country (Box Plot)
    st.write("#### Salary Distribution by Country")
    fig5 = px.box(df_filtered, x="Country", y="Salary", points="all", title="Salary Distribution by Country")
    st.plotly_chart(fig5)

    # Salary vs Education Level Density Plot
    st.write("#### Salary Density by Education Level")
    fig6 = px.violin(df_filtered, x="EdLevel", y="Salary", box=True, points="all", title="Salary vs Education Level Density")
    st.plotly_chart(fig6)
