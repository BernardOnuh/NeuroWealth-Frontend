import { HTMLAttributes } from "react";

// Spec: 1px border (#1F2937), shadow 0 1px 2px rgb(0 0 0/0.2), radius 12px (rounded-xl)
type CardVariant = "default" | "elevated" | "outlined";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
  variant?: CardVariant;
}

const cardVariants: Record<CardVariant, string> = {
  default:  "border border-gray-800 bg-gray-900",
  elevated: "border border-gray-700 bg-gray-900 shadow-md",
  outlined: "border-2 border-gray-700 bg-transparent",
};

export function Card({
  glow = false,
  variant = "default",
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`rounded-xl shadow-card p-6 ${cardVariants[variant]} ${
        glow ? "shadow-sky-500/10 border-sky-500/30 shadow-lg" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
