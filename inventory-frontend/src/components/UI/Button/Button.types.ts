export type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "ghost";


export type ButtonSize =
  | "sm"
  | "md"
  | "lg";


export type ButtonProps = {
  children: React.ReactNode;

  variant?: ButtonVariant;

  size?: ButtonSize;

  type?: "button" | "submit" | "reset";

  disabled?: boolean;

  onClick?: () => void;

  className?: string;
};