import { NavLink } from "react-router-dom";
import navigation from "../navigation";
import { useModal } from "../../../context/ModalContext"

export default function Sidebar() {

  const { openProduct } = useModal();

  return (
    <aside
      className="
        hidden
        md:block
        w-64
        bg-white
        border-r
        min-h-screen
      "
    >

      <nav className="p-4 space-y-2">

        {navigation.map((item) => (

          item.path ? (

            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `
        block
        rounded
        px-3
        py-2
        transition-colors
        ${isActive
                  ? "bg-gray-200 font-semibold"
                  : "hover:bg-gray-100"
                }
        `
              }
            >
              {item.name}
            </NavLink>

          ) : (

            <button
              onClick={openProduct}
              key={item.name}
              className="
        block
        w-full
        text-left
        rounded
        px-3
        py-2
        hover:bg-gray-100
      "
            >
              {item.name}
            </button>

          )

        ))}

      </nav>

    </aside>
  );
}