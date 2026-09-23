import type { ReactElement } from 'react';
import type { FurnitureIconId } from '../../furniture/types';

type IconProps = {
  className?: string;
};

const svgProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true as const,
};

function ChairIcon({ className }: IconProps) {
  return (
    <svg className={className} {...svgProps}>
      <path d="M7 10h10v4H7z" />
      <path d="M8 14v5M16 14v5M9 10V7a3 3 0 0 1 6 0v3" />
    </svg>
  );
}

function TableIcon({ className }: IconProps) {
  return (
    <svg className={className} {...svgProps}>
      <path d="M4 10h16v2H4z" />
      <path d="M7 12v7M17 12v7" />
    </svg>
  );
}

function SofaIcon({ className }: IconProps) {
  return (
    <svg className={className} {...svgProps}>
      <path d="M5 14V11a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3" />
      <path d="M3 14h18v4H3z" />
      <path d="M6 18v2M18 18v2" />
    </svg>
  );
}

function BedIcon({ className }: IconProps) {
  return (
    <svg className={className} {...svgProps}>
      <path d="M3 14h18v4H3z" />
      <path d="M5 14V9a2 2 0 0 1 2-2h5v7" />
      <path d="M5 18v2M19 18v2" />
    </svg>
  );
}

function WardrobeIcon({ className }: IconProps) {
  return (
    <svg className={className} {...svgProps}>
      <rect x="5" y="3" width="14" height="18" rx="1" />
      <path d="M12 3v18M9.5 12h.01M14.5 12h.01" />
    </svg>
  );
}

function LampIcon({ className }: IconProps) {
  return (
    <svg className={className} {...svgProps}>
      <path d="M9 18h6M12 14v4" />
      <path d="M8 14h8l-1.5-8h-5L8 14z" />
    </svg>
  );
}

const icons: Record<FurnitureIconId, (props: IconProps) => ReactElement> = {
  chair: ChairIcon,
  table: TableIcon,
  sofa: SofaIcon,
  bed: BedIcon,
  wardrobe: WardrobeIcon,
  lamp: LampIcon,
};

export function FurnitureIcon({
  id,
  className,
}: {
  id: FurnitureIconId;
  className?: string;
}) {
  const Icon = icons[id];

  return <Icon className={className} />;
}
