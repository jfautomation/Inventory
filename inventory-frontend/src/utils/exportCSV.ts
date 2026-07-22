export const exportProductsCSV = (products: any[]) => {

  const headers = [
    "ID",
    "Name",
    "Brand",
    "Category",
    "Condition",
    "Shelf",
    "Serial Number",
    "Work Order",
    "Status",
    "Quantity",
    "Test Status",
    "Test Date",
    "List Price",
    "Notes",
  ];


  const rows = products.map((product) => [

    product.id,

    product.title,

    product.brand?.[0]?.name || "",

    product.inventory_category?.[0]?.name || "",

    product.condition?.[0]?.name || "",

    product.shelf?.[0]?.name || "",

    product.serial_number || "",

    product.work_order || "",

    product.inventory_status || "",

    product.quantity || "",

    product.test_status ? "Yes" : "No",

    product.test_date || "",

    product.list_price || "",

    product.notes || "",

  ]);



  const csvContent = [
    headers,
    ...rows,
  ]
    .map(row =>
      row
        .map(value =>
          `"${String(value).replace(/"/g, '""')}"`
        )
        .join(",")
    )
    .join("\n");



  const blob = new Blob(
    [csvContent],
    {
      type: "text/csv;charset=utf-8;",
    }
  );


  const url = URL.createObjectURL(blob);


  const link = document.createElement("a");

  link.href = url;

  link.download = "inventory_products.csv";

  link.click();


  URL.revokeObjectURL(url);

};