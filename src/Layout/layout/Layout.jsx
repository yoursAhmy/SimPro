import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../../components/NavBar/Navbar'


function Layout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
    </>
  )
}

export default Layout
