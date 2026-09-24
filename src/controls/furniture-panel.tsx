import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { furnitureItems } from '../furniture/catalog';
import { FurnitureIcon } from './icons/FurnitureIcons';
import './furniture-panel.css';

type PanelPosition = {
  x: number;
  y: number;
};

function clampPosition(
  x: number,
  y: number,
  panelWidth: number,
  panelHeight: number,
): PanelPosition {
  const maxX = Math.max(window.innerWidth - panelWidth, 0);
  const maxY = Math.max(window.innerHeight - panelHeight, 0);

  return {
    x: Math.min(Math.max(x, 0), maxX),
    y: Math.min(Math.max(y, 0), maxY),
  };
}

export function FurniturePanel() {
  const panelRef = useRef<HTMLElement>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [position, setPosition] = useState<PanelPosition | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!position || !panelRef.current) {
      return;
    }

    const panel = panelRef.current;

    const onResize = () => {
      setPosition((current) => {
        if (!current) {
          return current;
        }

        return clampPosition(
          current.x,
          current.y,
          panel.offsetWidth,
          panel.offsetHeight,
        );
      });
    };

    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, [position]);

  const onDragStart = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.button !== 0 || !panelRef.current) {
      return;
    }

    const target = event.target as HTMLElement;

    if (target.closest('button')) {
      return;
    }

    const panel = panelRef.current;
    const rect = panel.getBoundingClientRect();

    dragOffsetRef.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };

    isDraggingRef.current = true;
    setPosition({ x: rect.left, y: rect.top });
    setIsDragging(true);

    panel.setPointerCapture(event.pointerId);
  };

  const onDragMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (!isDraggingRef.current || !panelRef.current) {
      return;
    }

    const panel = panelRef.current;
    const next = clampPosition(
      event.clientX - dragOffsetRef.current.x,
      event.clientY - dragOffsetRef.current.y,
      panel.offsetWidth,
      panel.offsetHeight,
    );

    setPosition(next);
  };

  const onDragEnd = (event: ReactPointerEvent<HTMLElement>) => {
    if (!isDraggingRef.current || !panelRef.current) {
      return;
    }

    isDraggingRef.current = false;
    setIsDragging(false);

    if (panelRef.current.hasPointerCapture(event.pointerId)) {
      panelRef.current.releasePointerCapture(event.pointerId);
    }
  };

  const panelStyle = position
    ? { left: position.x, top: position.y, right: 'auto' }
    : undefined;

  return (
    <aside
      ref={panelRef}
      className={
        isDragging
          ? 'furniture-panel furniture-panel--dragging'
          : 'furniture-panel'
      }
      style={panelStyle}
      aria-label="Furniture catalog"
      onPointerDown={onDragStart}
      onPointerMove={onDragMove}
      onPointerUp={onDragEnd}
      onPointerCancel={onDragEnd}
    >
      <header className="furniture-panel__header">
        <h2 className="furniture-panel__title">Furniture</h2>
      </header>

      <ul className="furniture-panel__grid">
        {furnitureItems.map((item) => {
          const isSelected = selectedId === item.id;

          return (
            <li key={item.id}>
              <button
                type="button"
                className={
                  isSelected
                    ? 'furniture-panel__item furniture-panel__item--selected'
                    : 'furniture-panel__item'
                }
                aria-pressed={isSelected}
                onClick={() => setSelectedId(item.id)}
              >
                <span className="furniture-panel__glow" aria-hidden="true" />

                <FurnitureIcon id={item.icon} className="furniture-panel__icon" />

                <span className="furniture-panel__label">{item.name}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
