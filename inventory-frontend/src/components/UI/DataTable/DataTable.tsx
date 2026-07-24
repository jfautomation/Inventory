import type { DataTableProps } from "./DataTable.types";


export default function DataTable<T>({
  columns,
  data,
  onRowClick,
  loading = false,
}: DataTableProps<T>) {


  if (loading) {
    return (
      <div className="p-6 text-gray-500">
        Loading...
      </div>
    );
  }


  return (
    <div
      className="
        overflow-x-auto
        rounded-xl
        border
        border-gray-200
        bg-white
      "
    >

      <table
        className="
          w-full
          text-sm
        "
      >

        <thead
          className="
            bg-gray-50
            border-b
          "
        >

          <tr>

            {columns.map((column) => (

              <th
                key={String(column.key)}
                className="
                  px-4
                  py-3
                  text-left
                  font-semibold
                  text-gray-700
                "
              >
                {column.label}
              </th>

            ))}

          </tr>

        </thead>


        <tbody>

          {data.map((row, index) => (

            <tr
              key={index}
              onClick={() => onRowClick?.(row)}
              className="
                border-b
                hover:bg-gray-50
                transition
              "
            >

              {columns.map((column) => (

                <td
                  key={String(column.key)}
                  className="
                    px-4
                    py-3
                  "
                >

                  {column.render
                    ? column.render(row)
                    : String(row[column.key as keyof T] ?? "-")
                  }

                </td>

              ))}

            </tr>

          ))}

        </tbody>


      </table>

    </div>
  );
}