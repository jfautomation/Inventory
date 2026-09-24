import DetailRow from "./DetailRow";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";



type DetailCardProps = {
  product: any;
};

export default function DetailCard({
  product,
}: DetailCardProps) {

  const navigate = useNavigate();

  return (
    <div
      className="
        border
        border-gray-200
        rounded-xl
        p-5
        bg-white
      "
    >

      {/* Product Title */}
      <div
        className="
          mb-6
        "
      >

        <div
          className="
            text-sm
            text-gray-500
          "
        >
          Title
        </div>

        <div
          className="
            text-xl
            font-semibold
          "
        >
          {product.title || "-"}
        </div>

      </div>


      <DetailRow
        label="Brand"
        value={product.brand?.[0]?.name}
      />


      {/* <DetailRow
        label="Part"
        value={product.part?.[0]?.name}
      /> */}
      <DetailRow
        label="Part"
        value={
          product.part?.[0] ? (
            <Link
              to={`/part/${product.part[0].id}`}
              className="
          text-blue-600
          hover:underline
          font-medium
        "
            >
              {product.part[0].name}
            </Link>
          ) : (
            "-"
          )
        }
      />


      <DetailRow
        label="Category"
        value={product.inventory_category?.[0]?.name}
      />


      <DetailRow
        label="Serial Number"
        value={product.serial_number}
      />


      <DetailRow
        label="Condition"
        value={product.condition?.[0]?.name}
      />


      <DetailRow
        label="Work Order"
        value={product.work_order}
      />


      {/* Notes */}
      <div
        className="
          mt-6
          pt-5
          border-t
          border-gray-200
        "
      >

        <div
          className="
            text-sm
            text-gray-500
            mb-2
          "
        >
          Notes
        </div>

        {product.notes ? (
          <p
            className="
              text-sm
              leading-6
              text-gray-700
              whitespace-pre-wrap
            "
          >
            {product.notes}
          </p>
        ) : (
          <p
            className="
              text-sm
              italic
              text-gray-400
            "
          >
            No notes added.
          </p>
        )}

      </div>

    </div>
  );
}

