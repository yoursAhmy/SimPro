import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon, Bars3Icon } from "@heroicons/react/24/outline";
import { useSelector, useDispatch } from "react-redux";
import { setCatalogs } from "../../store/slices/CatalogSlice";
import companyLogo from "../../assets/simproMonoBlackLogo.png";

function Sidebar() {
  const companyID = useSelector((state) => state.prebuild?.companyId);
  const BASE_URL = import.meta.env.VITE_API_URL;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredSupplier, setHoveredSupplier] = useState(false);
  const page = 1;

  useEffect(() => {
    const handleResize = () => {
      const mobileBreakpoint = 1024;
      setIsMobile(window.innerWidth < mobileBreakpoint);
      if (window.innerWidth >= mobileBreakpoint) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleCatalog = (companyID, page) => {
    if (!companyID) {
      console.error("Company ID not found");
      return;
    }
    fetch(`${BASE_URL}/catalogs/allcatalogs?companyID=${companyID}&page=${page}`)
      .then((res) => res.ok ? res.json() : Promise.reject())
      .then((data) => dispatch(setCatalogs(data.catalogs)))
      .catch(console.error);
  };

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => isMobile && setIsOpen(false);

  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: "-100%" },
  };

  // Check if current path is a supplier sub-item
  const isSupplierSubItemActive = () => {
    return supplierSubItems.some(subItem => 
      location.pathname.includes(subItem.path.split('/').pop())
    );
  };

  const menuItems = [
    { name: "Prebuilds", path: "/companies/prebuilds" },
    {
      name: "Catalogs",
      path: "/companies/catalogs",
      action: () => handleCatalog(companyID, page),
    },
    { name: "Quotes", path: "/companies/quotes" },
    { name: "Jobs", path: "/companies/jobs" },
    { name: "Suppliers" },
  ];

  const supplierSubItems = [
    { name: "Suppliers Invoices", path: "/companies/supplierInvoices" },
    { name: "Suppliers Orders", path: "/companies/supplierOrders" },
  ];

  return (
    <>
      {/* Hamburger Button - Only mobile */}
      {isMobile && !isOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-lg lg:hidden"
          aria-label="Toggle menu"
        >
          <Bars3Icon className="h-5 w-5 text-gray-700" />
        </button>
      )}

      {/* Sidebar */}
      <div className="sticky top-0 h-screen z-30">
        <AnimatePresence>
          <motion.div
            initial={isMobile ? "closed" : "open"}
            animate={isOpen ? "open" : "closed"}
            exit="closed"
            variants={sidebarVariants}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`h-full bg-white border-r border-gray-200 shadow-lg overflow-hidden fixed lg:relative lg:shadow-none ${
              isMobile ? "w-64" : "w-[250px]"
            }`}
          >
            <div className="flex flex-col h-full">
              {/* Close Button */}
              {isMobile && (
                <button
                  onClick={closeSidebar}
                  className="self-end p-4 text-gray-500 hover:text-gray-700 lg:hidden"
                  aria-label="Close menu"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              )}

              {/* Logo */}
              <div className="px-6 py-4">
                <button
                  onClick={() => navigate("/")}
                  className="cursor-pointer"
                >
                  <img 
                    src={companyLogo} 
                    alt="Company Logo" 
                    className={`${
                      isMobile ? "h-10" : "h-12"
                    } w-auto`}
                  />
                </button>
              </div>

              {/* Menu Items */}
              <nav className="flex-1 overflow-y-auto px-2">
                <ul className="space-y-1">
                  {menuItems.map((item) => (
                    <li key={item.name}>
                      <div 
                        onMouseEnter={() => item.name === "Suppliers" && setHoveredSupplier(true)}
                        onMouseLeave={() => item.name === "Suppliers" && setHoveredSupplier(false)}
                      >
                        {item.path ? (
                          <NavLink
                            to={item.path}
                            onClick={() => {
                              if (item.action) item.action();
                              closeSidebar();
                            }}
                            className={({ isActive }) =>
                              `block px-4 py-3 ${
                                isMobile ? "text-sm" : "text-base"
                              } font-medium rounded-md mx-2 transition-colors duration-200 ${
                                isActive
                                  ? "bg-blue-50 text-blue-600 border-l-4 border-blue-500"
                                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                              }`
                            }
                          >
                            {item.name}
                          </NavLink>
                        ) : (
                          <div
                            className={`block px-4 py-3 ${
                              isMobile ? "text-sm" : "text-base"
                            } font-medium rounded-md mx-2 transition-colors duration-200 ${
                              isSupplierSubItemActive()
                                ? "bg-blue-50 text-blue-600 border-l-4 border-blue-500"
                                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                            }`}
                          >
                            {item.name}
                          </div>
                        )}
                        
                        {/* Supplier sub-items */}
                        {(item.name === "Suppliers" && (hoveredSupplier || isMobile)) && (
                          <div className="ml-6 mt-1 space-y-1">
                            {supplierSubItems.map((subItem) => (
                              <NavLink
                                key={subItem.name}
                                to={subItem.path}
                                onClick={closeSidebar}
                                className={({ isActive }) =>
                                  `block px-4 py-2 ${
                                    isMobile ? "text-xs" : "text-sm"
                                  } font-medium rounded-md mx-2 transition-colors duration-200 ${
                                    isActive
                                      ? "bg-blue-50 text-blue-600 border-l-2 border-blue-500"
                                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                                  }`
                                }
                              >
                                {subItem.name}
                              </NavLink>
                            ))}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}

export default Sidebar;