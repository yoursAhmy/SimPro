import { useEffect, useState, useRef } from "react";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { DateRange } from "react-date-range";
import { subDays, format } from "date-fns";
import { CalendarIcon } from "@heroicons/react/24/outline";
import Select from "../../components/ui/select";
import Sidebar from "../../components/sidebar/Sidebar";
import { useSelector, useDispatch } from "react-redux";
import { setPrebuildItem } from "../../store/slices/PrebuildSlice";

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
  const itemsPerPage = 5;

  // Filtering items safely
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
      if (
        dateRangeRef.current &&
        !dateRangeRef.current.contains(event.target)
      ) {
        setShowDateRange(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    console.log("Prebuilds Data Received:", prebuilds);
  }, [prebuilds]);

  if (!prebuilds) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
        <p className="text-lg md:text-xl text-gray-600 font-semibold py-8 px-6 bg-white rounded-xl shadow-md border border-gray-200 text-center w-full max-w-md">
          Loading prebuilds...
        </p>
      </div>
    );
  }

  if (prebuilds.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
        <p className="text-lg md:text-xl text-gray-600 font-semibold py-8 px-6 bg-white rounded-xl shadow-md border border-gray-200 text-center w-full max-w-md">
          No prebuilds found.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {/* Top Filters - Centered with 3 items */}
        <div className="sticky top-0 z-10 bg-white shadow-sm p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col items-center justify-center space-y-4 sm:space-y-0 sm:flex-row sm:space-x-4 md:space-x-6 lg:space-x-8 max-w-7xl mx-auto">
            {/* Search Input */}
            <div className="w-full sm:w-auto min-w-[200px]">
              <div className="relative ">
                <input
                  onChange={(e) => setSearchTerm(e.target.value)}
                  value={searchTerm}
                  type="text"
                  placeholder="Search catalogue items..."
                  className="w-full px-4 py-10 sm:py-3 bg-white text-gray-800 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:bg-gray-50 shadow-sm text-sm sm:text-base"
                />
                <svg
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 pointer-events-none"
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
            </div>

            {/* Prebuild Dropdown */}
            <div className="w-full sm:w-auto min-w-[200px]">
              <Select
                value={selectedPrebuildId || ""}
                onValueChange={(selectedId) => {
                  if (!companyId || !selectedId) return;
                    setIsLoading(true)
                  fetch(
                    `${BASE_URL}/prebuilds/prebuildcatalogs?companyID=${companyId}&prebuildID=${selectedId}`,
                    {
                      headers: { "ngrok-skip-browser-warning": "true" },
                    }
                  )
                    .then((response) => {
                      if (response.ok) return response.json();
                      else throw new Error("Request not successful");
                    })
                    .then((data) => {
                      dispatch(
                        setPrebuildItem({
                          prebuildItem: data?.catalogs || [],
                          selectedId: selectedId,
                        })
                      );
                    })
                    .catch((err) => console.error(err))
                    .finally(() => setIsLoading(false));
                }}
                placeholder="Select prebuild"
                options={prebuilds.map((pb) => ({
                  label: pb?.Name || "Untitled",
                  value: pb?.ID || "",
                }))}
              />
              
            </div>

            {/* Date Range Picker */}
            <div className="w-full sm:w-auto min-w-[200px] relative" ref={dateRangeRef}>
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
                    className="border-0"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Catalog Table */}
        <div className="container mx-auto px-4 sm:px-6 py-6">
          <span className="text-2xl font-bold flex items-center justify-center w-full mb-5 ">
            <h1>Catalog prebuild Items</h1>
          </span>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">

  {isLoading ? (
    // Loading spinner dikhaayen
    <div className="flex justify-center py-8 text-blue-600 font-semibold text-lg">
    Loading catalog items...
  </div>
) : prebuildItems.length === 0 ? (
  <div className="text-center py-8">
    <p className="text-gray-500">No catalog items in this prebuild.</p>
  </div>
  ) : prebuildItems.length === 0 ? (
    // Jab koi catalog item nahi ho tab ye dikhe
    <div className="text-center py-8">
      <p className="text-gray-500">No catalog items in this prebuild.</p>
    </div>
  ) : (
    // Normal table jab items ho
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
        {currentItems.map((catalogItem, idx) => (
          <tr
            key={catalogItem?.Catalog?.ID || `row-${idx}`}
            className="hover:bg-gray-50"
          >
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {catalogItem?.Catalog?.Name || "N/A"}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {catalogItem?.Quantity ?? "—"}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {catalogItem?.Catalog?.TradePrice ?? "—"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )}
</div>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-6">
          {filteredItems.length > itemsPerPage && (
            <div className="bg-white rounded-xl shadow-md border border-gray-200 flex items-center gap-4 px-4 py-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-lg transition ${
                  currentPage === 1
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                Prev
              </button>

              <span className="font-semibold text-gray-700">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-lg transition ${
                  currentPage === totalPages
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
