import {
  useEffect,
  useRef,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
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

type PanelOffset = {
  x: number;
  y: number;
};

type DragBounds = {
  minDeltaX: number;
  maxDeltaX: number;
  minDeltaY: number;
  maxDeltaY: number;
};

type DragSession = {
  pointerId: number;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
  bounds: DragBounds;
};

const DRAG_MARGIN = 8;

function clamp(value: number, min: number, max: number): number {
  if (min > max) {
    return (min + max) / 2;
  }

  return Math.min(Math.max(value, min), max);
}

export function SlideOutPanel({
  open,
  onOpenChange,
  side = 'right',
  title,
  children,
  'aria-label': ariaLabel = 'Side panel',
}: SlideOutPanelProps) {
  const panelRef = useRef<HTMLElement | null>(null);
  const offsetRef = useRef<PanelOffset>({ x: 0, y: 0 });
  const dragSessionRef = useRef<DragSession | undefined>(undefined);

  const sideClass =
    side === 'left' ? 'slide-out-panel--left' : 'slide-out-panel--right';
  const openClass = open ? 'slide-out-panel--open' : 'slide-out-panel--closed';
  const arrowLabel = open ? 'Collapse panel' : 'Expand panel';

  const applyOffset = (next: PanelOffset) => {
    offsetRef.current = next;

    const panel = panelRef.current;

    if (!panel) {
      return;
    }

    panel.style.setProperty('--drag-x', `${next.x}px`);
    panel.style.setProperty('--drag-y', `${next.y}px`);
  };

  const setDraggingClass = (active: boolean) => {
    panelRef.current?.classList.toggle('slide-out-panel--dragging', active);
  };

  useEffect(() => {
    applyOffset(offsetRef.current);
  }, []);

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      const session = dragSessionRef.current;

      if (!session || event.pointerId !== session.pointerId) {
        return;
      }

      const { bounds } = session;
      const deltaX = clamp(
        event.clientX - session.startX,
        bounds.minDeltaX,
        bounds.maxDeltaX,
      );
      const deltaY = clamp(
        event.clientY - session.startY,
        bounds.minDeltaY,
        bounds.maxDeltaY,
      );

      applyOffset({
        x: session.originX + deltaX,
        y: session.originY + deltaY,
      });
    };

    const onPointerUp = (event: PointerEvent) => {
      const session = dragSessionRef.current;

      if (!session || event.pointerId !== session.pointerId) {
        return;
      }

      dragSessionRef.current = undefined;
      setDraggingClass(false);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };
  }, []);

  const onHandlePointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.button !== 0) {
      return;
    }

    const panel = panelRef.current;
    const parent = panel?.offsetParent as HTMLElement | null;

    if (!panel || !parent) {
      return;
    }

    event.preventDefault();

    const panelRect = panel.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();
    const origin = offsetRef.current;

    dragSessionRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: origin.x,
      originY: origin.y,
      bounds: {
        minDeltaX: parentRect.left + DRAG_MARGIN - panelRect.left,
        maxDeltaX: parentRect.right - DRAG_MARGIN - panelRect.right,
        minDeltaY: parentRect.top + DRAG_MARGIN - panelRect.top,
        maxDeltaY: parentRect.bottom - DRAG_MARGIN - panelRect.bottom,
      },
    };

    setDraggingClass(true);
  };

  return (
    <aside
      ref={panelRef}
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
        <header
          className="slide-out-panel__header"
          onPointerDown={onHandlePointerDown}
        >
          <h2 className="slide-out-panel__title">{title ?? 'Panel'}</h2>
          <span className="slide-out-panel__drag-hint" aria-hidden="true">
            ⋮⋮
          </span>
        </header>

        <div className="slide-out-panel__body">{children}</div>
      </div>
    </aside>
  );
}
