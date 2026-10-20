import { Outlet } from "react-router-dom";
import { useState } from "react";
import TopNavbar from "../TopNav/TopNavbar";
import Sidebar from "../Sidebar/Sidebar";
import MobileMenu from "../MobileMenu/MobileMenu";
import { useModal } from "../../../context/ModalContext";
import { useInventory } from "../../../context/InventoryContext";



export default function AppLayout() {

  const { openProduct } = useModal();

  const { products } = useInventory();

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





      <div className="flex pt-14">


        <Sidebar />


        <main
          className="
          min-w-0 flex-1 md:ml-64"
        >



          <Outlet />

        </main>

      </div>


    </div>
  );
}