import DataTable from "../../UI/DataTable/DataTable";
import { useNavigate } from "react-router-dom";


type InventoryTableProps = {
    products: any[];
};


export default function InventoryTable({
    products,
}: InventoryTableProps) {

    const navigate = useNavigate();


    const columns = [

  {
    key: "part",
    label: "Part",
    render: (item: any) =>
      item.part?.[0]?.name ?? "-",
  },


  {
    key: "brand",
    label: "Brand",
    render: (item: any) =>
      item.brand?.[0]?.name ?? "-",
  },


  {
    key: "condition",
    label: "Condition",
    render: (item: any) =>
      item.condition?.[0]?.name ?? "-",
  },


  {
    key: "inventory_status",
    label: "Status",
    render: (item: any) =>
      item.inventory_status ?? "-",
  },


  {
    key: "quantity",
    label: "Quantity",
    render: (item: any) =>
      item.quantity ?? 0,
  },


  {
    key: "list_price",
    label: "List Price",
    render: (item: any) =>
      `$${item.list_price ?? 0}`,
  },


  {
    key: "test_status",
    label: "Test Status",
    render: (item: any) =>
      item.test_status ? "Passed" : "Failed",
  },

];


    return (
        <DataTable
            columns={columns}
            data={products}
            onRowClick={(product) =>
                navigate(`/product/${product.id}`)
            }
        />
    );
}