import type { DataTableProps } from "./DataTable.types";
import PageHeader from "../PageHeader";

export default function DataTable<T>({
  columns,
  data,
  loading = false,
  getRowKey,
  headerTitle,
  breadcrumbs,
  headerActions,
  toolbar,
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
        overflow-hidden
        rounded-xl
        border
        border-gray-200
        bg-white
      "
    >

      {/* =====================================================
          TABLE HEADER
      ===================================================== */}

      {headerTitle && (
        <PageHeader
          title={headerTitle}
          breadcrumbs={breadcrumbs}
        >
          {headerActions}
        </PageHeader>
      )}

      {/* =====================================================
          TOOLBAR / FILTERS
      ===================================================== */}

      {toolbar && (
        <div className="p-4 border-b border-gray-200">
          {toolbar}
        </div>
      )}

      {/* =====================================================
          TABLE
      ===================================================== */}

      <div className="overflow-x-auto">

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
                key={
                  getRowKey
                    ? getRowKey(row)
                    : index
                }
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
                      : String(
                          row[column.key as keyof T] ?? "-"
                        )
                    }
                  </td>

                ))}

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}