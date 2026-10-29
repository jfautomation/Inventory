import { Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import TopNavbar from "../TopNav/TopNavbar";
import Sidebar from "../Sidebar/Sidebar";
import MobileMenu from "../MobileMenu/MobileMenu";
import { useInventory } from "../../../context/InventoryContext";

type BreadcrumbItem = {
  label: string;
  path?: string;
};

const formatSlug = (slug?: string) => {
  if (!slug) return "";

  return decodeURIComponent(slug)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

export default function AppLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const { products, parts } = useInventory();

  const segments = location.pathname.split("/").filter(Boolean);

  let breadcrumbs: BreadcrumbItem[] = [];

  if (segments[0] === "products") {
    if (segments.length === 1) {
      breadcrumbs = [{ label: "Products" }];
    } else {
      const id = segments[1];

      const product = products.find(
        (item) => String(item.id) === id
      );

      breadcrumbs = [
        { label: "Products", path: "/products" },
        {
          label:
            product?.title ||
            formatSlug(segments[2]) ||
            `Product ${id}`,
        },
      ];
    }
  } else if (segments[0] === "parts") {
    if (segments.length === 1) {
      breadcrumbs = [{ label: "Parts" }];
    } else {
      const id = segments[1];

      const part = parts.find(
        (item) => String(item.id) === id
      );

      breadcrumbs = [
        { label: "Parts", path: "/parts" },
        {
          label:
            part?.name ||
            formatSlug(segments[2]) ||
            `Part ${id}`,
        },
      ];
    }
  } else {
    breadcrumbs = [{ label: "Dashboard" }];
  }

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