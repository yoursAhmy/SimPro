import { useEffect, useState, useRef } from "react";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { DateRange } from "react-date-range";
import { subDays, format } from "date-fns";
import { CalendarIcon, XMarkIcon, DocumentArrowDownIcon } from "@heroicons/react/24/outline";
import { FiLoader } from "react-icons/fi";
import { motion } from "framer-motion";
import Select from "../../../components/ui/Select";
import Sidebar from "../../../components/sidebar/Sidebar";
import { useSelector, useDispatch } from "react-redux";
import verticalLogo from "../../../assets/simproSilverHorizantalLogo.png";
import axios from "axios";
import {setSupplierInvoice, setSupplierReceipts,} from "../../../store/slices/supplierInvoiceSlice";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function SupplierInvoices() {
  const dispatch = useDispatch();
  const { supplierInvoice = [], supplierReceipts = [] } = useSelector(
    (state) => state.supplierInvoice || {}
  );
  const companyId = useSelector((state) => state.prebuild?.companyId);

  const [selectedId, setSelectedId] = useState("");
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCatalogDetails, setSelectedCatalogDetails] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [catalogSearchTerm, setCatalogSearchTerm] = useState("");

  const BASE_URL = import.meta.env.VITE_API_URL;
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const dateRangeRef = useRef(null);
  const modalRef = useRef(null);

  // Fetch supplier invoices when company changes
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

  // Filter items based on search term
  const filteredItems = (supplierReceipts || []).filter((item) => {
    const searchStr = `${item?.ID || ""} ${item?.VendorInvoiceNo || ""} ${item?.DueDate || ""}`.toLowerCase();
    return searchStr.includes(searchTerm.toLowerCase());
  });

  // Filter catalog items based on search term
  const filteredCatalogItems = selectedCatalogDetails.filter((item) => {
    const searchStr = `${item?.ID || ""} ${item?.Name || ""}`.toLowerCase();
    return searchStr.includes(catalogSearchTerm.toLowerCase());
  });

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

  const handleDateChange = (ranges) => {
    const { selection } = ranges;
    if (selection?.endDate && selection.endDate <= new Date()) {
      setDateRange([selection]);
      setShowDateRange(false);
    }
  };

  const handleClickOutsideDateRange = (event) => {
    if (dateRangeRef.current && !dateRangeRef.current.contains(event.target)) {
      setShowDateRange(false);
    }
  };

  const handleClickOutsideModal = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      setIsModalOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutsideDateRange);
    return () => document.removeEventListener("mousedown", handleClickOutsideDateRange);
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutsideModal);
    } else {
      document.removeEventListener("mousedown", handleClickOutsideModal);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideModal);
    };
  }, [isModalOpen]);

  const onInvoiceChange = (newId) => {
    if (companyId === null || !newId) {
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

  const handleViewCatalogs = (vendorReceiptID) => {
    if (!companyId || !selectedId || !vendorReceiptID) return;
    
    setDetailsLoading(true);
    setIsModalOpen(true);
    setCatalogSearchTerm("");
    
    axios
      .get(`${BASE_URL}/supplier/supplierreceiptcatalogs`, {
        params: {
          companyID: companyId,
          vendorOrderID: selectedId,
          vendorReceiptID: vendorReceiptID,
        },
      })
      .then((res) => {
        setSelectedCatalogDetails(res?.data?.vendorReceiptCatalogs || []);
      })
      .catch((err) => {
        console.error("Error fetching catalog details:", err);
        setSelectedCatalogDetails([]);
      })
      .finally(() => setDetailsLoading(false));
  };
  // console.log(selectedCatalogDetails);
  

  if (isLoading && supplierInvoice.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
        <FiLoader className="animate-spin text-blue-500 text-4xl mb-3" />
        <p className="text-lg md:text-xl text-gray-600 font-semibold">
          Loading supplier invoices...
        </p>
      </div>
    );
  };

  const downloadPDF = () => {
      const doc = new jsPDF();
      
      // Apply the autoTable plugin to jsPDF
      autoTable(doc, {
        startY: 40,
        head: [["ID", "Vendor Invoice", "	Issued Date", "	Due Date"]],
        body: filteredItems.map((item) => [
          item?.ID || "N/A",
          item?.VendorInvoiceNo || "N/A",
          item?.DateIssued ?? "—",
          item?.DateDate ?? "—",
        ]),
        theme: "striped",
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 10 },
        margin: { top: 40 },
      });
  
      // Add title
      doc.setFontSize(18);
      doc.text("Prebuilds Report", 14, 20);
      // Add date
      doc.setFontSize(12);
      doc.text(`Generated on: ${format(new Date(), "MMM dd, yyyy")}`, 14, 30);
      doc.save(`prebuilds_report_${format(new Date(), "yyyy-MM-dd")}.pdf`);
    };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="min-h-screen bg-gray-50 text-gray-800 font-sans flex"
    >
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-4 sm:px-6 border-b">
          <h1 className="text-lg ml-12 sm:text-xl md:text-2xl font-semibold text-gray-800 md:ml-6">
            Supplier Invoices
          </h1>
          <img 
            src={verticalLogo} 
            alt="Company Logo" 
            className="h-8 sm:h-10 w-auto mr-2 sm:mr-4" 
          />
        </header>

        <div className="sticky top-0 z-10 bg-white shadow-sm p-3 sm:p-4 md:p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-5 max-w-7xl mx-auto">
            <div className="w-full sm:w-auto min-w-[200px] relative">
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                type="text"
                placeholder="Search Catalogs Items..."
                className="shadow-lg border border-gray-200 rounded px-5 h-[50px] py-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-all w-full"
              />
            </div>

            <div className="w-full min-w-0 mb-2 cursor-pointer ">
              <Select
                value={selectedId || ""}
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
                className="w-full h-10 sm:h-12 text-sm sm:text-base"
              />
            </div>

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

        { filteredItems.length === 0 ? null: ( <div className="flex">
                  <p className="pl-10 pt-2 font-medium">showing {currentItems.length} prebuilds items </p>
                  <button
                      onClick={downloadPDF}
                      className="p-2 rounded-full hover:bg-gray-200 transition-all duration-200"
                      title="Download as PDF"
                    >
                      <DocumentArrowDownIcon className="h-6 w-6 text-gray-600" />
                    </button>
                </div>)}

        <div className="flex-1 container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
          {Array.isArray(supplierInvoice) && supplierInvoice.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 text-center max-w-md w-full">
                <p className="text-gray-600 text-base sm:text-lg">
                  No supplier invoices found for this company.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-full overflow-x-hidden">
              <div className="w-full max-h-[500px] overflow-y-auto overflow-x-auto">
                {isLoading ? (
                  <div className="flex flex-col items-center py-6 sm:py-8">
                    <FiLoader className="animate-spin text-[var(--color-primary)] text-2xl sm:text-3xl mb-2" />
                    <p className="text-[var(--color-primary)] text-sm sm:text-base">Loading receipts...</p>
                  </div>
                ) : !selectedId ? (
                  <div className="text-center py-6 sm:py-8">
                    <p className="text-gray-500 text-sm sm:text-base">
                      Please select a supplier invoice to view receipts
                    </p>
                  </div>
                ) : supplierReceipts.length === 0 ? (
                  <div className="text-center py-6 sm:py-8">
                    <p className="text-gray-500 text-sm sm:text-base">
                      No supplier receipts for this invoice
                    </p>
                  </div>
                ) : filteredItems.length === 0 ? (
                  <div className="text-center py-6 sm:py-8">
                    <p className="text-gray-500 text-sm sm:text-base">
                      No items match your search criteria
                    </p>
                  </div>
                ) : (
                  

                  <div className="min-w-[900px]">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                          <th className="w-[10%] px-3 py-2 md:px-4 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ID
                          </th>
                          <th className="w-[15%] px-3 py-2 md:px-4 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Vendor Invoice
                          </th>
                          <th className="w-[15%] px-3 py-2 md:px-4 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Issued Date
                          </th>
                          <th className="w-[15%] px-3 py-2 md:px-4 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Due Date
                          </th>
                          <th className="w-[15%] px-3 py-2 md:px-4 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            More
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {currentItems.map((item, idx) => (
                          <tr key={item?.ID || idx} className="hover:bg-gray-50">
                            <td className="px-3 py-2 md:px-4 md:py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                              {item?.ID || "N/A"}
                            </td>
                            <td
                              className="px-3 py-2 md:px-4 md:py-3 whitespace-nowrap text-sm text-gray-500 overflow-hidden text-ellipsis max-w-[150px] md:max-w-[200px]"
                              title={item?.VendorInvoiceNo || "—"}
                            >
                              {item?.VendorInvoiceNo || "—"}
                            </td>
                            <td className="px-3 py-2 md:px-4 md:py-3 whitespace-nowrap text-sm text-gray-500">
                              {item?.DateIssued || "—"}
                            </td>
                            <td className="px-3 py-2 md:px-4 md:py-3 whitespace-nowrap text-sm text-gray-500">
                              {item?.DueDate || "—"}
                            </td>
                            <td className="px-3 py-2 md:px-4 md:py-3 whitespace-nowrap text-sm text-gray-500">
                              <button
                                onClick={() => handleViewCatalogs(item?.ID)}
                                className="px-3 py-1 text-sm bg-[var(--color-primary)] text-white rounded hover:bg-[#007EA8] transition-colors"
                              >
                                View Catalogs
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {filteredItems.length > itemsPerPage && (
                <div className="bg-gray-50 px-3 py-2 md:px-4 md:py-3 flex items-center justify-between border-t border-gray-200">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="ml-2 relative inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-700">
                        Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
                        <span className="font-medium">{Math.min(indexOfLastItem, filteredItems.length)}</span> of{" "}
                        <span className="font-medium">{filteredItems.length}</span> results
                      </p>
                    </div>
                    <div>
                      <nav
                        className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                        aria-label="Pagination"
                      >
                        <button
                          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-1 rounded-l-md border border-gray-300 bg-white text-xs sm:text-sm font-medium text-gray-500 hover:bg-gray-50"
                        >
                          <span className="sr-only">Previous</span>
                          &larr;
                        </button>
                        <div className="flex items-center px-3 py-1 border border-gray-300 bg-white text-xs sm:text-sm font-medium text-gray-700">
                          Page {currentPage} of {totalPages}
                        </div>
                        <button
                          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-1 rounded-r-md border border-gray-300 bg-white text-xs sm:text-sm font-medium text-gray-500 hover:bg-gray-50"
                        >
                          <span className="sr-only">Next</span>
                          &rarr;
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-400 bg-opacity-50 flex items-center justify-center z-50 p-2 xs:p-3 sm:p-4">
          <div 
            ref={modalRef}
            className="bg-white p-3 xs:p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-[90vw] xs:max-w-[80vw] sm:max-w-md max-h-[80vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h2 className="text-base xs:text-lg font-semibold">Catalog Items</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label="Close modal"
              >
                <XMarkIcon className="h-5 w-5 xs:h-6 xs:w-6" />
              </button>
            </div>
            
            <div className="mb-3 sm:mb-4">
              <input
                type="text"
                placeholder="Search by ID or Name..."
                className="w-full p-2 text-sm xs:text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                value={catalogSearchTerm}
                onChange={(e) => setCatalogSearchTerm(e.target.value)}
              />
            </div>

            {detailsLoading ? (
              <div className="flex justify-center text-[var(--color-primary)] items-center py-4">
                <FiLoader className="animate-spin text-xl xs:text-2xl" />
                <span className="ml-2 text-sm xs:text-base">Loading...</span>
              </div>
            ) : filteredCatalogItems.length > 0 ? (
              <div className="space-y-2 sm:space-y-3">
                {filteredCatalogItems.map((item, index) => (
                  <div key={index} className="border-b py-2 sm:py-3 last:border-b-0">
                    <p className="font-semibold text-sm xs:text-base">ID: {item.ID || "N/A"}</p>
                    <p className="text-xs xs:text-sm text-gray-600">Name: {item.Name || "N/A"}</p>
                    <p className="text-xs xs:text-sm">Part No: {item.PartNo || "N/A"}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4 text-sm xs:text-base">
                {catalogSearchTerm ? "No matching items found" : "No catalog items found"}
              </p>
            )}

            <div className="mt-3 sm:mt-4 flex justify-end">
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="px-2 xs:px-3 sm:px-4 py-1 sm:py-2 cursor-pointer bg-[var(--color-primary)] text-white rounded hover:bg-gray-600 transition-colors text-sm xs:text-base"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
