import { useState } from 'react';
import { furnitureItems } from '../furniture/catalog';
import { FurnitureIcon } from './icons/FurnitureIcons';
import './furniture-panel.css';

export function FurniturePanel() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <aside className="furniture-panel" aria-label="Furniture catalog">
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
