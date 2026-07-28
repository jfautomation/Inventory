export const productColumns = [
    {
      key: "part",
      label: "Part",
      render: (product: any) =>
        product.part?.[0]?.name ?? "-",
    },

    {
      key: "brand",
      label: "Brand",
      render: (product: any) =>
        product.brand?.[0]?.name ?? "-",
    },

    {
      key: "condition",
      label: "Condition",
      render: (product: any) =>
        product.condition?.[0]?.name ?? "-",
    },

    {
      key: "inventory_status",
      label: "Status",
    },

    {
      key: "quantity",
      label: "Qty",
    },

    {
      key: "list_price",
      label: "Price",
      render: (product: any) =>
        product.list_price
          ? `$${Number(product.list_price).toLocaleString()}`
          : "-",
    },

    {
      key: "test_status",
      label: "Test Status",
      render: (product: any) =>
        product.test_status ? "Passed" : "-",
    },
  ];
