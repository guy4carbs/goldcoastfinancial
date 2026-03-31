interface LionLogoProps {
  size?: number;
  className?: string;
  color?: string;
}

export default function LionLogo({ size = 32, className = "", color = "#B8963C" }: LionLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Mane — outer radiating arcs */}
      <path
        d="M32 4C28 4 22 8 20 12C16 10 10 12 8 16C6 20 8 26 10 28C6 30 4 36 6 40C8 44 12 46 16 46C16 50 20 54 24 56C28 58 32 56 32 56C32 56 36 58 40 56C44 54 48 50 48 46C52 46 56 44 58 40C60 36 58 30 54 28C56 26 58 20 56 16C54 12 48 10 44 12C42 8 36 4 32 4Z"
        fill={color}
        opacity={0.15}
      />
      {/* Mane — inner structure */}
      <path
        d="M32 8C29 8 24 11 22 14C19 12.5 14 14 12 17C10 20 11.5 25 13 27C10 29 8 33 9.5 37C11 40.5 14.5 42 17.5 42C17.5 45.5 20.5 49 24 50.5C27 52 30 50.5 32 50.5C34 50.5 37 52 40 50.5C43.5 49 46.5 45.5 46.5 42C49.5 42 53 40.5 54.5 37C56 33 54 29 51 27C52.5 25 54 20 52 17C50 14 45 12.5 42 14C40 11 35 8 32 8Z"
        fill={color}
        opacity={0.3}
      />
      {/* Face shape */}
      <path
        d="M32 14C26 14 20 19 20 27C20 35 25 42 32 46C39 42 44 35 44 27C44 19 38 14 32 14Z"
        fill={color}
        opacity={0.2}
      />
      {/* Eyes */}
      <ellipse cx="26" cy="26" rx="2.5" ry="2" fill={color} />
      <ellipse cx="38" cy="26" rx="2.5" ry="2" fill={color} />
      {/* Inner eye highlights */}
      <ellipse cx="26.8" cy="25.5" rx="1" ry="0.8" fill={color} opacity={0.5} />
      <ellipse cx="38.8" cy="25.5" rx="1" ry="0.8" fill={color} opacity={0.5} />
      {/* Nose */}
      <path
        d="M30 31L32 34L34 31C34 31 33 29.5 32 29.5C31 29.5 30 31 30 31Z"
        fill={color}
      />
      {/* Mouth / jaw line */}
      <path
        d="M28 34.5C28 34.5 30 37 32 37C34 37 36 34.5 36 34.5"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Brow ridges */}
      <path
        d="M22 23C22 23 24 20 27 21"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M42 23C42 23 40 20 37 21"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Ears */}
      <path
        d="M19 18L22 14L24 20"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={color}
        opacity={0.4}
      />
      <path
        d="M45 18L42 14L40 20"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={color}
        opacity={0.4}
      />
      {/* Crown / forehead accent */}
      <path
        d="M28 18L32 15L36 18"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Chin whisker accents */}
      <path
        d="M26 36L24 40"
        stroke={color}
        strokeWidth="0.8"
        strokeLinecap="round"
        opacity={0.5}
      />
      <path
        d="M38 36L40 40"
        stroke={color}
        strokeWidth="0.8"
        strokeLinecap="round"
        opacity={0.5}
      />
      <path
        d="M32 38L32 43"
        stroke={color}
        strokeWidth="0.8"
        strokeLinecap="round"
        opacity={0.5}
      />
    </svg>
  );
}
