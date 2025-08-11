import { createBrowserRouter, RouterProvider} from "react-router-dom";
import Layout from "../Layout/layout/layout";
import Companies from "../Pages/Companies/Companies";
import Signin from "../Pages/signIn/Signin";
import Signup from "../Pages/signup/SignUp";
import Prebuilds from "../Pages/Prebuilds/Prebuilds";
import Sidebar from "../components/sidebar/Sidebar";
import Catalogs from "../Pages/catalogs/Catalogs";
import Jobs from "../Pages/jobs/Jobs";
import Suppliers from "../Pages/suppliers/Suppliers";
import Quotes from "../Pages/quotes/Quotes";


const router =  createBrowserRouter([
    {
        path: "",
        element: <Layout/>,
        children: [
            {path:"/companies", element:<Companies /> },

        {path: "/sidebar", element: <Sidebar/>, },
        {path: "/companies/prebuilds", element: <Prebuilds />},
        {path: "/companies/catalogs", element: <Catalogs/> },
        {path: "/companies/jobs", element: <Jobs/> },
        {path: "/companies/suppliers", element: <Suppliers/> },
        {path: "/companies/quotes", element: <Quotes/> },

        {path: "/user/signin", element: <Signin /> },
        {path: "/user/signup", element: <Signup />}
        ]
    }
])
function Router() {
  return <RouterProvider router={router} />;
}

export default Router;