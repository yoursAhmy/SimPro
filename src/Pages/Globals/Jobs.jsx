import React, { useState, useEffect } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import logo from "../../assets/simproSilverHorizantalLogo.png";
import { useSelector } from "react-redux";
const BASE_URL = import.meta.env.VITE_API_URL;
import axios from "axios";
import { selectCompanyId } from "../../store/slices/PrebuildSlice";
import { useRef } from "react";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { DateRange } from "react-date-range";
import { CalendarIcon } from "@heroicons/react/24/outline";
import { FiLoader } from "react-icons/fi";
import { format, subYears } from "date-fns";




function Jobs() {
  const companyID = useSelector(selectCompanyId);
  const [jobs, setJobs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 20;
const [selectedJob, setSelectedJob] = useState(null);
const [loading, setLoading] = useState(true);
// Date picker states\


const [showCalendar, setShowCalendar] = useState(false);

  const today = format(new Date(), "yyyy-MM-dd");
  const twoYearsAgo = format(subYears(new Date(), 2), "yyyy-MM-dd");


  const [dateRange, setDateRange] = useState([
    {
      startDate: twoYearsAgo,
      endDate: today,
      key: "selection",
    },
  ]);

const formatDate = (date) => format(date, "MMM dd, yyyy");


// date
// Date filter states

// Filter states
const [searchTerm, setSearchTerm] = useState("");

const [filterStage, setFilterStage] = useState("");

// Apply filters
const filteredJobs = jobs.filter((job) => {
  const matchesSearch = searchTerm
    ? (
        job.ID?.toString() + " " +
        (job.Description?.replace(/<[^>]+>/g, "") || "")
      )
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    : true;

  const matchesStage = filterStage ? job.Stage === filterStage : true;

return matchesSearch && matchesStage;


});





  // Fetch jobs from API
  useEffect(() => {
  if (!companyID) return;
      const start = format(dateRange[0].startDate, "yyyy-MM-dd");
      const end = format(dateRange[0].endDate, "yyyy-MM-dd");

  setLoading(true);

  axios
    .get(`${BASE_URL}/jobs/alljobs?companyID=${companyID}&startDate=${start}&endDate=${end}`)
    .then((res) => {
      let data = [];
      if (Array.isArray(res.data)) {
        data = res.data;
      } else if (Array.isArray(res.data.jobs)) {
        data = res.data.jobs;
      }
      setJobs(data);
      setCurrentPage(1);
      setLoading(false); // stop loader when data is ready
    })
    .catch((err) => {
      console.error(err);
      setLoading(false);
    });
}, [companyID, dateRange]);

  // Pagination calculations
  const indexOfLastJob = currentPage * rowsPerPage;
  const indexOfFirstJob = indexOfLastJob - rowsPerPage;
  const totalPages = Math.ceil(filteredJobs.length / rowsPerPage);
const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
<div className="flex  min-h-screen md:h-screen md:overflow-hidden">

        <Sidebar />
      

      <div className="flex flex-col h-screen w-full overflow-x-hidden">
        {/* Header & Logo */}
        <header className="flex  justify-between items-center  bg-white shadow-sm h-16 mb-2  px-10 sm:px-6 md:px-12 border-b w-full">

          <h1 className="text-3xl ml-10 lg:ml-0  font-semibold text-gray-800">Jobs</h1>
          <img src={logo} alt="Company Logo" className="h-12 w-auto" />
        </header>
        {/* search filter  */}

<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 shadow-md bg-white p-4 w-full">

  {/* Combined ID & Description Filter */}
<input
  type="text"
  placeholder="Search by ID or Description"
  value={searchTerm}
  onChange={(e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  }}
  className="shadow-lg border border-gray-200 rounded px-5 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
/>


  {/* Filter by Stage */}
  <select
    value={filterStage}
    onChange={(e) => {
      setFilterStage(e.target.value);
      setCurrentPage(1);
    }}
    className="shadow-lg border border-gray-300  rounded px-4 py-4  text-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
  >
    <option value="">All Stages</option>
    {[...new Set(jobs.map((job) => job.Stage))].map((stage) => (
      <option key={stage} value={stage}>
        {stage}
      </option>
    ))}
  </select>

{/* Date Filter */}
{/* Date Filter */}
{/* Static Date Range */}
<div className="relative">
  <div
    className="flex items-center p-3 border border-gray-300 rounded-lg bg-white cursor-pointer"
    onClick={() => setShowCalendar(!showCalendar)}
  >
    <CalendarIcon className="h-5 w-5 mr-2 text-gray-500" />
    <div>
      <p className="text-sm font-semibold text-gray-700">Date Range</p>
      <p className="text-xs text-gray-600">
        {formatDate(dateRange[0].startDate)} - {formatDate(dateRange[0].endDate)}
      </p>
    </div>
  </div>

  {showCalendar && ( 
    <div className="absolute mt-2 z-50 mr-8 bg-white shadow-lg border rounded-lg">
      <DateRange
        editableDateInputs={true}
        onChange={(item) => setDateRange([item.selection])}
        moveRangeOnFirstSelection={false}
        ranges={dateRange}
      />
    </div>
  )}
</div>



</div>




        {/* Table */}

        <div className="container mx-auto px-4 sm:px-6 py-8 flex-1 max-w-full overflow-x-hidden">
          <p className="px-6 py-3 text-gray-700 text-lg">
  Showing all {filteredJobs.length} jobs
</p>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
{
loading ? (

   <div className="flex flex-col items-center justify-center py-20">
    <FiLoader className="h-10 w-10 text-blue-500 animate-spin" />
    <p className="mt-4 text-gray-600 font-medium">Loading jobs...</p>
  </div>
):  jobs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No jobs found.</div>
            ) : (
              <>
                <table className="w-full table-fixed divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        ID  
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
  Description
</th>

                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Stage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Date Issued
                      </th>
<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
  Tax
</th>


                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentJobs.map((job) => (
                   <tr
  key={job.ID}
  onClick={() => setSelectedJob(job)}
  className="cursor-pointer hover:bg-gray-100"
>

                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {job.ID}
                                                  </td>
<td className="px-6 py-4 text-sm text-gray-500 relative group">
  <span>
    {job.Description
      ? job.Description.replace(/<[^>]+>/g, "").slice(0, 20) +
        (job.Description.replace(/<[^>]+>/g, "").length > 20 ? "..." : "")
      : "N/A"}
  </span>

  {/* Tooltip */}
  {job.Description && (
    <div className="absolute -top-10 left-0 w-64 bg-white text-blackj  p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
      {job.Description.replace(/<[^>]+>/g, "")}
    </div>
  )}
</td>



                        <td className="px-4 py-2 text-sm sm:text-base text-gray-500"
>{job.Stage}</td>
                        <td className="px-4 py-2 text-sm sm:text-base text-gray-500"
>
                          {new Date(job.DateIssued).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2 text-sm sm:text-base text-gray-500"
>
  {job?.Total?.Tax ?? "N/A"}
</td>

                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* popup */}
 
{selectedJob && (
  <div className="fixed mt-40  inset-0 bg-transparent flex items-center justify-center z-50">
    <div className="bg-white rounded-xl shadow-xl w-96 max-h-[90vh] p-6 relative overflow-hidden">
      {/* Close Button */}
      <button
        className="absolute top-3 right-3 cursor-pointer text-gray-500 hover:text-gray-700 transition"
        onClick={() => setSelectedJob(null)}
      >
        ✖
      </button>

      {/* Title */}
      <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
        Job Details
      </h2>

      {/* Info */}
      <div className="space-y-2   text-sm text-gray-700">
        <p><strong>ID:</strong> {selectedJob.ID}</p>
        <p><strong>Stage:</strong> {selectedJob.Stage}</p>
        <p><strong>Date Issued:</strong> {new Date(selectedJob.DateIssued).toLocaleDateString()}</p>
        <p><strong>ExTax:</strong> {selectedJob?.Total?.ExTax ?? "N/A"}</p>
        <p><strong>IncTax:</strong> {selectedJob?.Total?.IncTax ?? "N/A"}</p>
        <p><strong>Tax:</strong> {selectedJob?.Total?.Tax ?? "N/A"}</p>
      </div>

      {/* Description */}
      <div className="mt-4">
        <strong className="block text-gray-800 mb-2">Description:</strong>
        <div
          className="p-3 border rounded-lg bg-gray-50 max-h-40 overflow-y-auto text-sm leading-relaxed custom-scrollbar"
          dangerouslySetInnerHTML={{ __html: selectedJob.Description }}
        />
      </div>
    </div>
  </div>
)}




                {/* Pagination Controls */}
              <div className="flex flex-col sm:flex-row justify-between items-center p-4 bg-gray-50 border-t gap-2 sm:gap-0">

                  <button
                    onClick={handlePrev}
                    disabled={currentPage === 1}
                    className="px-4 py-2 cursor-pointer  bg-blue-200 text-blue-900   font-semibold  hover:bg-blue-300  rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm    text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-blue-200 text-blue-900  font-semibold  rounded disabled:opacity-50 cursor-pointer  hover:bg-blue-300"
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Jobs;
