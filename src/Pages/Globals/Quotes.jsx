import React, { useState, useRef, useEffect } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import verticalLogo from "../../assets/simproSilverHorizantalLogo.png";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { format, subYears } from "date-fns";
import { CalendarIcon } from "@heroicons/react/24/outline";
import { useSelector, useDispatch } from "react-redux";
import { setQuotes } from "../../store/slices/QuotesSlice";
import DOMPurify from "dompurify";
import { motion } from "framer-motion";
import { FiLoader } from "react-icons/fi";

const Quotes = () => {
  const companyID = useSelector((state) => state.prebuild?.companyId);
  const quotes = useSelector((state) => state.quotes.quotes);
  const BASE_URL = import.meta.env.VITE_API_URL;
  const dispatch = useDispatch();

  const [selectedQuote, setSelectedQuote] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDateRange, setShowDateRange] = useState(false);
  const [loading, setLoading] = useState(false);

  const today = format(new Date(), "yyyy-MM-dd");
  const twoYearsAgo = format(subYears(new Date(), 2), "yyyy-MM-dd");

  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(twoYearsAgo),
      endDate: new Date(today),
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

  useEffect(() => {
    if (companyID === null) return;

    const start = format(dateRange[0].startDate, "yyyy-MM-dd");
    const end = format(dateRange[0].endDate, "yyyy-MM-dd");

    setLoading(true);
    fetch(
      `${BASE_URL}/quotes/allquotes?companyID=${companyID}&startDate=${start}&endDate=${end}`
    )
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
        throw new Error("Failed to fetch catalogs");
      })
      .then((data) => {
        dispatch(setQuotes(data.quotes));
      })
      .catch((err) => {
        console.error("Error while fetching catalogs", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [BASE_URL, companyID, dateRange]);

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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter items
  const currentItems = quotes.filter(
    (item) =>
      item.ID.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.Description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      className="min-h-screen bg-gray-50 text-gray-800 font-sans flex"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 border-b">
          <h1 className="text-2xl ml-10 lg:ml-0 font-semibold text-gray-800">
            Quotes
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
                placeholder="Search quotes..."
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

        {/* Table or Loader */}
        <div className="container mx-auto px-4 sm:px-6 py-8">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <FiLoader className="animate-spin text-4xl text-blue-500" />
                </div>
              ) : currentItems.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No Quotes found.</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200 table-fixed">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        TAX
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        IsClosed
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentItems.map((quote) => (
                      <tr
                        key={quote.ID}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => setSelectedQuote(quote)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {quote.ID}
                        </td>
                        <td
                          className="px-6 py-4 text-lg font-medium text-gray-900"
                          style={{
                            maxWidth: "300px",
                            maxHeight: "40px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: "vertical",
                            whiteSpace: "normal",
                            fontSize: "14px",
                            lineHeight: "1.5",
                          }}
                          title={
                            quote.Description
                              ? DOMPurify.sanitize(quote.Description).replace(
                                  /<[^>]+>/g,
                                  ""
                                )
                              : "-"
                          }
                        >
                          {quote.Description ? (
                            <span
                              dangerouslySetInnerHTML={{
                                __html: DOMPurify.sanitize(quote.Description),
                              }}
                            />
                          ) : (
                            "-"
                          )}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {quote.Total?.Tax}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {quote.IsClosed ? "Yes" : "No"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Custom Popup */}
              {selectedQuote && (
                <div className="fixed mt-40 inset-0 bg-transparent flex items-center justify-center z-50">
                  <div className="bg-white rounded-xl shadow-xl w-96 max-h-[90vh] p-6 relative overflow-hidden">
                    {/* Close Button */}
                    <button
                      className="absolute top-3 right-3 cursor-pointer text-gray-500 hover:text-gray-700 transition"
                      onClick={() => setSelectedQuote(null)}
                    >
                      ✖
                    </button>

                    {/* Title */}
                    <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
                      Quote Details
                    </h2>

                    {/* Info */}
                    <div className="space-y-2 text-sm text-gray-700">
                      <p><strong>ID:</strong> {selectedQuote.ID}</p>
                      <p><strong>Is Closed:</strong> {selectedQuote.IsClosed ? "Yes" : "No"}</p>
                      <p><strong>ExTax:</strong> {selectedQuote?.Total?.ExTax ?? "N/A"}</p>
                      <p><strong>IncTax:</strong> {selectedQuote?.Total?.IncTax ?? "N/A"}</p>
                      <p><strong>Tax:</strong> {selectedQuote?.Total?.Tax ?? "N/A"}</p>
                    </div>

                    {/* Description */}
                    <div className="mt-4">
                      <strong className="block text-gray-800 mb-2">Description:</strong>
                      <div
                        className="p-3 border rounded-lg bg-gray-50 max-h-40 overflow-y-auto text-sm leading-relaxed custom-scrollbar"
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(selectedQuote.Description),
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Quotes;
