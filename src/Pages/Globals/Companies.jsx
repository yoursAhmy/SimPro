import { useEffect, useState } from "react";
import companylogo from "../../assets/companyLogo.png";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  setPrebuildData,
  clearPrebuildItem,
} from "../../store/slices/PrebuildSlice";
import { clearCatalogs } from "../../store/slices/CatalogSlice";
import { FiLoader } from "react-icons/fi";
import { motion } from "framer-motion";

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  const companyId = useSelector((state) => state.prebuild.companyId);
  const BASE_URL = import.meta.env.VITE_API_URL;

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  // Clear on mount or route change
  useEffect(() => {
    dispatch(clearPrebuildItem());
    dispatch(clearCatalogs());
    setSelectedCompany("");
  }, [dispatch, location.pathname]);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await fetch(`${BASE_URL}/user/companies`);
        if (res.ok) {
          const data = await res.json();
          if (data?.companies) {
            setCompanies(data.companies);
            if (data.companies.length > 0 && !selectedCompany) {
              setSelectedCompany(data.companies[0].ID.toString());
            }
          }
        }
      } catch (err) {
        console.error("Error fetching companies", err);
      } finally {
        setIsPageLoading(false);
      }
    };

    fetchCompanies();
  }, [BASE_URL, selectedCompany]);

  const handleNext = async () => {
    if (!selectedCompany) {
      alert("Please select a company first");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/prebuilds/allprebuilds?companyID=${selectedCompany}`
      );
      if (response.ok) {
        const data = await response.json();
        dispatch(
          setPrebuildData({
            prebuilds: data.prebuilds,
            companyId: parseInt(selectedCompany),
          })
        );
        navigate("/companies/prebuilds");
      } else {
        alert("Failed to fetch prebuilds");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  // If page is still fetching companies
  if (isPageLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-gray-900 to-gray-800">
        <FiLoader className="animate-spin text-white text-4xl mb-3" />
        <p className="text-white text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen flex justify-center  from-gray-900 to-gray-800 p-4 sm:p-6"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="w-full max-w-2xl mt-20 h-[300px] bg-white rounded-xl shadow-2xl overflow-hidden mx-4">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
            <div className="flex items-center space-x-3">
              <img
                src={companylogo}
                alt="Company Logo"
                className="h-10 w-10 sm:h-12 sm:w-12 object-contain"
              />
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                Select Company
              </h1>
            </div>
          </div>

          <div className="mb-6 sm:mb-8">
            <label
              htmlFor="company-select"
              className="block text-sm sm:text-base font-medium text-gray-700 mb-2"
            >
              Available Companies
            </label>
            <select
              id="company-select"
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
            >
              {companies.map((company) => (
                <option key={company.ID} value={company.ID}  >
                  {company.Name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleNext}
              disabled={isLoading || !selectedCompany}
              className={`px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base rounded-lg font-medium text-white shadow-md transition-all flex items-center
                ${
                  isLoading || !selectedCompany
                    ? "bg-white cursor-not-allowed"
                    : "bg-[var(--color-primary)] hover:bg-[#0095CC] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                }`}
            >
              {isLoading ? (
                <div className="flex items-center text-[var(--color-primary)]" >
                  <FiLoader className="animate-spin mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Loading...
                </div>
              ) : (
                <>
                  Next <span className="ml-1 hidden sm:inline">→</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
