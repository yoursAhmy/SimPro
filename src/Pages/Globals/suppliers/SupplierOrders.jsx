
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

function Orders() {
  const companyID = useSelector(selectCompanyId);
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(() => {
    const savedPage = localStorage.getItem("ordersCurrentPage");
    return savedPage ? parseInt(savedPage, 10) : 1;
  });
  const rowsPerPage = 20;
  const [selectedOrder, setSelectedOrder] = useState(null);
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

  // Fetch orders from API
  useEffect(() => {
    if (!companyID) return;

    setLoading(true);
    axios
      .get(`${BASE_URL}/supplier/supplierorders?companyID=${companyID}`)
      .then((res) => {
        let data = [];
        if (Array.isArray(res.data.vendorOrders)) {
          data = res.data.vendorOrders;
        }
        setOrders(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [companyID]);

  // Pagination
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const totalPages = Math.ceil(filteredOrders.length / rowsPerPage);
  const currentOrders = filteredOrders.slice(indexOfFirst, indexOfLast);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  useEffect(() => {
    localStorage.setItem("ordersCurrentPage", currentPage);
  }, [currentPage]);

  return (
    <div className="flex min-h-screen md:h-screen md:overflow-hidden">
      {/* Sidebar */}
      <Sidebar />
      

      {/* Main */}
      <div className="flex flex-col flex-1 h-screen w-full overflow-x-hidden">
        {/* Header */}
        <header className="flex justify-between items-center bg-white shadow-sm h-16 mb-2 px-10 sm:px-6 md:px-12 border-b w-full">
          <h1 className="text-3xl ml-10 lg:ml-0 font-semibold text-gray-800">
            Orders
          </h1>
          <img src={logo} alt="Company Logo" className="h-12 w-auto" />
        </header>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 shadow-md bg-white p-4 w-full">
          {/* Search */}
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

          {/* Filter by Stage */}
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
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </select>

          {/* Date Range */}
          <div className="relative">
            <div
              className="flex items-center p-3 border border-gray-300 rounded-lg bg-white cursor-pointer"
              onClick={() => setShowCalendar(!showCalendar)}
            >
              <CalendarIcon className="h-5 w-5 mr-2 text-gray-500" />
              <div>
                <p className="text-sm font-semibold text-gray-700">
                  Date Range
                </p>
                <p className="text-xs text-gray-600">
                  {formatDate(dateRange[0].startDate)} -{" "}
                  {formatDate(dateRange[0].endDate)}
                </p>
              </div>
            </div>
            {showCalendar && (
              <div className="absolute mt-2 z-50 mr-8 bg-white shadow-lg border rounded-lg">
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
        <div className="container mx-auto px-4 sm:px-6 py-8 flex-1 max-w-full overflow-x-hidden">
          <p className="px-6 py-3 text-gray-700 text-lg">
            Showing all {filteredOrders.length} orders
          </p>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <FiLoader className="h-10 w-10 text-blue-500 animate-spin" />
                <p className="mt-4 text-gray-600 font-medium">
                  Loading orders...
                </p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No orders found.
              </div>
            ) : (
              <>
                <table className="w-full table-fixed divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Reference
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Stage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        ExTax
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        IncTax
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentOrders.map((order) => (
                      <tr
                        key={order.ID}
                        onClick={() => setSelectedOrder(order)}
                        className="cursor-pointer hover:bg-gray-100"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {order.ID}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {order.Reference || "N/A"}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {order.Stage}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {order?.Totals?.ExTax ?? "N/A"}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {order?.Totals?.IncTax ?? "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Modal */}
                {selectedOrder && (
                  <div className="fixed mt-40 inset-0 bg-transparent flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-96 max-h-[90vh] p-6 relative overflow-hidden">
                      <button
                        className="absolute top-3 right-3 cursor-pointer text-gray-500 hover:text-gray-700"
                        onClick={() => setSelectedOrder(null)}
                      >
                        ✖
                      </button>
                      <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
                        Order Details
                      </h2>
                      <div className="space-y-2 text-sm text-gray-700">
                        <p>
                          <strong>ID:</strong> {selectedOrder.ID}
                        </p>
                        <p>
                          <strong>Stage:</strong> {selectedOrder.Stage}
                        </p>
                        <p>
                          <strong>Reference:</strong> {selectedOrder.Reference}
                        </p>
                        <p>
                          <strong>ExTax:</strong> {selectedOrder?.Totals?.ExTax ?? "N/A"}
                        </p>
                        <p>
                          <strong>IncTax:</strong> {selectedOrder?.Totals?.IncTax ?? "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pagination */}
                <div className="flex flex-col sm:flex-row justify-between items-center p-4 bg-gray-50 border-t gap-2 sm:gap-0">
                  <button
                    onClick={handlePrev}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-blue-200 text-blue-900 font-semibold rounded disabled:opacity-50 hover:bg-blue-300"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-blue-200 text-blue-900 font-semibold rounded disabled:opacity-50 hover:bg-blue-300"
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Orders;