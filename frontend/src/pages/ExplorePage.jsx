// ExplorePage.jsx
import { useEffect, useMemo, useState } from 'react';
import { fetchFilteredAnalytics, fetchAnalytics } from '../services/api';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
} from 'recharts';

const chartSections = [
  { id: 'meanSalaryByCountry', label: 'Mean Salary by Country' },
  { id: 'salaryVsExperience', label: 'Salary vs Experience' },
  { id: 'educationPie', label: 'Salary Distribution by Education' },
  { id: 'salaryGrowthArea', label: 'Salary Growth by Experience' },
  { id: 'countryDonut', label: 'Country-wise Employee Distribution' },
  { id: 'topPayingCountries', label: 'Top Paying Countries' },
  { id: 'stackedEducationByCountry', label: 'Education vs Salary by Country' },
  { id: 'experienceScatter', label: 'Experience vs Salary Correlation' },
];

const chartColors = [
  '#2563eb',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#14b8a6',
  '#ec4899',
  '#f97316',
  '#0ea5e9',
];

const formatCurrency = (value) =>
  value == null || Number.isNaN(value)
    ? '-'
    : `$${Number(value).toLocaleString(undefined, {
        maximumFractionDigits: 0,
      })}`;

const formatNumber = (value) =>
  value == null || Number.isNaN(value)
    ? '-'
    : Number(value).toLocaleString();

export default function ExplorePage() {
  const [allCountries, setAllCountries] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [countrySearch, setCountrySearch] = useState('');

  const [allEducationLevels, setAllEducationLevels] = useState([]);
  const [selectedEducationLevels, setSelectedEducationLevels] = useState([]);
  const [educationSearch, setEducationSearch] = useState('');

  const [experienceRange, setExperienceRange] = useState([0, 50]);

  const [analytics, setAnalytics] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [chartVisibility, setChartVisibility] = useState({
    meanSalaryByCountry: true,
    salaryVsExperience: true,
    educationPie: true,
    salaryGrowthArea: true,
    countryDonut: true,
    topPayingCountries: true,
    stackedEducationByCountry: true,
    experienceScatter: true,
  });

  // Modal state: which chart is currently maximized (null = closed)
  const [modalChartId, setModalChartId] = useState(null);

  // INITIAL LOAD
  useEffect(() => {
    loadInitialAnalytics();
  }, []);

  const loadInitialAnalytics = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await fetchAnalytics();

      const data = res.data;

      const countries =
        data.mean_salary_by_country?.map((item) => item.category) || [];

      const educationLevels = (
        data.education_salary_distribution ||
        data.education_salary_comparison ||
        []
      )
        .map((item) => item.category || item.EdLevel)
        .filter(Boolean);

      const uniqueEducation = Array.from(new Set(educationLevels)).sort();

      setAllCountries(countries);
      setSelectedCountries(countries);

      setAllEducationLevels(uniqueEducation);
      setSelectedEducationLevels(uniqueEducation);

      setAnalytics(data);
    } catch (err) {
      console.error(err);
      setError('Unable to load analytics.');
    } finally {
      setLoading(false);
    }
  };

  // FILTERED FETCH – resets stats and clears error when no countries selected
  useEffect(() => {
    if (selectedCountries.length === 0) {
      // No countries selected → clear analytics, reset loading, and remove any stale error
      setAnalytics(null);
      setLoading(false);
      setError('');          // ✅ Clear error message when no countries
      return;
    }

    const loadFilteredAnalytics = async () => {
      try {
        setLoading(true);
        setError('');        // ✅ Clear error before each fresh fetch

        const res = await fetchFilteredAnalytics(
          selectedCountries,
          experienceRange[0],
          experienceRange[1],
          selectedEducationLevels
        );

        setAnalytics(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to refresh analytics.');  // Only on actual API failure
      } finally {
        setLoading(false);
      }
    };

    loadFilteredAnalytics();
  }, [selectedCountries, selectedEducationLevels, experienceRange]);

  // COUNTRY TOGGLE
  const handleCountryToggle = (country) => {
    setSelectedCountries((prev) =>
      prev.includes(country)
        ? prev.filter((item) => item !== country)
        : [...prev, country]
    );
  };

  // EDUCATION TOGGLE
  const handleEducationToggle = (education) => {
    setSelectedEducationLevels((prev) =>
      prev.includes(education)
        ? prev.filter((item) => item !== education)
        : [...prev, education]
    );
  };

  // SELECT / CLEAR
  const handleSelectAllCountries = () => setSelectedCountries(allCountries);
  const handleClearAllCountries = () => setSelectedCountries([]);
  const handleSelectAllEducation = () =>
    setSelectedEducationLevels(allEducationLevels);
  const handleClearAllEducation = () => setSelectedEducationLevels([]);

  // Modal controls
  const openModal = (chartId) => setModalChartId(chartId);
  const closeModal = () => setModalChartId(null);

  // FILTER SEARCH
  const visibleCountries = useMemo(() => {
    return allCountries.filter((country) =>
      country.toLowerCase().includes(countrySearch.toLowerCase())
    );
  }, [allCountries, countrySearch]);

  const visibleEducationLevels = useMemo(() => {
    return allEducationLevels.filter((level) =>
      level.toLowerCase().includes(educationSearch.toLowerCase())
    );
  }, [allEducationLevels, educationSearch]);

  // STATS – reset to 0 when no valid data
  const hasValidData = selectedCountries.length > 0 && analytics;
  const avgSalary = hasValidData ? analytics?.summary_stats?.average_salary ?? 0 : 0;
  const highestSalary = hasValidData ? analytics?.summary_stats?.highest_salary ?? 0 : 0;
  const lowestSalary = hasValidData ? analytics?.summary_stats?.lowest_salary ?? 0 : 0;
  const totalRecords = hasValidData ? analytics?.summary_stats?.total_records ?? 0 : 0;

  // Data preparations for each chart
  const educationPieData = (analytics?.education_salary_distribution || []).filter(
    (item) => selectedEducationLevels.includes(item.category)
  );

  const countryDistribution = analytics?.country_distribution || [];

  const experiencePoints = analytics?.experience_salary_points || [];

  const filteredExperiencePoints = experiencePoints.filter(
    (item) =>
      item.experience >= experienceRange[0] &&
      item.experience <= experienceRange[1]
  );

  const topPayingCountries = (analytics?.mean_salary_by_country || [])
    .slice()
    .sort((a, b) => b.mean_salary - a.mean_salary)
    .slice(0, 8);

  const stackedEducationData = useMemo(() => {
    if (!analytics?.education_salary_by_country) return [];

    const grouped = {};

    analytics.education_salary_by_country.forEach((item) => {
      if (!selectedEducationLevels.includes(item.education)) return;

      if (!grouped[item.country]) {
        grouped[item.country] = {
          country: item.country,
        };
      }

      grouped[item.country][item.education] = item.mean_salary;
    });

    return Object.values(grouped);
  }, [analytics, selectedEducationLevels]);

  // Helper to render chart inside modal or grid (reusable)
  const renderChartContent = (chartId, isModal = false) => {
    const commonProps = {
      width: '100%',
      height: isModal ? '100%' : 320,
    };

    switch (chartId) {
      case 'meanSalaryByCountry':
        return analytics?.mean_salary_by_country?.length ? (
          <ResponsiveContainer {...commonProps}>
            <BarChart data={analytics.mean_salary_by_country}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Bar dataKey="mean_salary" fill="#2563eb" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500">No data</div>
        );

      case 'salaryVsExperience':
        return filteredExperiencePoints.length ? (
          <ResponsiveContainer {...commonProps}>
            <LineChart data={filteredExperiencePoints}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="experience" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Line type="monotone" dataKey="mean_salary" stroke="#10b981" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500">No data</div>
        );

      case 'educationPie':
        return educationPieData.length ? (
          <ResponsiveContainer {...commonProps}>
            <PieChart>
              <Pie data={educationPieData} dataKey="mean_salary" nameKey="category" innerRadius={60} outerRadius={100}>
                {educationPieData.map((entry, index) => (
                  <Cell key={index} fill={chartColors[index % chartColors.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500">No data</div>
        );

      case 'salaryGrowthArea':
        return filteredExperiencePoints.length ? (
          <ResponsiveContainer {...commonProps}>
            <AreaChart data={filteredExperiencePoints}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="experience" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Area type="monotone" dataKey="mean_salary" fill="#f59e0b" stroke="#d97706" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500">No data</div>
        );

      case 'countryDonut':
        return countryDistribution.length ? (
          <ResponsiveContainer {...commonProps}>
            <PieChart>
              <Pie data={countryDistribution} dataKey="count" nameKey="country" innerRadius={60} outerRadius={100} label>
                {countryDistribution.map((entry, index) => (
                  <Cell key={index} fill={chartColors[index % chartColors.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatNumber(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500">No data</div>
        );

      case 'topPayingCountries':
        return topPayingCountries.length ? (
          <ResponsiveContainer {...commonProps}>
            <BarChart data={topPayingCountries} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="category" type="category" width={100} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Bar dataKey="mean_salary" fill="#ec4899" radius={[0, 10, 10, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500">No data</div>
        );

      case 'stackedEducationByCountry':
        return stackedEducationData.length ? (
          <ResponsiveContainer {...commonProps}>
            <BarChart data={stackedEducationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="country" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              {selectedEducationLevels.map((level, idx) => (
                <Bar key={level} dataKey={level} stackId="a" fill={chartColors[idx % chartColors.length]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500">No data</div>
        );

      case 'experienceScatter':
        return filteredExperiencePoints.length ? (
          <ResponsiveContainer {...commonProps}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="experience" type="number" />
              <YAxis dataKey="mean_salary" type="number" />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Scatter data={filteredExperiencePoints} fill="#8b5cf6" />
            </ScatterChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500">No data</div>
        );

      default:
        return null;
    }
  };

  // Chart header with Max button only
  const renderChartHeader = (title, description, chartId) => (
    <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => openModal(chartId)}
          className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
        >
          Max
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* HEADER with badge and gradient title */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-1.5 border border-sky-200 shadow-sm mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
            </span>
            <span className="text-sm font-medium text-sky-700">Data Insights</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Salary Trends &{' '}
            <span className="bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
              Workforce Insights
            </span>
          </h1>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Explore salary analytics interactively using country, education, and experience filters.
            Gain valuable insights from real-world data.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
          {/* SIDEBAR */}
          <section className="space-y-6">
            {/* FILTERS */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Filters</h2>

              {/* COUNTRY */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold">Countries</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSelectAllCountries}
                      className="text-xs px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200"
                    >
                      Select All
                    </button>
                    <button
                      onClick={handleClearAllCountries}
                      className="text-xs px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
                <input
                  type="search"
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  placeholder="Search country"
                  className="w-full border border-slate-200 rounded-2xl px-4 py-2 text-sm"
                />
                <div className="max-h-64 overflow-y-auto mt-3 border border-slate-200 rounded-3xl p-3">
                  {visibleCountries.map((country) => (
                    <label
                      key={country}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCountries.includes(country)}
                        onChange={() => handleCountryToggle(country)}
                      />
                      <span className="text-sm">{country}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* EDUCATION */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold">Education</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSelectAllEducation}
                      className="text-xs px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200"
                    >
                      Select All
                    </button>
                    <button
                      onClick={handleClearAllEducation}
                      className="text-xs px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
                <input
                  type="search"
                  value={educationSearch}
                  onChange={(e) => setEducationSearch(e.target.value)}
                  placeholder="Search education"
                  className="w-full border border-slate-200 rounded-2xl px-4 py-2 text-sm"
                />
                <div className="max-h-52 overflow-y-auto mt-3 border border-slate-200 rounded-3xl p-3">
                  {visibleEducationLevels.map((education) => (
                    <label
                      key={education}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50"
                    >
                      <input
                        type="checkbox"
                        checked={selectedEducationLevels.includes(education)}
                        onChange={() => handleEducationToggle(education)}
                      />
                      <span className="text-sm">{education}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* EXPERIENCE */}
              <div className="mt-6 border border-slate-200 rounded-3xl p-4 bg-slate-50">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold">Experience Range</h3>
                  <span className="text-xs font-semibold">
                    {experienceRange[0]} - {experienceRange[1]} yrs
                  </span>
                </div>
                <div className="mt-4">
                  <label className="text-sm">Minimum Experience</label>
                  <input
                    type="range"
                    min={0}
                    max={50}
                    value={experienceRange[0]}
                    onChange={(e) =>
                      setExperienceRange([
                        Math.min(Number(e.target.value), experienceRange[1]),
                        experienceRange[1],
                      ])
                    }
                    className="w-full mt-2"
                  />
                </div>
                <div className="mt-4">
                  <label className="text-sm">Maximum Experience</label>
                  <input
                    type="range"
                    min={0}
                    max={50}
                    value={experienceRange[1]}
                    onChange={(e) =>
                      setExperienceRange([
                        experienceRange[0],
                        Math.max(Number(e.target.value), experienceRange[0]),
                      ])
                    }
                    className="w-full mt-2"
                  />
                </div>
              </div>
            </div>

            {/* CHART VISIBILITY */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Chart Visibility</h2>
              <div className="space-y-3">
                {chartSections.map((section) => (
                  <label
                    key={section.id}
                    className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3"
                  >
                    <input
                      type="checkbox"
                      checked={chartVisibility[section.id]}
                      onChange={() =>
                        setChartVisibility((prev) => ({
                          ...prev,
                          [section.id]: !prev[section.id],
                        }))
                      }
                    />
                    <span className="text-sm">{section.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </section>

          {/* MAIN CONTENT */}
          <section className="space-y-6">
            {/* STATS CARDS */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-700 text-white p-5 shadow-md">
                <p className="text-sm">Average Salary</p>
                <p className="text-3xl font-bold mt-3">{formatCurrency(avgSalary)}</p>
              </div>
              <div className="rounded-3xl bg-gradient-to-br from-cyan-500 to-sky-600 text-white p-5 shadow-md">
                <p className="text-sm">Highest Salary</p>
                <p className="text-3xl font-bold mt-3">{formatCurrency(highestSalary)}</p>
              </div>
              <div className="rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-5 shadow-md">
                <p className="text-sm">Lowest Salary</p>
                <p className="text-3xl font-bold mt-3">{formatCurrency(lowestSalary)}</p>
              </div>
              <div className="rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 text-white p-5 shadow-md">
                <p className="text-sm">Total Records</p>
                <p className="text-3xl font-bold mt-3">{formatNumber(totalRecords)}</p>
              </div>
            </div>

            {/* NO COUNTRY MESSAGE */}
            {!selectedCountries.length && (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 backdrop-blur-sm p-16 text-center">
                <p className="text-2xl font-bold text-slate-900">
                  Select at least one country
                </p>
                <p className="mt-2 text-slate-500">
                  Filters remain visible. Select countries from the left sidebar.
                </p>
              </div>
            )}

            {/* LOADING */}
            {loading && selectedCountries.length > 0 && (
              <div className="bg-white rounded-3xl p-16 text-center shadow-sm">
                <div className="animate-spin h-10 w-10 border-b-2 border-sky-600 rounded-full mx-auto"></div>
                <p className="mt-4 text-slate-600">Loading analytics...</p>
              </div>
            )}

            {/* ERROR – only shown when there's an actual API error and countries are selected */}
            {error && selectedCountries.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-3xl p-4 text-red-700">
                {error}
              </div>
            )}

            {/* CHARTS GRID */}
            {!loading && selectedCountries.length > 0 && !error && (
              <div className="grid gap-6 xl:grid-cols-2">
                {chartSections.map((section) => {
                  if (!chartVisibility[section.id]) return null;
                  return (
                    <div key={section.id} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                      {renderChartHeader(section.label, `Insights for ${section.label}`, section.id)}
                      <div className="h-[320px] w-full">
                        {renderChartContent(section.id, false)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* MODAL OVERLAY */}
        {modalChartId !== null && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300"
            onClick={closeModal}
          >
            <div
              className="relative bg-white rounded-3xl shadow-2xl w-[90vw] h-[85vh] p-6 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-slate-900">
                  {chartSections.find(s => s.id === modalChartId)?.label || 'Chart'}
                </h2>
                <button
                  onClick={closeModal}
                  className="rounded-full p-2 hover:bg-slate-100 transition"
                >
                  <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 w-full min-h-0">
                {renderChartContent(modalChartId, true)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}