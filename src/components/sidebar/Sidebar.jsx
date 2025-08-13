import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon, Bars3Icon } from "@heroicons/react/24/outline";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { setCatalogs } from "../../store/slices/CatalogSlice";
import companyLogo from "../../assets/simproMonoBlackLogo.png";
import { useNavigate } from "react-router-dom";

function Sidebar() {
  const companyID = useSelector((state) => state.prebuild?.companyId);
  const BASE_URL = import.meta.env.VITE_API_URL;
  const dispatch = useDispatch();

  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const page = 1;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsOpen(true);
      }
    };

    handleResize(); // Set initial state
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleCatalog = (companyID, page) => {
    if (companyID === null ) {
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
    if (isMobile) {
      setIsOpen(false);
    }
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
    { name: "Prebuilds", path: "/companies/prebuilds" },
    {
      name: "Catalogs",
      path: "/companies/catalogs",
      action: () => handleCatalog(companyID, page),
    },
    { name: "Quotes", path: "/companies/quotes" },
    { name: "Jobs", path: "/companies/jobs" },
    { name: "Suppliers", path: "/companies/suppliers" },
  ];

  return (
    <>
      {/* Hamburger Button - Only shown on mobile */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-lg lg:hidden"
          aria-label="Toggle menu"
        >
          <Bars3Icon className="h-6 w-6 text-gray-700" />
        </button>
      )}

      {/* Overlay - Only shown on mobile when sidebar is open */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={overlayVariants}
            onClick={closeSidebar}
            className="fixed inset-0 bg-black z-40 lg:hidden"
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className="sticky top-0 h-screen z-30">
        <AnimatePresence>
          <motion.div
            initial={isMobile ? "closed" : "open"}
            animate={isOpen ? "open" : "closed"}
            exit="closed"
            variants={sidebarVariants}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`w-[250px] h-full bg-white border-r border-gray-200 shadow-lg overflow-hidden ${
              !isMobile ? "lg:relative lg:shadow-none" : "fixed"
            }`}
          >
            <div className="flex flex-col h-full">
              {/* Close Button - Only shown on mobile */}
              {isMobile && (
                <button
                  onClick={closeSidebar}
                  className="self-end p-4 text-gray-500 hover:text-gray-700 lg:hidden"
                  aria-label="Close menu"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              )}

              {/* Menu Items */}
              <div className="flex flex-col py-2 overflow-y-auto">
                <ol className="flex flex-col space-y-1">
                  <button
                    className="w-[140px] h-[70px] ml-7 mb-4 cursor-pointer"
                    onClick={() => navigate("/")}
                  >
                    <img src={companyLogo} alt="Company Logo" />
                  </button>

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
      </div>
    </>
  );
}

export default Sidebar;