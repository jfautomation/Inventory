import type { InputHTMLAttributes, ReactNode } from "react";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  icon?: ReactNode;
};