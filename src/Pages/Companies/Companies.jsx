import { useEffect, useState } from "react";
import companylogo from "../../assets/companyLogo.png";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setPrebuildData } from "../../store/slices/PrebuildSlice";

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");

  const BASE_URL = import.meta.env.VITE_API_URL;
  

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    fetch(`${BASE_URL}/user/companies`,{
      headers: {
        'ngrok-skip-browser-warning': "true"
      }
    })
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
    const response = await fetch(
      `http://192.168.1.50:3000/user/prebuilds?companyID=${selectedCompanyID}`
    );

    if (response.ok) {
      const data = await response.json();

      dispatch(
        setPrebuildData({
          prebuilds: data.prebuilds,
          companyId: selectedCompanyID,
        })
      );
      navigate("/companies/prebuilds");
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
            className="px-8 py-3 text-lg font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all transform hover:scale-105"
          >
            Get Prebuilds →
          </button>
        </div>
      </div>
    </div>
  );
}

// // src/pages/companies/Companies.jsx
// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import companylogo from "../../assets/companyLogo.png";
// import { useDispatch } from "react-redux";
// import { setPrebuildData } from "../../store/slices/PrebuildSlice"

// export default function Companies() {
//   const [companies, setCompanies] = useState([]);
//   const [selectedCompany, setSelectedCompany] = useState("");

//   const BASE_URL = import.meta.env.VITE_API_URL;
//   const token = localStorage.getItem("token");
//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   useEffect(() => {
//     fetch(`${BASE_URL}/user/companies`)
//       .then((res) => res.json())
//       .then((data) => setCompanies(data.companies || []))
//       .catch((err) => console.error("Error while fetching companies", err));
//   }, [BASE_URL, token]);

//   const handleNext = async () => {
//     const selectedCompanyID = companies.find(
//       (company) => company.ID === +selectedCompany
//     )?.ID;

//     if (!selectedCompanyID) {
//       alert("Please select a company first");
//       return;
//     }

//     const response = await fetch(
//       `${BASE_URL}/user/prebuilds?companyID=${selectedCompanyID}`
//     );

//     if (response.ok) {
//       const data = await response.json();

//       // Save data to Redux Persist
//       dispatch(
//         setPrebuildData({
//           prebuilds: data.prebuilds,
//           companyId: selectedCompanyID,
//         })
//       );

//       navigate("/companies/prebuilds");
//     }
//   };

//   return (
//     <div>
//       <select
//         value={selectedCompany}
//         onChange={(e) => setSelectedCompany(e.target.value)}
//       >
//         <option value="">Select a company</option>
//         {companies.map((company) => (
//           <option key={company.ID} value={company.ID}>
//             {company.Name}
//           </option>
//         ))}
//       </select>

//       <button onClick={handleNext}>Get Prebuilds →</button>
//     </div>
//   );
// }
