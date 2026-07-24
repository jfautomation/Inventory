import type { InputProps } from "./Input.types";

export default function Input({
    label,
    icon,
    className = "",
    ...props
}: InputProps) {
    return (
        <div className="flex flex-col gap-1">

            {label && (
                <label className="text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}

            <div className="relative">

                {icon && (
                    <div
                        className="
              absolute
              left-3
              top-1/2
              -translate-y-1/2
              text-gray-400
              pointer-events-none
            "
                    >
                        {icon}
                    </div>
                )}

                <input
                    {...props}
                    className={`
            w-full
            border
            border-gray-300
            rounded-lg
            py-2
            ${icon ? "pl-10 pr-4" : "px-4"}
            outline-none
            transition

          focus:outline-none
focus:border-gray-400

            disabled:bg-gray-100
            disabled:cursor-not-allowed

            ${className}
          `}
                />

            </div>

        </div>
    );
}