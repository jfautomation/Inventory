
import type {
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "ghost"
  | "grey";

export type ButtonSize = "sm" | "md" | "lg";

export type ButtonShape = "default" | "square";

export type ButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> & {
  children?: ReactNode;
  icon?: ReactNode;
  label?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
};
