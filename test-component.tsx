import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "destructive" | "outline";
  size?: "sm" | "md" | "lg";
}

export const Button = ({ className, variant = "primary", size = "md", ...props }: ButtonProps) => {
  // Dynamic styles based on variant
  const variantStyles = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
    destructive: "bg-red-600 text-white hover:bg-red-700",
    outline: "border-2 border-blue-600 text-blue-600 bg-transparent hover:bg-blue-50"
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg"
  };

  return (
    <button
      className={["inline-flex items-center justify-center rounded-md font-medium transition-colors", variantStyles[variant], sizeStyles[size], className].join(" ")}
      {...props}
    >
      Button Text
    </button>
  );
};
