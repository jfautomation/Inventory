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
            key: "title",
            label: "Product",
            render: (product: any) =>
                product.title?.rendered ?? "-"
        },


        {
            key: "brand",
            label: "Brand",
            render: (product: any) =>
                product.brand?.[0]?.name ?? "-"
        },


        {
            key: "inventory_category",
            label: "Category",
            render: (product: any) =>
                product.inventory_category?.[0]?.name ?? "-"
        },


        {
            key: "condition",
            label: "Condition",
            render: (product: any) =>
                product.condition?.[0]?.name ?? "-"
        },


        {
            key: "inventory_status",
            label: "Status",
            render: (product: any) =>
                product.inventory_status ?? "-"
        },


        {
            key: "quantity",
            label: "Qty",
        },


        {
            key: "list_price",
            label: "List Price",
            render: (product: any) =>
                `$${product.list_price ?? 0}`,
        },


        {
            key: "test_status",
            label: "Test Status",
            render: (product: any) =>
                product.test_status ? "Passed" : "Failed",
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