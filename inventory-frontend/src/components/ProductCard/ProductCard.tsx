type Props = {
  product: any;

  onView?: (id: number) => void;
  onEdit?: (product: any) => void;
  onDelete?: (id: number) => void;
};

const ProductCard = ({ product, onView, onEdit, onDelete }: Props) => {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        padding: 12,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      {/* LEFT SIDE */}
      <div
        onClick={() => onView?.(product.id)}
        style={{ cursor: "pointer" }}
      >
        <strong>{product.title}</strong>

        <div style={{ fontSize: 12, opacity: 0.7 }}>
          {product.serial_number || "-"}
        </div>

        <div style={{ fontSize: 12, opacity: 0.7 }}>
          {product.work_order || "-"}
        </div>
      </div>

      {/* ACTIONS */}
      <div style={{ display: "flex", gap: 8 }}>
        {/* EDIT */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.(product);
          }}
        >
          Edit
        </button>

        {/* DELETE */}
        <button
          onClick={(e) => {
            e.stopPropagation();

            const confirmDelete = window.confirm(
              `Are you sure you want to delete "${product.title}"?`
            );

            if (!confirmDelete) return;

            onDelete?.(product.id);
          }}
          style={{ color: "red" }}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default ProductCard;