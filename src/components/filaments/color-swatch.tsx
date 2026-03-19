interface ColorSwatchProps {
  hex: string;
  name?: string;
  size?: "sm" | "md";
}

export function ColorSwatch({ hex, name, size = "md" }: ColorSwatchProps) {
  const dim = size === "sm" ? "h-4 w-4" : "h-6 w-6";

  return (
    <div
      className={`${dim} rounded-full flex-shrink-0 inline-flex`}
      style={{
        backgroundColor: hex,
        boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.15)",
      }}
      title={name}
      aria-label={name ? `Color: ${name}` : hex}
    />
  );
}
