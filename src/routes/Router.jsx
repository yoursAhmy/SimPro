import { createBrowserRouter, RouterProvider} from "react-router-dom";
// import Layout from "../Layout/layout/layout";
import Companies from "../Pages/Globals/Companies";
import Signin from "../Pages/Globals/Signin";
import Signup from "../Pages/Globals/SignUp";
import Prebuilds from "../Pages/Globals/Prebuilds";
import Sidebar from "../components/sidebar/Sidebar";
import Catalogs from "../Pages/Globals/Catalogs";
import Jobs from "../Pages/Globals/Jobs";


// import Suppliers from "../Pages/suppliers/Suppliers";
import Quotes from "../Pages/Globals/Quotes";
import SupplierInvoices from "../Pages/Globals/suppliers/SupplierInvoices";
import SupplierOrders from "../Pages/Globals/suppliers/SupplierOrders";


const router =  createBrowserRouter([
    {
        path: "",
        // element: <Layout/>,
        children: [
            {path:"/", element:<Companies /> },

        {path: "/sidebar", element: <Sidebar/>, },
        {path: "/companies/prebuilds", element: <Prebuilds />},
        {path: "/companies/catalogs", element: <Catalogs/> },
        {path: "/companies/jobs", element: <Jobs/> },
        // {path: "/companies/suppliers", element: <Suppliers/> },
        {path: "/companies/quotes", element: <Quotes/> },
        {path: "/companies/supplierInvoices", element: <SupplierInvoices/> },
        {path: "/companies/supplierorders", element: <SupplierOrders/> },

        {path: "/user/signin", element: <Signin /> },
        {path: "/user/signup", element: <Signup />}
        ]
    }
])
function Router() {
  return <RouterProvider router={router} />;
}

export default Router;