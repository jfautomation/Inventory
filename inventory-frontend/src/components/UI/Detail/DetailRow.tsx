type DetailRowProps = {
  label: string;
  value: string | number | null | undefined;
};

export default function DetailRow({
  label,
  value,
}: DetailRowProps) {
  return (
    <div
      className="
        grid
        grid-cols-[150px_1fr]
        items-center
        py-2
      "
    >

      {/* Label */}
      <div
        className="
          text-sm
          text-gray-500
        "
      >
        {label}
      </div>


      {/* Value */}
      <div
        className="
          font-medium
          text-gray-900
        "
      >
        {value || "-"}
      </div>

    </div>
  );
}