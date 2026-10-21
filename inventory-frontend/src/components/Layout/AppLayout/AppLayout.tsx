import { Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import TopNavbar from "../TopNav/TopNavbar";
import Sidebar from "../Sidebar/Sidebar";
import MobileMenu from "../MobileMenu/MobileMenu";

export default function AppLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const segments = location.pathname.split("/").filter(Boolean);

  const breadcrumbs = segments.map((segment, index) => {
    const path = `/${segments.slice(0, index + 1).join("/")}`;

    const label =
      segment === "products" || segment === "product"
        ? "Products"
        : segment === "parts" || segment === "part"
        ? "Parts"
        : segment === "new"
        ? "New"
        : segment;

    const linkPath =
      segment === "product"
        ? "/products"
        : segment === "part"
        ? "/parts"
        : path;

    return {
      label: label.charAt(0).toUpperCase() + label.slice(1),
      path: index < segments.length - 1 ? linkPath : undefined,
    };
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <TopNavbar
        onMenuClick={() => setIsMobileMenuOpen(true)}
        breadcrumbs={breadcrumbs}
      />

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex pt-14">
        <Sidebar />

        <main className="min-w-0 flex-1 md:ml-64">
          <Outlet />
        </main>
      </div>
    </div>
  );
}