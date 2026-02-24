export function NibIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Nib body */}
      <path
        d="M14 34 C14 34 2 22 2 13 A12 12 0 0 1 26 13 C26 22 14 34 14 34Z"
        fill="currentColor"
        opacity="0.25"
      />
      <path
        d="M14 34 C14 34 2 22 2 13 A12 12 0 0 1 26 13 C26 22 14 34 14 34Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Center tine */}
      <path
        d="M14 24 L14 34"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      {/* Vent hole */}
      <circle cx="14" cy="14" r="3.5" fill="currentColor" />
    </svg>
  );
}
