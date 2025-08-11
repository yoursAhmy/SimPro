import React from 'react'
import { NavLink } from 'react-router-dom';
import Sidebar from '../../components/sidebar/Sidebar';

function Suppliers() {

    const menuItems = [
    { name: "Catalogs", path: "/companies/catalogs" },
    { name: "Prebuilds", path: "/companies/prebuilds" },
    { name: "Quotes", path: "/companies/quotes" },
    { name: "Jobs", path: "/companies/jobs" },
    { name: "Suppliers", path: "/companies/suppliers" },
  ];
  return (
    <>
      <Sidebar/>
    </>
  )
}

export default Suppliers
