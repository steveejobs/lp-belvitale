interface ArrowIconProps {
  readonly direction: "left" | "right";
}

export function ArrowIcon({ direction }: ArrowIconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20">
      <path
        d={direction === "left" ? "M15 5 8 12l7 7" : "m9 5 7 7-7 7"}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}
