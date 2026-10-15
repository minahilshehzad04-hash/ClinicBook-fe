import Link from "next/link";

/** Icon only: a rounded "pin" tile (one sharp corner) with a "c" and a medical plus. */
export function LogoMark({ className = "h-10 w-10" }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="cb-grad" x1="6" y1="2" x2="42" y2="46" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#14b8a6" />
          <stop offset="1" stopColor="#134e4a" />
        </linearGradient>
      </defs>
      {/* tile: three round corners, sharp bottom-left like a map pin */}
      <path
        d="M16 2H32A14 14 0 0 1 46 16V32A14 14 0 0 1 32 46H2V16A14 14 0 0 1 16 2Z"
        fill="url(#cb-grad)"
      />
      {/* the "c" */}
      <path
        d="M30.9 18.2A9 9 0 1 0 30.9 29.8"
        stroke="#fff"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      {/* the plus */}
      <path d="M24 20.5v7M20.5 24h7" stroke="#99f6e4" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

/** Icon + lowercase rounded wordmark. */
export default function Logo({ href = "/", size = "md" }) {
  const sizes = {
    sm: { icon: "h-8 w-8", text: "text-2xl" },
    md: { icon: "h-10 w-10", text: "text-3xl" },
    lg: { icon: "h-14 w-14", text: "text-5xl" },
  }[size];

  return (
    <Link href={href} className="inline-flex items-center gap-2.5" aria-label="ClinicBook home">
      <LogoMark className={sizes.icon} />
      <span
        className={`${sizes.text} font-semibold leading-none tracking-tight text-slate-900`}
        style={{ fontFamily: "var(--font-brand), system-ui, sans-serif" }}
      >
        clinic<span className="text-teal-700">book</span>
      </span>
    </Link>
  );
}
