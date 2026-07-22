import { Outlet } from "react-router-dom";

import TopNavbar from "../TopNav/TopNavbar";


export default function AppLayout() {

  return (
    <div className="min-h-screen bg-gray-100">

      <TopNavbar />


      <Outlet />

    </div>
  );
}