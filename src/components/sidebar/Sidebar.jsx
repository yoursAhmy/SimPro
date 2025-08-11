import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { setCatalogs } from "../../store/slices/CatalogSlice"



function Sidebar() {
  const companyID = useSelector((state) => state.companyID);
  const BASE_URL = import.meta.env.VITE_API_URL;
  const dispatch = useDispatch();

  const [isOpen, setIsOpen] = useState(false);
  const page = 1;

  const handleCatalog = (companyID, page) => {
    if (!companyID) {
      console.error("Company ID not found");
      return;
    }
    fetch(`${BASE_URL}/catalogs/allcatalogs?companyID=${companyID}&page=${page}`)
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
        throw new Error("Failed to fetch catalogs");
      })
      .then((data) => {
        console.log("Catalogs data:", data);
        dispatch(setCatalogs(data.catalogs));
      })
      .catch((err) => {
        console.error("Error while fetching catalogs", err);
      });
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: "-100%" },
  };

  const overlayVariants = {
    open: { opacity: 0.5 },
    closed: { opacity: 0 },
  };

  const menuItems = [
    { name: "Catalogs", path: "/companies/catalogs", action: () => handleCatalog(companyID, page) },
    { name: "Prebuilds", path: "/companies/prebuilds" },
    { name: "Quotes", path: "/companies/quotes" },
    { name: "Jobs", path: "/companies/jobs" },
    { name: "Suppliers", path: "/companies/suppliers" },
  ];

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-lg"
        aria-label="Toggle menu"
      >
        <div
          className={`w-6 h-0.5 bg-gray-700 mb-1.5 transition-all ${
            isOpen ? "rotate-45 translate-y-2" : ""
          }`}
        ></div>
        <div
          className={`w-6 h-0.5 bg-gray-700 mb-1.5 transition-all ${
            isOpen ? "opacity-0" : "opacity-100"
          }`}
        ></div>
        <div
          className={`w-6 h-0.5 bg-gray-700 transition-all ${
            isOpen ? "-rotate-45 -translate-y-2" : ""
          }`}
        ></div>
      </button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={overlayVariants}
            onClick={closeSidebar}
            className="fixed inset-0 bg-black z-40"
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        <motion.div
          initial="closed"
          animate={isOpen ? "open" : "closed"}
          exit="closed"
          variants={sidebarVariants}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed w-[250px] bg-white border-r border-gray-200 h-screen z-50 shadow-lg"
        >
          <div className="flex flex-col h-full">
            {/* Close Button */}
            <button
              onClick={closeSidebar}
              className="self-end p-4 text-gray-500 hover:text-gray-700"
              aria-label="Close menu"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>

            {/* Menu Items */}
            <div className="flex flex-col py-2 overflow-y-auto">
              <ol className="flex flex-col space-y-1">
                {menuItems.map((item) => (
                  <li key={item.name}>
                    <NavLink
                      to={item.path}
                      onClick={() => {
                        if (item.action) item.action();
                        closeSidebar();
                      }}
                      className={({ isActive }) =>
                        `block px-6 py-3 font-medium rounded-md transition-colors duration-200 ${
                          isActive
                            ? "bg-blue-50 text-blue-600 border-l-4 border-blue-500"
                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        }`
                      }
                    >
                      {item.name}
                    </NavLink>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}

export default Sidebar;
