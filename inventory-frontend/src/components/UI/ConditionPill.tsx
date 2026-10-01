import React from "react";

interface ConditionPillProps {
  condition: string;
}

const conditionStyles: Record<string, string> = {
  "Brand New": "bg-green-100 text-green-700",
  "Like New": "bg-blue-100 text-blue-700",
  Refurbished: "bg-purple-100 text-purple-700",
  "Parts Only": "bg-orange-100 text-orange-700",
};

const ConditionPill: React.FC<ConditionPillProps> = ({ condition }) => {
  const style =
    conditionStyles[condition] ?? "bg-gray-100 text-gray-700";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${style}`}
    >
      {condition}
    </span>
  );
};

export default ConditionPill;