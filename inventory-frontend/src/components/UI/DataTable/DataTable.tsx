
import type { DataTableProps } from "./DataTable.types";
import TableHeader from "./TableHeader";
import { Package } from "lucide-react";

export default function DataTable<T>({
  columns,
  data,
  loading = false,
  getRowKey,
  toolbar,
  tableHeader,
  tableHeaderIcon,
  emptyMessage = "No records found.",
  renderMobileCard,
}: DataTableProps<T>) {
  const columnCount = Math.max(columns.length, 1);

  const getAlignmentClass = (align?: "left" | "center" | "right") => {
    switch (align) {
      case "right":
        return "text-right";
      case "center":
        return "text-center";
      default:
        return "text-left";
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      {toolbar && <div className="p-4">{toolbar}</div>}

      <div className="px-4 pb-4">
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">

          {tableHeader && (
            <>
              <TableHeader
                icon={tableHeaderIcon ?? <Package size={20} />}
                header={tableHeader}
              />
              <div className="border-t border-gray-200" />
            </>
          )}

          {/* Desktop table */}
          <div className={renderMobileCard ? "hidden min-[1318px]:block" : "block"}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-gray-50">
                  <tr>
                    {columns.map((column) => (
                      <th
                        key={String(column.key)}
                        className={`px-4 py-3 font-semibold text-gray-500 ${getAlignmentClass(column.align)}`}
                      >
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={columnCount}
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        Loading...
                      </td>
                    </tr>
                  ) : data.length === 0 ? (
                    <tr>
                      <td
                        colSpan={columnCount}
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        {emptyMessage}
                      </td>
                    </tr>
                  ) : (
                    data.map((row, index) => (
                      <tr
                        key={getRowKey ? getRowKey(row) : index}
                        className="border-b transition hover:bg-gray-50"
                      >
                        {columns.map((column) => (
                          <td
                            key={String(column.key)}
                            className={`px-4 py-3 text-black ${getAlignmentClass(column.align)}`}
                          >
                            {column.render
                              ? column.render(row)
                              : String(row[column.key as keyof T] ?? "-")}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile and tablet cards */}
          {renderMobileCard && (
            <div className="min-[1318px]:hidden p-3">
              {loading ? (
                <div className="py-8 text-center text-sm text-gray-500">
                  Loading...
                </div>
              ) : data.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-500">
                  {emptyMessage}
                </div>
              ) : (
                <div className="space-y-2">
                  {data.map((row, index) => (
                    <div key={getRowKey ? getRowKey(row) : index}>
                      {renderMobileCard(row)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
