import { capitalize } from "../../../utils/helpers";

type StatCardProps = {
  label: string;
  value: string | number | undefined;
  type?: "status" | "stock";
};


export default function StatCard({
  label,
  value,
  type,
}: StatCardProps) {


  const renderValue = () => {

    // STATUS PILL
    if (type === "status") {

      const isActive =
        String(value).toLowerCase() === "active";


      return (
        <span
          className={`
            inline-flex
            items-center
            px-3
            py-1
            rounded-full
            text-sm
            font-medium
            ${
              isActive
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }
          `}
        >
          {capitalize(value)}
        </span>
      );
    }


    // STOCK COLOR
    if (type === "stock") {

      const inStock = Number(value) > 0;


      return (
        <span
          className={`
            font-semibold
            ${
              inStock
                ? "text-green-600"
                : "text-red-600"
            }
          `}
        >
          {value}
        </span>
      );
    }


    return value || "-";
  };


  return (
    <div
      className="
        text-center
      "
    >

      <div
        className="
          text-sm
          text-gray-500
          mb-1
        "
      >
        {label}
      </div>


      <div
        className="
          text-lg
          font-semibold
        "
      >
        {renderValue()}
      </div>


    </div>
  );
}