import Button from "../Button/Button";

type DetailActionsProps = {
  onAdd?: () => void;
  onEdit?: () => void;
};

export default function DetailActions({
  onAdd,
  onEdit,
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
        Add New Product
      </Button>


      <Button
        variant="secondary"
        onClick={onEdit}
      >
        Edit Product Details
      </Button>

    </div>
  );
}