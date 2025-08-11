import React from 'react'
import { NavLink } from 'react-router-dom'


function Navbar() {
  return (
    <nav>
        <NavLink to='/user/companies'></NavLink>
        {/* <NavLink to={'/user/signin'}></NavLink> */}
        {/* <NavLink to={'/user/signup'}></NavLink> */}
    </nav>
  )
}

export default Navbar
