export default function Logo({ light = false, size = 36 }: { light?: boolean; size?: number }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden>
        <defs>
          <linearGradient id={`lg${light ? 'l' : 'd'}`} x1="0" y1="0" x2="40" y2="40">
            <stop stopColor="#10B981" />
            <stop offset="1" stopColor="#047857" />
          </linearGradient>
        </defs>
        <rect width="40" height="40" rx="11" fill={`url(#lg${light ? 'l' : 'd'})`} />
        {/* sheep head silhouette made of nodes */}
        <path d="M20 31c-3 0-5-2.2-5-5v-3c0-2 1.2-3.5 2.4-4.2C16.2 17.8 16 17 16 16.4 16 14.8 17.3 14 18.5 14c.6 0 1.1.2 1.5.5.4-.3.9-.5 1.5-.5 1.2 0 2.5.8 2.5 2.4 0 .6-.2 1.4-1.4 2.4 1.2.7 2.4 2.2 2.4 4.2v3c0 2.8-2 5-5 5Z" fill="#fff" fillOpacity=".95" />
        <circle cx="12" cy="12" r="2" fill="#fff" />
        <circle cx="29" cy="11" r="2" fill="#fff" />
        <circle cx="30" cy="27" r="2" fill="#fff" />
        <path d="M13.5 13.2 17 16M27.3 12 23 16M28.4 26 24 25" stroke="#fff" strokeOpacity=".8" strokeWidth="1.3" />
        <circle cx="18.6" cy="23" r="1" fill="#047857" />
        <circle cx="21.4" cy="23" r="1" fill="#047857" />
      </svg>
      <span className={`text-[21px] font-extrabold tracking-tight ${light ? 'text-white' : 'text-charcoal'}`}>
        Herd<span className="text-green-brand">Pulse</span>
        <span className={`ml-1.5 text-[13px] font-bold tracking-wide ${light ? 'text-green-brand' : 'text-green-deep'}`}>AI</span>
      </span>
    </span>
  )
}
