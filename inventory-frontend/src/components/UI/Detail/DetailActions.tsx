import Button from "../Button/Button";

type DetailActionsProps = {
  onAdd?: () => void;
  onEdit?: () => void;
  addLabel?: string;
  editLabel?: string;
};

export default function DetailActions({
  onAdd,
  onEdit,
  addLabel = "Add New Product",
  editLabel = "Edit Product Details",
}: DetailActionsProps) {
  return (
    <div
      className="
        flex
        justify-center
        gap-4
        py-6
      "
    >
      <Button
        onClick={onAdd}
      >
        {addLabel}
      </Button>

      <Button
        variant="secondary"
        onClick={onEdit}
      >
        {editLabel}
      </Button>
    </div>
  );
}