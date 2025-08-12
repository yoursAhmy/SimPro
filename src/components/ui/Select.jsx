import React, { useState, useEffect, useRef } from "react";

export default function Select({
  value,
  onValueChange,
  placeholder,
  options = [],
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

  // Normalizing options so both formats are supported
  const normalizedOptions = options.map((opt) => ({
    label: opt?.label || opt?.Name || "",
    value: opt?.value || opt?.ID || "",
  }));

  const filteredOptions = normalizedOptions.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  return (
    <div className="relative inline-block w-[280px]" ref={ref}>
      {/* Selected Button */}
      <button
        type="button"
        className="w-full h-[52px] px-4 text-left bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 truncate"
        onClick={() => setIsOpen(!isOpen)}
        title={selectedOption ? selectedOption.label : ""} // tooltip for selected
      >
        <span className="truncate block">
          {selectedOption ? selectedOption.label : placeholder || "Select..."}
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full rounded-md bg-white border border-gray-300 shadow-lg overflow-hidden">
          {/* Search input */}
          <input
            type="text"
            className="w-full h-[44px] px-3 border-b border-gray-300 focus:outline-none"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
          {/* Filtered list */}
          <ul className="max-h-60 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <li className="px-4 py-2 text-gray-500">No results found</li>
            ) : (
              filteredOptions.map((opt) => (
                <li
                  key={opt.value}
                  title={opt.label} // tooltip for each option
                  className={`cursor-pointer h-[44px] flex items-center px-4 hover:bg-blue-100 ${
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
