import { furnitureItems } from '../furniture/catalog';
import { FurnitureIcon } from './icons/FurnitureIcons';
import type { FurniturePanelProps } from './types';
import './furniture-panel.css';

const choiceOptions = [
  { id: 'classic', label: 'Classic' },
  { id: 'modern', label: 'Modern' },
  { id: 'compact', label: 'Compact' },
] as const;

export function FurniturePanel({
  selectedId = null,
  selectedChoiceId = null,
  onSelect,
  onChoiceSelect,
}: FurniturePanelProps) {
  const selectedItem =
    furnitureItems.find((item) => item.id === selectedId) ?? null;
  const isExpanded = selectedItem !== null;

  return (
    <div
      className={
        isExpanded
          ? 'furniture-panel furniture-panel--expanded'
          : 'furniture-panel'
      }
    >
      <ul className="furniture-panel__grid" aria-label="Furniture catalog">
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
                aria-expanded={isSelected}
                onClick={() => onSelect?.(item.id)}
              >
                <span className="furniture-panel__glow" aria-hidden="true" />

                <FurnitureIcon
                  id={item.icon}
                  className="furniture-panel__icon"
                />

                <span className="furniture-panel__label">{item.name}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <div
        className={
          isExpanded
            ? 'furniture-panel__drawer furniture-panel__drawer--open'
            : 'furniture-panel__drawer'
        }
        aria-hidden={!isExpanded}
      >
        <div className="furniture-panel__drawer-inner">
          {selectedItem ? (
            <section
              className="furniture-panel__choices"
              aria-label={`${selectedItem.name} options`}
            >
              <p className="furniture-panel__choices-title">
                Choose {selectedItem.name.toLowerCase()}
              </p>

              <ul className="furniture-panel__choices-list">
                {choiceOptions.map((choice) => {
                  const isActive = selectedChoiceId === choice.id;

                  return (
                    <li key={choice.id}>
                      <button
                        type="button"
                        className={
                          isActive
                            ? 'furniture-panel__choice furniture-panel__choice--selected'
                            : 'furniture-panel__choice'
                        }
                        aria-pressed={isActive}
                        onClick={() => onChoiceSelect?.(choice.id)}
                      >
                        {choice.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export type { FurniturePanelProps } from './types';
