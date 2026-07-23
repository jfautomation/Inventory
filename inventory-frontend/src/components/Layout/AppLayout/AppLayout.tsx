import { Outlet } from "react-router-dom";
import { useState } from "react";
import TopNavbar from "../TopNav/TopNavbar";
import Sidebar from "../Sidebar/Sidebar";
import MobileMenu from "../MobileMenu/MobileMenu";


export default function AppLayout() {

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (


    <div className="min-h-screen bg-gray-100">


      <TopNavbar
        onMenuClick={() => setIsMobileMenuOpen(true)}
      />

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />





      <div className="flex">


        <Sidebar />


        <main
          className="
            flex-1
            p-4
          "
        >

          <Outlet />

        </main>


      </div>


    </div>
  );
}