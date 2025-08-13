import React, { useState, useRef, useEffect } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import verticalLogo from "../../assets/simproSilverHorizantalLogo.png";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { subDays, format } from "date-fns";
import { CalendarIcon } from "@heroicons/react/24/outline";
import { useSelector, useDispatch } from "react-redux";
import { setQuotes } from "../../store/slices/QuotesSlice";
import DOMPurify from "dompurify";
import { Modal, Box, Typography, Fade, Backdrop } from "@mui/material";

const Quotes = () => {
  const companyID = useSelector((state) => state.prebuild?.companyId);
  const quotes = useSelector((state) => state.quotes.quotes);

  const BASE_URL = import.meta.env.VITE_API_URL;
  const dispatch = useDispatch();

  const [open, setOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);

  const handleOpen = (quote) => {
    setSelectedQuote(quote);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedQuote(null);
  };

  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "90%",
    maxWidth: 700,
    maxHeight: "80vh",
    bgcolor: "background.paper",
    boxShadow: 3,
    p: 6,
    borderRadius: 4,
    overflowY: "auto",
  };

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

  const handleDateChange = (ranges) => {
    const { selection } = ranges;
    if (selection.endDate <= new Date()) {
      setDateRange([selection]);
      setShowDateRange(false);
    }
  };

  useEffect(() => {
    fetch(`${BASE_URL}/quotes/allquotes?companyID=${companyID}`)
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
        throw new Error("Failed to fetch catalogs");
      })
      .then((data) => {
        console.log("Quotes data:", data);
        dispatch(setQuotes(data.quotes));
      })
      .catch((err) => {
        console.error("Error while fetching catalogs", err);
      });
  }, [BASE_URL, companyID]);

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

  // Filter items based on search term
  const currentItems = quotes.filter((item) =>
    item.Description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <div className="min-h-screen  bg-gray-50 text-gray-800 font-sans flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 border-b">
          <h1 className="text-2xl font-semibold text-gray-800">Qoutes</h1>
          <img src={verticalLogo} alt="Company Logo" className="h-10 w-auto" />
        </header>

        {/* Filters */}
        <div className="sticky top-0 z-10 bg-white shadow-sm p-4 sm:p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-5 max-w-7xl mx-auto">
            {/* Search Bar */}
            <div className="relative col-span-1 xs:col-span-2 md:col-span-1">
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                type="text"
                placeholder="Search catalogs..."
                className="w-full px-4 py-2 sm:py-3 bg-white text-gray-800 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:bg-gray-50 shadow-sm text-sm sm:text-base"
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

            {/* Date Range Picker */}
            <div
              className="col-span-1 xs:col-span-2 md:col-span-1 relative"
              ref={dateRangeRef}
            >
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
        {/* Table */}
        <div className="container mx-auto px-4 sm:px-6 py-8">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              {currentItems.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No Quotes found.</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200 table-fixed">
                  <thead className="bg-gray-50">
                    <tr>
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
                        onClick={() => handleOpen(quote)}
                      >
                        <td
  className="px-6 py-4 text-sm font-medium text-gray-900"
  style={{
    maxWidth: "300px",
    maxHeight: "30px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    WebkitLineClamp: 1,
    WebkitBoxOrient: "vertical",
    whiteSpace: "normal",
  }}
  title={
    quote.Description
      ? quote.Description.replace(/<[^>]+>/g, "")
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
              <Modal
                open={open}
                onClose={handleClose}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{ timeout: 500 }}
              >
                <Fade in={open}>
                  <Box sx={modalStyle}>
                    {selectedQuote && (
                      <>
                        <Typography
                          variant="h5"
                          component="h2"
                          sx={{ fontWeight: "bold", mb: 2 }}
                        >
                          Quote Details
                        </Typography>

                        <Typography sx={{ mt: 1 }}>
                          <strong>ID:</strong> {selectedQuote.ID}
                        </Typography>

                        <Typography sx={{ mt: 1 }}>
                          <strong>Description:</strong>
                          <div
                            style={{ marginTop: "0.5rem" }}
                            dangerouslySetInnerHTML={{
                              __html: DOMPurify.sanitize(
                                selectedQuote.Description
                              ),
                            }}
                          />
                        </Typography>

                        <Typography sx={{ mt: 1 }}>
                          <strong>Is Closed:</strong>{" "}
                          {selectedQuote.IsClosed ? "Yes" : "No"}
                        </Typography>

                        <Typography sx={{ mt: 1 }}>
                          <strong>Ex Tax:</strong> {selectedQuote.Total?.ExTax}
                        </Typography>

                        <Typography sx={{ mt: 1 }}>
                          <strong>Tax:</strong> {selectedQuote.Total?.Tax}
                        </Typography>

                        <Typography sx={{ mt: 1 }}>
                          <strong>Inc Tax:</strong>{" "}
                          {selectedQuote.Total?.IncTax}
                        </Typography>
                      </>
                    )}
                  </Box>
                </Fade>
              </Modal>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quotes;
