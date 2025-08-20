import React, { useState, useEffect } from "react";
import Sidebar from "../../../components/sidebar/Sidebar";
import logo from "../../../assets/simproSilverHorizantalLogo.png";
import { useSelector } from "react-redux";
import axios from "axios";
import { selectCompanyId } from "../../../store/slices/PrebuildSlice";
import { DateRange } from "react-date-range";
import { format } from "date-fns";
import { CalendarIcon } from "@heroicons/react/24/outline";
import { FiLoader } from "react-icons/fi";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

const BASE_URL = import.meta.env.VITE_API_URL;

function SupplierOrders() {
  const companyID = useSelector(selectCompanyId);
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(() => {
    const savedPage = localStorage.getItem("ordersCurrentPage");
    return savedPage ? parseInt(savedPage, 10) : 1;
  });
  const rowsPerPage = 20;
  const [loading, setLoading] = useState(true);

  // Date picker states
  const [showCalendar, setShowCalendar] = useState(false);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(2025, 0, 1),
      endDate: new Date(2025, 11, 31),
      key: "selection",
    },
  ]);
  const formatDate = (date) => format(date, "MMM dd, yyyy");

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStage, setFilterStage] = useState("");

  // Catalog modal states
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCatalogDetails, setSelectedCatalogDetails] = useState([]);

  // Fetch orders
  useEffect(() => {
    if (!companyID) return;

    setLoading(true);
    axios
      .get(`${BASE_URL}/supplier/supplierorders?companyID=${companyID}`)
      .then((res) => {
        const data = Array.isArray(res.data.vendorOrders) ? res.data.vendorOrders : [];
        setOrders(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [companyID]);

  // Fetch catalog details
  const fetchCatalogDetails = (vendorOrderID) => {
    setDetailsLoading(true);
    fetch(`${BASE_URL}/supplier/supplierordercatalogs?companyID=${companyID}&vendorOrderID=${vendorOrderID}`)
      .then((res) => res.json())
      .then((data) => {
        const catalogs = Array.isArray(data.vendorOrderCatalogs) ? data.vendorOrderCatalogs : [];
        setSelectedCatalogDetails(catalogs);
        setIsModalOpen(true);
      })
      .catch((err) => {
        console.error("Error fetching catalog details:", err);
        setSelectedCatalogDetails([]);
      })
      .finally(() => {
        setDetailsLoading(false);
      });
  };

  // Apply filters
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = searchTerm
      ? (order.ID?.toString() + " " + (order.Reference || ""))
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      : true;

    const matchesStage = filterStage ? order.Stage === filterStage : true;

    return matchesSearch && matchesStage;
  });

  // Pagination
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const totalPages = Math.ceil(filteredOrders.length / rowsPerPage);
  const currentOrders = filteredOrders.slice(indexOfFirst, indexOfLast);

  const handlePrev = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

  useEffect(() => {
    localStorage.setItem("ordersCurrentPage", currentPage);
  }, [currentPage]);

  return (
<div className="flex  min-h-screen md:h-screen md:overflow-hidden">
      <Sidebar />


  <div className="flex flex-col h-screen w-full overflow-x-hidden  " >
        {/* Header */}
      <header className="flex    justify-between items-center bg-white shadow-sm h-16 mb-2 px-10 sm:px-6 md:px-12 border-b w-full sticky top-0 z-40">
  <h1 className="text-3xl ml-10 lg:ml-0 font-semibold text-gray-800">Orders</h1>
  <img src={logo} alt="Company Logo" className="h-12 w-auto mb-2 mt-2" />
</header>



        {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 shadow-md bg-white p-4 top-16 w-full   z-30">
    <input
            type="text"
            placeholder="Search by ID or Reference"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="shadow-lg border border-gray-200 rounded px-5 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
          />

          <select
            value={filterStage}
            onChange={(e) => {
              setFilterStage(e.target.value);
              setCurrentPage(1);
            }}
            className="shadow-lg border border-gray-300 rounded px-4 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <option value="">All Stages</option>
            {[...new Set(orders.map((o) => o.Stage))].map((stage) => (
              <option key={stage} value={stage}>{stage}</option>
            ))}
          </select>

          <div className="relative">
            <div
              className="flex items-center p-3 border border-gray-300 shadow-md rounded-md bg-white cursor-pointer"
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
              <div className="absolute mt-2 z-50 mr-8 bg-white shadow-lg border rounded  ">
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
        <div className="container mx-auto px-4 sm:px-6 py-8 flex-1 max-w-full">
  <p className="px-6 py-3 text-gray-700 text-lg font-medium">
    Showing all {filteredOrders.length} orders
  </p>

 
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <FiLoader className="h-10 w-10 animate-spin" style={{
                   color: "var(--color-primary)"
                             
                           }} />
                <p className="mt-4 text-gray-600 font-medium">Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No orders found.</div>
            ) : (
              <>
                 <table className="min-w-[700px] w-full table-auto divide-y divide-gray-200">
                  <thead className="bg-gray-50  ">
                       <tr>
            <th className="px-6 py-4 text-left text-sm sm:text-base font-semibold text-gray-500 uppercase">ID</th>
            <th className="px-6 py-4 text-left text-sm sm:text-base font-semibold text-gray-500 uppercase">Reference</th>
            <th className="px-6 py-4 text-left text-sm sm:text-base font-semibold text-gray-500 uppercase">Stage</th>
            <th className="px-6 py-4 text-left text-sm sm:text-base font-semibold text-gray-500 uppercase">ExTax</th>
            <th className="px-6 py-4 text-left text-sm sm:text-base font-semibold text-gray-500 uppercase">IncTax</th>
            <th className="px-6 py-4 text-left text-sm sm:text-base font-semibold text-gray-500 uppercase">More</th>
          </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
          {currentOrders.map((order) => (
            <tr key={order.ID} className="cursor-pointer hover:bg-gray-50 transition">
              <td className="px-6 py-3 text-sm sm:text-base font-medium text-gray-900">{order.ID}</td>
             <td className="px-6 py-3 text-sm sm:text-base text-gray-500 relative group">
  <span>
    {order.Reference
      ? order.Reference.length > 15
        ? order.Reference.slice(0, 15) + "..."
        : order.Reference
      : "N/A"}
  </span>

  {/* Tooltip */}
  {order.Reference && order.Reference.length > 15 && (
    <div className="absolute left-0 mb-20 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
      {order.Reference}
    </div>
  )}
</td>

              <td className="px-6 py-3 text-sm sm:text-base text-gray-500">{order.Stage}</td>
              <td className="px-6 py-3 text-sm sm:text-base text-gray-500">{order?.Totals?.ExTax ?? "N/A"}</td>
              <td className="px-6 py-3 text-sm sm:text-base text-gray-500">{order?.Totals?.IncTax ?? "N/A"}</td>
              <td className="px-6 py-3 text-sm sm:text-base text-gray-500">
                <button
                  onClick={() => fetchCatalogDetails(order.ID)}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded shadow-sm transition"
                >
                  Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
                </table>

                {/* Catalog Modal */}
              {isModalOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    {/* Semi-transparent blur background */}
    <div className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm"></div>

    {/* Modal content */}
    <div className="relative bg-white/90 backdrop-blur-md rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 sm:p-8 z-50">
      {/* Close Button */}
      <button
        onClick={() => setIsModalOpen(false)}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-lg sm:text-xl font-bold"
      >
        ✖
      </button>

      <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-800">
        Catalog Details
      </h2>

      {detailsLoading ? (
        <p className="text-gray-600">Loading details...</p>
      ) : selectedCatalogDetails.length > 0 ? (
        selectedCatalogDetails.map((item, index) => (
          <div key={index} className="border-b py-3 last:border-b-0">
            <p className="font-semibold text-gray-800">{item.Catalog?.Name}</p>
            <p className="text-sm text-gray-600">Part No: {item.Catalog?.PartNo ?? "N/A"}</p>
            <p className="text-sm text-gray-700">Price: {item.Price}</p>
            {item.DueDate && (
              <p className="text-sm text-gray-700">
                Due Date: {new Date(item.DueDate).toLocaleDateString()}
              </p>
            )}
            {item.Notes && item.Notes.trim() !== "" && (
              <p className="text-sm text-gray-700">Notes: {item.Notes}</p>
            )}
            <p className="text-xs text-gray-500">Vendor Order ID: {item.vendorOrder}</p>
          </div>
        ))
      ) : (
        <p className="text-gray-600">No catalog details found.</p>
      )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={() => setIsModalOpen(false)}
          className="px-5 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 transition"


        >
          Close
        </button>
      </div>
    </div>
  </div>
)}


                {/* Pagination */}
               
              </>

            )}
          </div>
 <div className="flex overflow-x-hidden flex-col sm:flex-row justify-between items-center p-4 bg-gray-50 border-t gap-2 sm:gap-0">
                  <button onClick={handlePrev} disabled={currentPage === 1} className="px-4 py-2 bg-blue-200 text-blue-900 font-semibold rounded disabled:opacity-50 hover:bg-blue-300" 
                   style={{
                   color: "var(--color-primary)"
                             
                           }} 
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
                  <button onClick={handleNext} disabled={currentPage === totalPages} className="px-7 py-2  bg-blue-200 text-blue-900 font-semibold rounded disabled:opacity-50 hover:bg-blue-300"
                   style={{
                   color: "var(--color-primary)"
                             
                           }} 
                  >
                    Next
                  </button>
                </div>

        </div>
      </div>
    </div>
  );
}

export default SupplierOrders;