export function Button({ children, className = "", variant, ...props }) {
  const base = "px-4 py-2 rounded transition";
  const variants = {
    outline: "border border-gray-300 bg-transparent text-gray-800",
    default: "bg-blue-600 text-white hover:bg-blue-700",
  };
  const vclass = variant === "outline" ? variants.outline : variants.default;
  return (
    <button className={`${base} ${vclass} ${className}`} {...props}>
      {children}
    </button>
  );
}