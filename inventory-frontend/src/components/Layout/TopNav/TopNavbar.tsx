type TopNavbarProps = {
  onMenuClick: () => void;
};


export default function TopNavbar({ onMenuClick }: TopNavbarProps) {

  return (
    <header
      className="
        h-16
        bg-white
        border-b
        flex
        items-center
        justify-between
        px-4
      "
    >

      {/* Left side */}
      <div className="flex items-center gap-3">

        {/* Mobile hamburger */}
        <button
          className="
            md:hidden
            text-2xl
          "
          onClick={onMenuClick}
        >
          ☰
        </button>


        {/* App title */}
        <h1
          className="
            font-bold
            text-lg
          "
        >
          JF Inventory
        </h1>

      </div>


      {/* Desktop right side */}
      <div
        className="
          hidden
          md:flex
          items-center
          gap-4
        "
      >
        <span>
          User
        </span>
      </div>


    </header>
  );
}