import { NavLink } from "react-router-dom";
import navigation from "../navigation";

type MobileMenuProps = {
    isOpen: boolean;
    onClose: () => void;
};


export default function MobileMenu({
    isOpen,
    onClose,
}: MobileMenuProps) {
    if (!isOpen) return null;

    return (
        <div
            className="
        fixed
        inset-0
        bg-black/40
        z-40
        md:hidden
      "
            onClick={onClose}
        >
            <aside
                className="
          w-64
          h-full
          bg-white
          p-4
        "
                onClick={(e) => e.stopPropagation()}
            >
                <nav className="space-y-2">

                    {navigation.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={onClose}
                            className="block rounded p-2 hover:bg-gray-100"
                        >
                            {item.name}
                        </NavLink>
                    ))}

                </nav>
            </aside>
        </div>
    );
}