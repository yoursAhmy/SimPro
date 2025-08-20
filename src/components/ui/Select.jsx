import React, { useState, useEffect, useRef } from "react";

export default function Select({
  value,
  onValueChange,
  placeholder,
  options = [],
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const ref = useRef();

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm(""); // reset search on close
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const normalizedOptions = options.map((opt) => ({
    label: opt?.label || opt?.Name || "",
    value: opt?.value || opt?.ID || "",
  }));

  const filteredOptions = normalizedOptions.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  return (
    <div className={`relative w-full sm:w-auto min-w-[200px] ${className}`} ref={ref}>
      {/* Selected Button */}
      <button
        type="button"
        className="w-full h-[50px] px-5 text-left bg-white border border-gray-200 rounded shadow-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 truncate transition-all"
        onClick={() => setIsOpen(!isOpen)}
        title={selectedOption ? selectedOption.label : ""}
      >
        <span className="truncate block">
          {selectedOption ? selectedOption.label : placeholder || "Select..."}
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full rounded shadow-lg bg-white border border-gray-200 overflow-hidden">
          {/* Search input - matches the search bar styling */}
          <div className="px-2 py-2 border-b border-gray-200">
            <input
              type="text"
              className="w-full h-[50px] px-5 text-lg border border-gray-200 rounded shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-all"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
          
          {/* Filtered list */}
          <ul className="max-h-60 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <li className="h-[50px] px-5 flex items-center  text-gray-500 sm:text-sm md:text-lg">
                No results found
              </li>
            ) : (
              filteredOptions.map((opt) => (
                <li
                  key={opt.value}
                  title={opt.label}
                  className={`cursor-pointer h-[50px] px-5 flex items-center text-lg hover:bg-blue-100 ${
                    opt.value === value ? "bg-blue-200 font-semibold" : ""
                  }`}
                  onClick={() => {
                    onValueChange(opt.value);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                >
                  <span className="truncate block">{opt.label}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}