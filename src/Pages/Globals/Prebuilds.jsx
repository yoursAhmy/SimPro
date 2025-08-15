import { useEffect, useState, useRef } from "react";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { DateRange } from "react-date-range";
import { subDays, format } from "date-fns";
import { CalendarIcon } from "@heroicons/react/24/outline";
import Select from "../../components/ui/Select";
import Sidebar from "../../components/sidebar/Sidebar";
import { useSelector, useDispatch } from "react-redux";
import { setPrebuildItem } from "../../store/slices/PrebuildSlice";
import verticalLogo from "../../assets/simproSilverHorizantalLogo.png";
import { motion } from "framer-motion";
import { FiLoader } from "react-icons/fi";

export default function Prebuilds() {
  const dispatch = useDispatch();
  const companyId = useSelector((state) => state.prebuild.companyId);
  const selectedPrebuildId = useSelector(
    (state) => state.prebuild.selectedPrebuildId
  );
  const { prebuilds = [], prebuildItems = [] } = useSelector(
    (state) => state?.prebuild || {}
  );

  const BASE_URL = import.meta.env.VITE_API_URL;

  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDateRange, setShowDateRange] = useState(false);
  const [dateRange, setDateRange] = useState([
    {
      startDate: subDays(new Date(), 7),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredItems = (prebuildItems || []).filter((item) =>
    (item?.Catalog?.Name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

  const dateRangeRef = useRef(null);

  const handleDateChange = (ranges) => {
    const { selection } = ranges;
    if (selection.endDate <= new Date()) {
      setDateRange([selection]);
      setShowDateRange(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dateRangeRef.current && !dateRangeRef.current.contains(event.target)) {
        setShowDateRange(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Loading state when prebuilds are not ready
  if (!prebuilds) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
        <FiLoader className="animate-spin text-blue-500 text-4xl mb-3" />
        <p className="text-lg md:text-xl text-gray-600 font-semibold">
          Loading prebuilds...
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="min-h-screen bg-gray-50 text-gray-800 font-sans flex"
    >
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 border-b">
          <h1 className="text-xl ml-10 lg:ml-0 sm:text-2xl font-semibold text-gray-800">
            Prebuilds
          </h1>
          <img
            src={verticalLogo}
            alt="Company Logo"
            className="h-8 sm:h-10 w-auto"
          />
        </header>

        {/* Filters */}
        <div className="sticky top-0 z-10 bg-white shadow-sm p-4 sm:p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-5 max-w-7xl mx-auto">
            {/* Search Bar */}
            <div className="w-full sm:w-auto min-w-[200px] relative">
              <input
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                value={searchTerm}
                type="text"
                placeholder="Search prebuilds items..."
                className="shadow-lg border border-gray-200 rounded px-5 h-[50px] py-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-all w-full"
              />
            </div>

            {/* Prebuild Dropdown */}
            <div className="w-full sm:w-auto min-w-[200px]">
              <Select
                value={selectedPrebuildId || ""}
                onValueChange={(selectedId) => {
                  if (!companyId || !selectedId) return;
                  setIsLoading(true);
                  fetch(
                    `${BASE_URL}/prebuilds/prebuildcatalogs?companyID=${companyId}&prebuildID=${selectedId}`
                  )
                    .then((res) => (res.ok ? res.json() : Promise.reject()))
                    .then((data) => {
                      dispatch(
                        setPrebuildItem({
                          prebuildItem: data?.catalogs || [],
                          selectedId,
                        })
                      );
                    })
                    .catch(console.error)
                    .finally(() => setIsLoading(false));
                }}
                placeholder="Select Prebuild"
                options={prebuilds.map((pb) => ({
                  label: pb?.Name || "Untitled",
                  value: pb?.ID || "",
                }))}
                className="w-full h-[50px] text-lg"
              />
            </div>

            {/* Date Range Picker */}
            {/* <div
              className="w-full sm:w-auto min-w-[200px] relative"
              ref={dateRangeRef}
            >
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
                <div className="absolute z-50 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                  <DateRange
                    editableDateInputs={true}
                    onChange={handleDateChange}
                    moveRangeOnFirstSelection={false}
                    ranges={dateRange}
                    maxDate={new Date()}
                    className="border-0"
                  />
                </div>
              )}
            </div> */}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 container mx-auto px-4 sm:px-6 py-8">
          {Array.isArray(prebuilds) && prebuilds.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="bg-white rounded-xl shadow-sm p-6 text-center max-w-md w-full">
                <p className="text-gray-600 text-lg">
                  No prebuilds found in this company.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
              <div className="overflow-x-auto">
                {isLoading ? (
                  <div className="flex flex-col items-center py-8">
                    <FiLoader className="animate-spin text-blue-500 text-3xl mb-2" />
                    <p className="text-blue-600">Loading catalog items...</p>
                  </div>
                ) : !selectedPrebuildId ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      Please select a prebuild to view items
                    </p>
                  </div>
                ) : prebuildItems.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      No prebuild Catalog items for this prebuild
                    </p>
                  </div>
                ) : filteredItems.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      No items match your search criteria
                    </p>
                  </div>
                ) : (
                  <>
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Price
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {currentItems.map((item, idx) => (
                          <tr
                            key={item?.Catalog?.ID || idx}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {item?.Catalog?.Name || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item?.Quantity ?? "—"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item?.Catalog?.TradePrice ?? "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Pagination */}
                    {filteredItems.length > itemsPerPage && (
                      <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
                        <div className="flex-1 flex justify-between sm:hidden">
                          <button
                            onClick={() =>
                              setCurrentPage((p) => Math.max(p - 1, 1))
                            }
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          >
                            Previous
                          </button>
                          <button
                            onClick={() =>
                              setCurrentPage((p) =>
                                Math.min(p + 1, totalPages)
                              )
                            }
                            disabled={currentPage === totalPages}
                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          >
                            Next
                          </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm text-gray-700">
                              Showing{" "}
                              <span className="font-medium">
                                {indexOfFirstItem + 1}
                              </span>{" "}
                              to{" "}
                              <span className="font-medium">
                                {Math.min(
                                  indexOfLastItem,
                                  filteredItems.length
                                )}
                              </span>{" "}
                              of{" "}
                              <span className="font-medium">
                                {filteredItems.length}
                              </span>{" "}
                              results
                            </p>
                          </div>
                          <div>
                            <nav
                              className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                              aria-label="Pagination"
                            >
                              <button
                                onClick={() =>
                                  setCurrentPage((p) => Math.max(p - 1, 1))
                                }
                                disabled={currentPage === 1}
                                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                              >
                                <span className="sr-only">Previous</span>
                                &larr;
                              </button>
                              <div className="flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                Page {currentPage} of {totalPages}
                              </div>
                              <button
                                onClick={() =>
                                  setCurrentPage((p) =>
                                    Math.min(p + 1, totalPages)
                                  )
                                }
                                disabled={currentPage === totalPages}
                                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                              >
                                <span className="sr-only">Next</span>
                                &rarr;
                              </button>
                            </nav>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
