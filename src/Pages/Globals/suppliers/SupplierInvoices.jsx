import { useEffect, useState, useRef } from "react";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { DateRange } from "react-date-range";
import { subDays, format } from "date-fns";
import { CalendarIcon } from "@heroicons/react/24/outline";
import { FiLoader } from "react-icons/fi";
import { motion } from "framer-motion";
import Select from "../../../components/ui/Select";
import Sidebar from "../../../components/sidebar/Sidebar";
import { useSelector, useDispatch } from "react-redux";
import verticalLogo from "../../../assets/simproSilverHorizantalLogo.png";
import axios from "axios";
import {
  setSupplierInvoice,
  setSupplierReceipts,
} from "../../../store/slices/supplierInvoiceSlice";

export default function SupplierInvoices() {
  const dispatch = useDispatch();
  const { supplierInvoice = [], supplierReceipts = [] } = useSelector(
    (state) => state.supplierInvoice || {}
  );

  const companyId = useSelector((state) => state.prebuild?.companyId);

  const [selectedId, setSelectedId] = useState("");

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

  // fetch supplier invoices when company changes
  useEffect(() => {
    if (!companyId) return;
    setIsLoading(true);

    axios
      .get(`${BASE_URL}/supplier/supplierorders`, {
        params: { companyID: companyId },
      })
      .then((res) => {
        dispatch(setSupplierInvoice(res?.data?.vendorOrders || []));
      })
      .catch((err) => {
        console.error("Error fetching supplierInvoice:", err);
      })
      .finally(() => setIsLoading(false));
  }, [companyId, BASE_URL, dispatch]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // safer text getter for search
  const safeStr = (v) => (v == null ? "" : String(v)).toLowerCase();

  const filteredItems = (supplierReceipts || []).filter((item) => {
    const haystack =
      safeStr(item?.ID) +
      " " +
      safeStr(item?.VendorInvoiceNo) +
      " " +
      safeStr(item?.DueDate);
    return haystack.includes(searchTerm.toLowerCase());
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredItems.length / itemsPerPage)
  );
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

  const dateRangeRef = useRef(null);

  const handleDateChange = (ranges) => {
    const { selection } = ranges;
    if (selection?.endDate && selection.endDate <= new Date()) {
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onInvoiceChange = (newId) => {
    if (!companyId || !newId) {
      setSelectedId(newId || "");
      return;
    }

    setSelectedId(newId);
    setIsLoading(true);

    axios
      .get(`${BASE_URL}/supplier/supplierreceipts`, {
        params: {
          companyID: companyId,
          vendorOrderID: newId,
        },
      })
      .then((res) => {
        const data = res?.data?.vendorReceipts || [];
        dispatch(setSupplierReceipts(data));
        setCurrentPage(1);
      })
      .catch((err) => {
        console.error("Error fetching supplier receipts:", err);
        dispatch(setSupplierReceipts([]));
      })
      .finally(() => setIsLoading(false));
  };

  // early skeleton
  const invoicesAreEmpty =
    Array.isArray(supplierInvoice) && supplierInvoice.length === 0;

  return (
    <motion.div
      className="flex min-h-screen bg-gray-50 text-gray-800 font-sans"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Sidebar />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 border-b sticky top-0 z-20">
          <h1 className=" text-lg ml-10 lg:ml-0  lg:text-2xl font-semibold text-gray-800">
            Supplier Invoices
          </h1>
          <img src={verticalLogo} alt="Company Logo" className="h-12 w-auto" />
        </header>

        {/* states: loading / no company / no invoices */}
        {companyId === null ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <p className="text-lg text-gray-600 font-semibold py-8 px-6 bg-white rounded-xl shadow-md border border-gray-200 text-center w-full max-w-md">
              Please select a company to continue.
            </p>
          </div>
        ) : isLoading && invoicesAreEmpty ? (
          <div className="flex-1 flex flex-col items-center justify-center p-4 space-y-3">
            <FiLoader className="animate-spin text-blue-600 text-4xl" />
            <p className="text-lg text-gray-600 font-semibold">
              Loading supplier invoices...
            </p>
          </div>
        ) : invoicesAreEmpty ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <p className="text-lg text-gray-600 font-semibold py-8 px-6 bg-white rounded-xl shadow-md border border-gray-200 text-center w-full max-w-md">
              No supplier invoices found for this company.
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            {/* Filters */}
            <div className="bg-white shadow-sm p-2 sm:p-2 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 max-w-7xl mx-auto">
                {/* Search Input */}
                <div className="w-full sm:w-auto min-w-[200px] relative">
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    type="text"
                    placeholder="Search "
                    className="shadow-lg border border-gray-200 rounded px-5 h-[50px] py-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-all w-full"
                  />
                </div>

                {/* Invoice Dropdown */}
                <div className="w-full sm:w-auto min-w-[200px]">
                  <Select
                    value={selectedId}
                    onValueChange={onInvoiceChange}
                    placeholder="Select Supplier Invoice"
                    options={
                      Array.isArray(supplierInvoice)
                        ? supplierInvoice.map((SI) => ({
                            label: String(
                              SI?.vendorOrderNumber ||
                                SI?.orderNumber ||
                                SI?.ID ||
                                SI?.orderId ||
                                "Untitled"
                            ),
                            value: String(
                              SI?.vendorOrderID || SI?.ID || SI?.orderId || ""
                            ),
                          }))
                        : []
                    }
                    className="  border-gray-200 rounded px-5 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-all w-full sm:w-auto min-w-[240px]"
                  />
                </div>

                <div
                  className="w-full sm:w-auto min-w-[240px] relative"
                  ref={dateRangeRef}
                >
                  <div
                    className="flex items-center h-[50px] px-5 py-4 bg-white border border-gray-200 rounded shadow-lg cursor-pointer hover:bg-gray-50 transition-all duration-200"
                    onClick={() => setShowDateRange((s) => !s)}
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
                    <div className="absolute z-50 mt-2 bg-white border border-gray-200 rounded shadow-lg transition-all duration-200">
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

            {/* Receipts Table */}
            <div className="container mx-auto px-4 sm:px-6 py-6">
              <h2 className="text-2xl font-bold text-center mb-5">
                Supplier Receipts
              </h2>
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                  {isLoading && selectedId ? (
                    <div className="flex flex-col items-center justify-center py-8 space-y-3">
                      <FiLoader className="animate-spin text-blue-600 text-4xl" />
                      <p className="font-semibold text-lg text-blue-600">
                        Loading receipts...
                      </p>
                    </div>
                  ) : !selectedId ? (
                    <div className="text-center py-8 text-gray-500">
                      Please select a supplier invoice to view receipts
                    </div>
                  ) : (supplierReceipts || []).length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No supplier receipts for this invoice
                    </div>
                  ) : filteredItems.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No items match your search criteria
                    </div>
                  ) : (
                    <>
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Vendor Invoice
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Issued Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Due Date
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {currentItems.map((item, idx) => (
                            <tr
                              key={item?.ID ?? idx}
                              className="hover:shadow-sm transition-all duration-150"
                            >
                              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                {item?.ID ?? "N/A"}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-700">
                                {item?.VendorInvoiceNo ?? "—"}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-700">
                                {item?.DateIssued ?? "—"}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-700">
                                {item?.DueDate ?? "-"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* Pagination */}
                      {filteredItems.length > itemsPerPage && (
                        <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-3 sm:px-6">
                          {/* Mobile */}
                          <div className="flex flex-1 justify-between sm:hidden">
                            <button
                              onClick={() =>
                                setCurrentPage((p) => Math.max(p - 1, 1))
                              }
                              disabled={currentPage === 1}
                              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
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
                              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                              Next
                            </button>
                          </div>

                          {/* Desktop */}
                          <div className="hidden w-full sm:flex sm:items-center">
                            <div className="flex-1 flex justify-start">
                              <button
                                onClick={() =>
                                  setCurrentPage((p) => Math.max(p - 1, 1))
                                }
                                disabled={currentPage === 1}
                                className="px-4 py-2 bg-blue-200 text-blue-900 font-semibold rounded hover:bg-blue-300 disabled:opacity-50 transition-colors duration-200"
                              >
                                Previous
                              </button>
                            </div>

                            <div className="flex-1 flex justify-center">
                              <div className="text-sm font-semibold text-gray-700">
                                Page {currentPage} of {totalPages}
                              </div>
                            </div>

                            <div className="flex-1 flex justify-end">
                              <button
                                onClick={() =>
                                  setCurrentPage((p) =>
                                    Math.min(p + 1, totalPages)
                                  )
                                }
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 bg-blue-200 text-blue-900 font-semibold rounded hover:bg-blue-300 disabled:opacity-50 transition-colors duration-200"
                              >
                                Next
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
