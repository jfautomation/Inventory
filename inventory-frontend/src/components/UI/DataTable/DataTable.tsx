import type { DataTableProps } from "./DataTable.types";
import PageHeader from "../PageHeader";
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


      {/* TOOLBAR / FILTERS */}
      {toolbar && (
        <div className="p-4">
          {toolbar}
        </div>
      )}



      {/* TABLE SECTION */}
      <div className="px-4 pb-4">
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          {/* TABLE SECTION HEADER */}
          {tableHeader && (
            <>
              <TableHeader
                icon={tableHeaderIcon ?? <Package size={20} />}
                header={tableHeader}
              />

              <div className="border-t border-gray-200" />
            </>
          )}

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={String(column.key)}
                      className="px-4 py-3 text-left font-semibold text-gray-500"
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {data.map((row, index) => (
                  <tr
                    key={getRowKey ? getRowKey(row) : index}
                    className="border-b transition hover:bg-gray-50"
                  >
                    {columns.map((column) => (
                      <td
                        key={String(column.key)}
                        className="px-4 py-3 text-black"
                      >
                        {column.render
                          ? column.render(row)
                          : String(
                            row[column.key as keyof T] ?? "-"
                          )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
