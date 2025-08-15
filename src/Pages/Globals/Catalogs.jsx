import React, { useState, useRef, useEffect } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import verticalLogo from "../../assets/simproSilverHorizantalLogo.png";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { subDays, format } from "date-fns";
import { CalendarIcon } from "@heroicons/react/24/outline";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { FiLoader } from "react-icons/fi";

function Catalogs() {
  const catalogItems = useSelector((state) => state.catalog.catalogs);

  const [searchTerm, setSearchTerm] = useState("");
  const [showDateRange, setShowDateRange] = useState(false);
  const [loading, setLoading] = useState(true); // loader state
  const [dateRange, setDateRange] = useState([
    {
      startDate: subDays(new Date(), 7),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  const dateRangeRef = useRef(null);

  const handleDateChange = (ranges) => {
    const { selection } = ranges;
    if (selection.endDate <= new Date()) {
      setDateRange([selection]);
      setShowDateRange(false);
    }
  };

  // Simulate data loading delay
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dateRangeRef.current && !dateRangeRef.current.contains(event.target)) {
        setShowDateRange(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter items based on search term
  const currentItems = catalogItems.filter((item) =>
    item.Name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="min-h-screen bg-gray-50 text-gray-800 font-sans flex"
    >
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 border-b">
          <h1 className="text-2xl ml-10 lg:ml-0 font-semibold text-gray-800">
            Catalogs
          </h1>
          <img src={verticalLogo} alt="Company Logo" className="h-10 w-auto" />
        </header>

        {/* Filters */}
        <div className="sticky top-0 z-10 bg-white shadow-sm p-4 sm:p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-5 max-w-7xl mx-auto">
            {/* Search Bar */}
            <div className="w-full sm:w-auto min-w-[200px] relative">
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                type="text"
                placeholder="Search Catalogs Items..."
                className="shadow-lg border border-gray-200 rounded px-5 h-[50px] py-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-all w-full"
              />
            </div>

            {/* Date Range Picker */}
            <div
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
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="container mx-auto px-4 sm:px-6 py-8">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <FiLoader className="h-8 w-8 text-blue-500 animate-spin" />
                </div>
              ) : currentItems.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No catalog items found.</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trade Price Inc
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trade Price
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentItems.map((catalogItem) => (
                      <tr
                        key={catalogItem.ID}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {catalogItem.Name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {catalogItem.TradePriceInc}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {catalogItem.TradePrice}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default Catalogs;
