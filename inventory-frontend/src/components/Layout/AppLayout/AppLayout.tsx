import { Outlet } from "react-router-dom";
import { useState } from "react";
import TopNavbar from "../TopNav/TopNavbar";
import Sidebar from "../Sidebar/Sidebar";
import MobileMenu from "../MobileMenu/MobileMenu";
import { useModal } from "../../../context/ModalContext";
import { useInventory } from "../../../context/InventoryContext";
import PageHeader from "../../UI/PageHeader";
import Button from "../../UI/Button/Button";
import { exportProductsCSV } from "../../../utils/exportCSV";


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





      <div className="flex">


        <Sidebar />


        <main
          className="
    flex-1
  "
        >

          {/* <PageHeader
            title="Dashboard: Inventory"
            breadcrumbs={[
              {
                label: "Inventory",
                path: "/inventory",
              },
            ]}
          >
            <Button onClick={openProduct}>
              Add Product
            </Button>

            <Button
              onClick={() => exportProductsCSV(products)}
              variant="secondary"
            >
              Export
            </Button>
          </PageHeader> */}

          <Outlet />

        </main>

      </div>


    </div>
  );
}