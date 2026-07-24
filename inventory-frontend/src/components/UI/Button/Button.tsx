import type { ButtonProps } from "./Button.types";


export default function Button({
  children,
  variant = "primary",
  size = "md",
  type = "button",
  disabled = false,
  onClick,
  className = "",
}: ButtonProps) {


  const baseStyles = `
    rounded
    font-medium
    transition
    duration-200
    disabled:opacity-50
    disabled:cursor-not-allowed
  `;


  const variantStyles = {
    primary: `
      bg-blue-600
      text-white
      hover:bg-blue-700
    `,

    secondary: `
      bg-gray-200
      text-gray-800
      hover:bg-gray-300
    `,

    danger: `
      bg-red-600
      text-white
      hover:bg-red-700
    `,

    ghost: `
      bg-transparent
      hover:bg-gray-100
    `,
  };


  const sizeStyles = {
    sm: `
      px-3
      py-1
      text-sm
    `,

    md: `
      px-4
      py-2
    `,

    lg: `
      px-6
      py-3
      text-lg
    `,
  };


  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {children}
    </button>
  );
}