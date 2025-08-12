import React, { useState, useRef, useEffect } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import logo from "./../../../src/assets/simproVerticallogo.png";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { subDays, format } from "date-fns";
import { CalendarIcon } from "@heroicons/react/24/outline";
import { useSelector } from "react-redux";

function Jobs() {
  const companyID = useSelector((state) => state.company?.companyID);
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDateRange, setShowDateRange] = useState(false);
  const [dateRange, setDateRange] = useState([
    {
      startDate: subDays(new Date(), 7),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  const dateRangeRef = useRef(null);

  // Fetch jobs from API
  useEffect(() => {
    if (!companyID) return;
    fetch(`/jobs/alljobs?companyID=${companyID}`)
      .then((res) => res.json())
      .then((data) => setJobs(data))
      .catch((err) => console.error("Error fetching jobs:", err));
  }, [companyID]);

  const handleDateChange = (ranges) => {
    const { selection } = ranges;
    if (selection.endDate <= new Date()) {
      setDateRange([selection]);
      setShowDateRange(false);
    }
  };

  // Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dateRangeRef.current && !dateRangeRef.current.contains(event.target)) {
        setShowDateRange(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter jobs based on search and date range
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.title
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

    const jobDate = new Date(job.createdAt);
    const inDateRange =
      jobDate >= dateRange[0].startDate && jobDate <= dateRange[0].endDate;

    return matchesSearch && inDateRange;
  });

  return (
    <>
      <Sidebar />

      <div className="flex flex-col h-screen  md:ml-[250px] overflow-x-hidden">
        {/* header & logo */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-12 border-b w-full">
          <h1 className="text-3xl font-semibold text-gray-800">Jobs</h1>
          <img src={logo} alt="Company Logo" className="h-12 w-auto" />
        </header>

        {/* Filters */}
        <div className="sticky top-0 z-10 bg-white shadow-sm p-4 border-b border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-7xl mx-auto">
            {/* Search Bar */}
            <div className="relative col-span-1 sm:col-span-2 md:col-span-1">
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                type="text"
                placeholder="Search jobs..."
                className="w-full px-4 py-2 bg-white text-gray-800 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:bg-gray-50 shadow-sm text-sm"
              />
              <svg
                className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* Date Range Picker */}
            <div className="col-span-1 relative" ref={dateRangeRef}>
              <div
                className="flex items-center p-2 border border-gray-300 rounded-lg cursor-pointer bg-white hover:bg-gray-50 transition"
                onClick={() => setShowDateRange(!showDateRange)}
              >
                <CalendarIcon className="h-5 w-5 mr-2 text-gray-500" />
                <div>
                  <h2 className="text-sm font-semibold text-gray-700">
                    Date Range
                  </h2>
                  <p className="text-xs text-gray-600">
                    {format(dateRange[0].startDate, "MMM dd, yyyy")} -{" "}
                    {format(dateRange[0].endDate, "MMM dd, yyyy")}
                  </p>
                </div>
              </div>

              {showDateRange && (
                <div className="absolute z-50 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                  <DateRange
                    editableDateInputs={true}
                    onChange={handleDateChange}
                    moveRangeOnFirstSelection={false}
                    ranges={dateRange}
                    maxDate={new Date()}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="container mx-auto px-4 sm:px-6 py-8 flex-1 max-w-full overflow-x-hidden">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            {filteredJobs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No jobs found.
              </div>
            ) : (
              <table className="w-full table-fixed divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-normal break-words text-sm font-medium text-gray-900">
                        {job.title}
                      </td>
                      <td className="px-6 py-4 whitespace-normal break-words text-sm text-gray-500">
                        {job.department || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(job.createdAt), "MMM dd, yyyy")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Jobs;