import { useEffect, useState } from "react";
import companylogo from "../../assets/companyLogo.png";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setPrebuildData } from "../../store/slices/PrebuildSlice";
import { useSelector } from "react-redux";
import { clearPrebuildItem } from "../../store/slices/PrebuildSlice";
import { ArrowPathIcon } from "@heroicons/react/24/outline";


export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const companyId = useSelector((state) => state.prebuild.companyId);

  const BASE_URL = import.meta.env.VITE_API_URL;
  

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
  if (companyId) {
    dispatch(clearPrebuildItem());
  }
}, [companyId]);

  useEffect(() => {
    fetch(`${BASE_URL}/user/companies`)
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
      })
      .then((data) => {
        if (data && data.companies) {
          setCompanies(data.companies);
        } else {
          console.error("Unexpected data format:", data);
        }
      })

      .catch((err) => {
        console.log("Error while fetching companies", err);
      });
  }, [BASE_URL]);

  const handleNext = async () => {
  const selectedCompanyID = companies.find(
    (company) => company.ID === +selectedCompany
  )?.ID;

  if (!selectedCompanyID) {
    alert("Please select a company first");
    return;
  }

  setIsLoading(true);  // Loading start

  try {
    const response = await fetch(
      `${BASE_URL}/prebuilds/allprebuilds?companyID=${selectedCompanyID}`);
    if (response.ok) {
      const data = await response.json();

      dispatch(
        setPrebuildData({
          prebuilds: data.prebuilds,
          companyId: selectedCompanyID,
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

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen"
      style={{
        background: "linear-gradient(135deg, #1f1c2c 0%, #928DAB 100%)",
      }}
    >
      <div className="flex flex-col w-full max-w-4xl p-8 bg-white rounded-lg shadow-xl backdrop-blur-sm bg-opacity-90">
        <div className="flex items-center justify-between w-full mb-8">
          <div className="flex items-center w-1/2">
            <img
              src={companylogo}
              alt="Company"
              className="h-12 w-12 mr-4 object-contain"
            />
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
              placeholder="Select a Company"
            >
              <option value="">Select a company</option>
              {companies.map((company) => (
                <option key={company.ID} value={company.ID}>
                  {company.Name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
  onClick={handleNext}
  disabled={isLoading}
  className={`px-8 py-3 text-lg font-medium text-white rounded-lg shadow-md focus:outline-none transition-all transform hover:scale-105
    ${isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"}`}
>
  {isLoading ? (
    <>
      <ArrowPathIcon className="animate-spin h-6 w-6 mr-2 inline-block" />
      Loading...
    </>
  ) : (
    "Get Prebuilds →"
  )}
</button>
        </div>
      </div>
    </div>
  );
}
