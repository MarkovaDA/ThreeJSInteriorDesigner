import type { ReactNode } from 'react';
import './slide-out-panel.css';

export type SlideOutSide = 'left' | 'right';

export type SlideOutPanelProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: SlideOutSide;
  title?: string;
  children: ReactNode;
  'aria-label'?: string;
};

export function SlideOutPanel({
  open,
  onOpenChange,
  side = 'right',
  title,
  children,
  'aria-label': ariaLabel = 'Side panel',
}: SlideOutPanelProps) {
  const sideClass =
    side === 'left' ? 'slide-out-panel--left' : 'slide-out-panel--right';
  const openClass = open ? 'slide-out-panel--open' : 'slide-out-panel--closed';
  const arrowLabel = open ? 'Collapse panel' : 'Expand panel';

  return (
    <aside
      className={`slide-out-panel ${sideClass} ${openClass}`}
      aria-label={ariaLabel}
      data-open={open}
    >
      <button
        type="button"
        className="slide-out-panel__arrow"
        aria-expanded={open}
        aria-label={arrowLabel}
        title={arrowLabel}
        onClick={() => onOpenChange(!open)}
      >
        <span className="slide-out-panel__arrow-shine" aria-hidden="true" />
        <svg
          className="slide-out-panel__chevron"
          viewBox="0 0 24 24"
          width="18"
          height="18"
          aria-hidden="true"
        >
          <path
            d="M9.5 5.5 15 12l-5.5 6.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div className="slide-out-panel__surface">
        {title ? (
          <header className="slide-out-panel__header">
            <h2 className="slide-out-panel__title">{title}</h2>
          </header>
        ) : null}

        <div className="slide-out-panel__body">{children}</div>
      </div>
    </aside>
  );
}
