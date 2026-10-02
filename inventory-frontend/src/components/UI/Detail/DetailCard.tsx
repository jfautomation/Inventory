import DetailRow from "./DetailRow";
import { Link } from "react-router-dom";

type DetailCardProps = {
  product?: any;
  part?: any;
  brand?: any;
  category?: any;
};

export default function DetailCard({
  product,
  part,
  brand,
  category,
}: DetailCardProps) {

  const isPart = !!part;

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

      {isPart ? (

        <>
          {/* Part Name */}
          <div className="mb-6">

            <div className="text-sm text-gray-500">
              Part Name
            </div>

            <div className="text-xl font-semibold">
              {part.name || "-"}
            </div>

          </div>


          <DetailRow
            label="Part Number"
            value={part.part_number || "-"}
          />


          <DetailRow
            label="Brand"
            value={brand?.name || "-"}
          />


          <DetailRow
            label="Category"
            value={category?.name || "-"}
          />



          <DetailRow
            label="Base Price"
            value={
              part.base_price != null
                ? `$${Number(
                  part.base_price
                ).toLocaleString()}`
                : "-"
            }
          />


          {/* Short Description */}
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
              Short Description
            </div>

            {part.short_description ? (
              <p
                className="
                  text-sm
                  leading-6
                  text-gray-700
                  whitespace-pre-wrap
                "
              >
                {part.short_description}
              </p>
            ) : (
              <p
                className="
                  text-sm
                  italic
                  text-gray-400
                "
              >
                No short description added.
              </p>
            )}

          </div>



        </>

      ) : (

        <>
          {/* Product Title */}
          <div className="mb-6">

            <div className="text-sm text-gray-500">
              Title
            </div>

            <div className="text-2xl font-semibold">
              {product.title || "-"}
            </div>

          </div>


          <DetailRow
            label="Brand"
            value={product.brand?.[0]?.name}
          />


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
            value={
              product.inventory_category?.[0]?.name
            }
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
            label="List Price"
            value={
              product.list_price != null
                ? `$${Number(
                  product.list_price
                ).toLocaleString()}`
                : "-"
            }
          />


          <DetailRow
            label="Work Order"
            value={product.work_order}
          />


          {/* Short Description */}
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
              Short Description
            </div>

            {product.short_description ? (
              <p
                className="
                  text-sm
                  leading-6
                  text-gray-700
                  whitespace-pre-wrap
                "
              >
                {product.short_description}
              </p>
            ) : (
              <p
                className="
                  text-sm
                  italic
                  text-gray-400
                "
              >
                No short description added.
              </p>
            )}

          </div>


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

        </>

      )}

    </div>
  );
}