import type { DrinkId } from '../models/VendingMachine';

interface DrinkArtworkProps {
  drinkId: DrinkId;
  outOfStock?: boolean;
  className?: string;
}

export function DrinkArtwork({ drinkId, outOfStock = false, className = 'w-16 h-24' }: DrinkArtworkProps) {
  const opacityClass = outOfStock ? 'opacity-35 grayscale' : 'opacity-100';

  if (drinkId === 'aqua') {
    return (
      <svg
        viewBox="0 0 80 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${className} ${opacityClass} transition-all duration-200`}
        aria-hidden="true"
      >
        <rect x="30" y="6" width="20" height="10" rx="2.5" fill="#0284C7" />
        <path d="M27 16H53L58 32V104C58 109.523 53.523 114 48 114H32C26.477 114 22 109.523 22 104V32L27 16Z" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2.5" />
        <rect x="23" y="46" width="34" height="32" fill="#0EA5E9" />
        <path d="M23 58C29 54 35 62 40 58C45 54 51 62 57 58V78H23V58Z" fill="#0369A1" opacity="0.45" />
        <rect x="28" y="25" width="4" height="15" rx="2" fill="#FFFFFF" opacity="0.7" />
        <rect x="28" y="84" width="4" height="20" rx="2" fill="#FFFFFF" opacity="0.7" />
        <text x="40" y="66" textAnchor="middle" fill="#FFFFFF" fontSize="9.5" fontWeight="700" fontFamily="sans-serif">
          AQUA
        </text>
      </svg>
    );
  }

  if (drinkId === 'teh-botol') {
    return (
      <svg
        viewBox="0 0 80 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${className} ${opacityClass} transition-all duration-200`}
        aria-hidden="true"
      >
        <rect x="31" y="6" width="18" height="9" rx="2" fill="#B91C1C" />
        <path d="M32 15H48L51 34L57 46V105C57 109.971 52.971 114 48 114H32C27.029 114 23 109.971 23 105V46L29 34L32 15Z" fill="#78350F" stroke="#451A03" strokeWidth="2.5" />
        <rect x="24" y="54" width="32" height="34" fill="#FEF3C7" />
        <rect x="24" y="54" width="32" height="10" fill="#B91C1C" />
        <text x="40" y="75" textAnchor="middle" fill="#78350F" fontSize="8" fontWeight="700" fontFamily="sans-serif">
          TEH
        </text>
        <text x="40" y="84" textAnchor="middle" fill="#78350F" fontSize="7" fontWeight="600" fontFamily="sans-serif">
          BOTOL
        </text>
        <rect x="29" y="42" width="3.5" height="9" rx="1.5" fill="#FDE68A" opacity="0.45" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 80 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${opacityClass} transition-all duration-200`}
      aria-hidden="true"
    >
      <rect x="29" y="6" width="22" height="10" rx="2.5" fill="#1D4ED8" />
      <path d="M27 16H53L58 32V104C58 109.523 53.523 114 48 114H32C26.477 114 22 109.523 22 104V32L27 16Z" fill="#FFFFFF" stroke="#1D4ED8" strokeWidth="2.5" />
      <path d="M23 36H57V88H23V36Z" fill="#2563EB" />
      <path d="M23 64C31 58 49 70 57 62V88H23V64Z" fill="#1E40AF" />
      <text x="40" y="54" textAnchor="middle" fill="#FFFFFF" fontSize="7.5" fontWeight="700" fontFamily="sans-serif">
        POCARI
      </text>
      <text x="40" y="64" textAnchor="middle" fill="#DBEAFE" fontSize="7" fontWeight="600" fontFamily="sans-serif">
        SWEAT
      </text>
      <rect x="28" y="22" width="3.5" height="11" rx="1.5" fill="#93C5FD" opacity="0.7" />
    </svg>
  );
}
