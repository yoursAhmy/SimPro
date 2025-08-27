
import React, { useState, useRef, useEffect } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import verticalLogo from "../../assets/simproSilverHorizantalLogo.png";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import axios from "axios";
import { format, isAfter, isSameDay } from "date-fns";
import {
  CalendarIcon,
  DocumentArrowDownIcon,
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { FiLoader } from "react-icons/fi";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useSelector, useDispatch } from "react-redux";
import { setCatalogs } from "../../store/slices/CatalogSlice";

function Catalogs() {
  const catalogItems = useSelector((state) => state.catalog.catalogs);
  const companyID = useSelector((state) => state.prebuild?.companyId);
  const BASE_URL = import.meta.env.VITE_API_URL;
  const dispatch = useDispatch();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [showDateRange, setShowDateRange] = useState(false);
  const [loading, setLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(2016, 0, 1),
      endDate: new Date(2018, 11, 31),
      key: "selection",
    },
  ]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [calendarMonths, setCalendarMonths] = useState(2);
  const [isSelectingStartDate, setIsSelectingStartDate] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedItemIds, setSelectedItemIds] = useState([]);
  const [error, setError] = useState(null);
  const [showArchivePopup, setShowArchivePopup] = useState(false);

  const dateRangeRef = useRef(null);

  // Responsive calendar months
  useEffect(() => {
    const handleResize = () => {
      setCalendarMonths(window.innerWidth < 768 ? 1 : 2);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Reset currentPage when searchTerm or filterStatus changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  // Handle click outside to close date range picker
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dateRangeRef.current &&
        !dateRangeRef.current.contains(event.target)
      ) {
        setShowDateRange(false);
        setIsSelectingStartDate(true);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch catalogs
  const fetchCatalogs = () => {
    if (companyID === null || companyID === undefined) {
      setError("Company ID not found");
      return;
    }
    setButtonLoading(true);
    setLoading(true);
    setError(null);
    fetch(
      `${BASE_URL}/catalogs/allcatalogs?companyID=${companyID}&page=1&startDate=${format(
        dateRange[0].startDate,
        "yyyy-MM-dd"
      )}&endDate=${format(dateRange[0].endDate, "yyyy-MM-dd")}`
    )
      .then((res) =>
        res.ok ? res.json() : Promise.reject("Failed to fetch catalogs")
      )
      .then((data) => {
        dispatch(setCatalogs(data.catalogs || []));
        setIsSubmitted(true);
      })
      .catch((error) => {
        setError(error.message || "An error occurred while fetching catalogs");
      })
      .finally(() => {
        setButtonLoading(false);
        setLoading(false);
      });
  };

  // Handle date range changes
  const handleDateChange = (ranges) => {
    const { selection } = ranges;
    const { startDate, endDate } = selection;

    if (isSelectingStartDate) {
      setDateRange([
        { ...selection, startDate, endDate: dateRange[0].endDate },
      ]);
      setIsSelectingStartDate(false);
    } else {
      if (
        !isAfter(startDate, endDate) &&
        !isSameDay(startDate, endDate) &&
        !isAfter(endDate, new Date())
      ) {
        setDateRange([selection]);
      } else {
        setDateRange([{ ...selection, endDate: dateRange[0].endDate }]);
      }
    }
  };

  const handleDone = () => {
    if (
      dateRange[0].startDate &&
      dateRange[0].endDate &&
      !isSameDay(dateRange[0].startDate, dateRange[0].endDate) &&
      !isAfter(dateRange[0].endDate, new Date()) &&
      !isAfter(dateRange[0].startDate, dateRange[0].endDate)
    ) {
      setShowDateRange(false);
      setIsSelectingStartDate(true);
    }
  };

  // Handle row click and checkbox toggle
  const handleRowClick = (id, archived) => {
    if (archived) return;
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  // Filter items based on search term and status
  const currentItems = catalogItems.filter((item) => {
    const matchesSearch =
      item.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ID.toString().includes(searchTerm);
    const matchesStatus =
      filterStatus === "ALL" ||
      (filterStatus === "Active" && !item.Archived) ||
      (filterStatus === "Archived" && item.Archived);
    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(currentItems.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedItems = currentItems.slice(indexOfFirstItem, indexOfLastItem);

  // Download PDF
  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Catalog Items", 14, 20);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Generated on: ${format(new Date(), "MMM dd, yyyy")}`, 14, 30);
    doc.text(
      `Date Range: ${format(dateRange[0].startDate, "MMM dd, yyyy")} - ${format(
        dateRange[0].endDate,
        "MMM dd, yyyy"
      )}`,
      14,
      38
    );

    autoTable(doc, {
      startY: 46,
      head: [["ID", "Name", "Status"]],
      body: currentItems.map((item) => [
        String(item.ID || "N/A"),
        String(item.Name || "N/A"),
        item.Archived ? "Archived" : "Active",
      ]),
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 10 },
      margin: { top: 46, left: 14, right: 14 },
    });

    doc.save(`catalogs_report_${format(new Date(), "MMM dd, yyyy")}.pdf`);
  };

  const handleBack = () => {
    setIsSubmitted(false);
    dispatch(setCatalogs([]));
    setShowDateRange(false);
    setIsSelectingStartDate(true);
    setCurrentPage(1);
    setSelectedItemIds([]);
    setFilterStatus("ALL");
    setError(null);
    setShowArchivePopup(false);
  };

  const archiveCatalogItems = async () => {
    if (!companyID) {
      setError("Company ID not found");
      return;
    }
    if (selectedItemIds.length === 0) {
      setError("Please select at least one item to archive");
      return;
    }
    try {
      setButtonLoading(true);
      const response = await axios.post(
        `${BASE_URL}/catalogs/archivecatalogs`,
        JSON.stringify({
          catalogIDs: selectedItemIds,
          companyID: companyID,
        }),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 200) {
        console.log("Archived successfully");
        setSelectedItemIds([]);
        fetchCatalogs();
      } else {
        setError("Archive operation failed");
      }
    } catch (err) {
      console.error("Error while archiving items:", err);
      setError(
        err.response?.data?.message ||
          "Failed to archive items. Please try again."
      );
    } finally {
      setButtonLoading(false);
      setShowArchivePopup(false);
    }
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Generate pagination range
  const getPaginationRange = () => {
    const range = [];
    const maxVisiblePages = 5;
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        range.push(i);
      }
    } else {
      range.push(1);
      if (currentPage > 3) range.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        range.push(i);
      }
      if (currentPage < totalPages - 2) range.push("...");
      range.push(totalPages);
    }
    return range;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="min-h-screen bg-gray-50 text-gray-800 font-sans flex relative"
    >
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-white sticky top-0 z-10 shadow-sm h-16 flex items-center justify-between px-6 border-b">
          <h1
            className="text-md md:text-2xl ml-10 lg:ml-0 font-semibold text-gray-800 hover:text-[var(--color-primary)] cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            Material Catalog Items
          </h1>
          <img src={verticalLogo} alt="Company Logo" className="h-10 w-auto" />
        </header>

        {!isSubmitted ? (
          <div className="flex-1 flex flex-col items-center pt-10">
            <div className="bg-white shadow-lg rounded-lg p-6 max-w-md w-full">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Select Date Range
              </h2>
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
              <div className="relative" ref={dateRangeRef}>
                <div
                  className="flex items-center h-[50px] px-5 py-4 bg-white border border-gray-200 rounded shadow-lg cursor-pointer hover:bg-gray-50 transition-all duration-200"
                  onClick={() => setShowDateRange(!showDateRange)}
                >
                  <CalendarIcon className="h-5 w-5 mr-2 text-gray-500" />
                  <div className="truncate">
                    <p className="text-lg font-semibold text-gray-700 truncate">
                      Date Range
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {format(dateRange[0].startDate, "MMM dd, yyyy")} -{" "}
                      {format(dateRange[0].endDate, "MMM dd, yyyy")}
                    </p>
                  </div>
                </div>
                {showDateRange && (
                  <div className="absolute z-50 top-[-100%] left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg p-4">
                    <DateRange
                      editableDateInputs={true}
                      onChange={handleDateChange}
                      moveRangeOnFirstSelection={false}
                      ranges={dateRange}
                      maxDate={new Date()}
                      className="border-0 w-full"
                      months={calendarMonths}
                      direction="up"
                    />
                    <button
                      onClick={handleDone}
                      className="mt-2 w-full text-white py-2 px-4 rounded-lg hover:bg-[#0095CC] transition-all duration-200 cursor-pointer bg-[var(--color-primary)]"
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={fetchCatalogs}
                disabled={
                  buttonLoading ||
                  isSameDay(dateRange[0].startDate, dateRange[0].endDate) ||
                  isAfter(dateRange[0].startDate, dateRange[0].endDate)
                }
                className="mt-4 w-full bg-[var(--color-primary)] text-white py-2 px-4 rounded-lg hover:bg-[#0095CC] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {buttonLoading ? (
                  <FiLoader className="h-5 w-5 animate-spin mx-auto" />
                ) : (
                  "Get Catalogs"
                )}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white shadow-sm p-2 sm:p-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between max-w-7xl mx-auto space-y-2 sm:space-y-0 sm:space-x-2">
                <div className="flex flex-row items-center space-x-2 w-full sm:w-auto">
                  <div className="flex-shrink-0">
                    <button
                      onClick={handleBack}
                      className="flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 bg-white border border-gray-200 rounded shadow-md cursor-pointer hover:bg-gray-50 transition-all duration-200"
                    >
                      <ArrowLeftIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                    </button>
                  </div>
                  <div className="flex-grow">
                    <input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      type="text"
                      placeholder="Search Catalogs Items..."
                      className="w-full sm:w-[300px] md:w-[400px] shadow-lg border border-gray-200 rounded px-3 sm:px-5 h-8 sm:h-10 py-1 sm:py-2 text-sm sm:text-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-all"
                    />
                  </div>
                </div>
                <div className="flex-grow">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full sm:w-[150px] md:w-[200px] shadow-lg border border-gray-200 rounded px-3 sm:px-5 h-8 sm:h-10 py-1 sm:py-2 text-sm sm:text-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-all bg-white text-gray-700"
                  >
                    <option value="ALL">All</option>
                    <option value="Active">Active</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
                <div className="flex flex-row justify-end space-x-2 w-full sm:w-auto">
                  <button
                    onClick={() => setShowArchivePopup(true)}
                    disabled={buttonLoading || selectedItemIds.length === 0}
                    className="flex items-center bg-[var(--color-primary)] justify-center w-full sm:w-auto h-8 sm:h-10 px-2 sm:px-5 py-1 sm:py-2 border border-gray-200 rounded shadow-md cursor-pointer hover:bg-[#0095CC] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-lg text-white"
                  >
                    {buttonLoading ? (
                      <FiLoader className="h-4 w-4 sm:h-5 sm:w-5 animate-spin mx-auto" />
                    ) : (
                      <span className="font-semibold">Archive</span>
                    )}
                  </button>
                  <button
                    onClick={downloadPDF}
                    className="flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 bg-white border border-gray-200 rounded-full shadow-md hover:bg-gray-200 transition-all duration-200"
                    title="Download as PDF"
                  >
                    <DocumentArrowDownIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
            {error && (
              <div className="text-center py-4">
                <p className="text-red-500">{error}</p>
              </div>
            )}
            <div className="container mx-auto px-4 sm:px-6 py-4">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                  {loading ? (
                    <div className="flex flex-col justify-center text-[var(--color-primary)] items-center py-12">
                      <FiLoader className="h-8 w-8 animate-spin" />
                      <p>Loading Catalogs...</p>
                    </div>
                  ) : currentItems.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No catalog items found.</p>
                    </div>
                  ) : (
                    <>
                      <table className="w-full table-fixed divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-3 text-left text-[0.7rem] sm:text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">
                              Select
                            </th>
                            <th className="px-3 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-3 text-left text-[0.7rem] sm:text-xs font-medium text-gray-500 uppercase tracking-wider w-[20%]">
                              ID
                            </th>
                            <th className="px-3 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-3 text-left text-[0.7rem] sm:text-xs font-medium text-gray-500 uppercase tracking-wider w-[50%]">
                              Name
                            </th>
                            <th className="px-3 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-3 text-left text-[0.7rem] sm:text-xs font-medium text-gray-500 uppercase tracking-wider w-[20%]">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {paginatedItems.map((catalogItem) => (
                            <tr
                              key={catalogItem.ID}
                              onClick={() => handleRowClick(catalogItem.ID, catalogItem.Archived)}
                              className={`${
                                selectedItemIds.includes(catalogItem.ID)
                                  ? "bg-blue-100"
                                  : "hover:bg-gray-50"
                              } transition-colors duration-150 ${!catalogItem.Archived ? "cursor-pointer" : "cursor-default"}`}
                            >
                              <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-2 text-[0.75rem] sm:text-sm font-medium text-gray-900 w-[10%]">
                                {!catalogItem.Archived && (
                                  <input
                                    type="checkbox"
                                    checked={selectedItemIds.includes(catalogItem.ID)}
                                    onChange={() => handleRowClick(catalogItem.ID, catalogItem.Archived)}
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                  />
                                )}
                              </td>
                              <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-2 text-[0.75rem] sm:text-sm font-medium text-gray-900 w-[20%]">
                                {catalogItem.ID || "N/A"}
                              </td>
                              <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 text-[0.75rem] sm:text-sm font-medium text-gray-900 truncate overflow-hidden">
                                {catalogItem.Name || "N/A"}
                              </td>
                              <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-2 text-[0.75rem] sm:text-sm font-medium text-gray-900 w-[20%]">
                                {catalogItem.Archived ? "Archived" : "Active"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {currentItems.length > itemsPerPage && (
                        <div className="bg-gray-50 px-6 py-3 flex items-center justify-around border-t border-gray-200">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handlePageChange(currentPage - 1)}
                              disabled={currentPage === 1}
                              className="relative inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-white bg-[var(--color-primary)] hover:bg-[#0095CC] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <ChevronLeftIcon className="h-5 w-5" />
                            </button>
                            {getPaginationRange().map((page, index) => (
                              <React.Fragment key={index}>
                                {page === "..." ? (
                                  <span className="px-3 py-1 text-sm text-gray-500">
                                    ...
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handlePageChange(page)}
                                    className={`px-3 py-1 border rounded-md text-sm ${
                                      currentPage === page
                                        ? "bg-[var(--color-primary)] text-white"
                                        : "bg-white text-gray-700 hover:bg-gray-100"
                                    }`}
                                    aria-current={currentPage === page ? "page" : undefined}
                                  >
                                    {page}
                                  </button>
                                )}
                              </React.Fragment>
                            ))}
                            <button
                              onClick={() => handlePageChange(currentPage + 1)}
                              disabled={currentPage === totalPages}
                              className="relative inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-white bg-[var(--color-primary)] hover:bg-[#0095CC] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <ChevronRightIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
            {showArchivePopup && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md sm:max-w-lg mx-4 sm:mx-auto">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Confirm Archive
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Are you sure you want to archive the selected items?
                  </p>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setShowArchivePopup(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-all duration-200"
                    >
                      No
                    </button>
                    <button
                      onClick={archiveCatalogItems}
                      disabled={buttonLoading}
                      className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-md hover:bg-[#0095CC] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {buttonLoading ? (
                        <FiLoader className="h-5 w-5 animate-spin mr-2" />
                      ) : null}
                      Archive
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}

export default Catalogs;