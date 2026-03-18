interface ColorSwatchProps {
  hex: string;
  name?: string;
  size?: "sm" | "md";
}

export function ColorSwatch({ hex, name, size = "md" }: ColorSwatchProps) {
  const dim = size === "sm" ? "h-4 w-4" : "h-6 w-6";

  return (
    <span
      className={`${dim} rounded-full border border-border inline-block flex-shrink-0`}
      style={{ backgroundColor: hex }}
      title={name}
      aria-label={name ? `Color: ${name}` : hex}
    />
  );
}
