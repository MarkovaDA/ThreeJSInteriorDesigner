import { useEffect, useState } from 'react';
import { furnitureItems } from '../furniture/catalog';
import type { FurnitureModelChoice } from '../furniture/types';
import { loadCategoryModels } from '../utils/load-category-models';
import { FurnitureIcon } from './icons/FurnitureIcons';
import type { FurniturePanelProps } from './types';
import './furniture-panel.css';

export function FurniturePanel({
  selectedId = null,
  selectedChoiceId = null,
  isModelLoading = false,
  onSelect,
  onChoiceSelect,
}: FurniturePanelProps) {
  const selectedItem =
    furnitureItems.find((item) => item.id === selectedId) ?? null;
  const isExpanded = selectedItem !== null;
  const variantsDir = selectedItem?.variantsDir ?? null;

  const [choices, setChoices] = useState<FurnitureModelChoice[]>([]);
  const [choicesLoading, setChoicesLoading] = useState(false);
  const [choicesError, setChoicesError] = useState<string | null>(null);

  useEffect(() => {
    if (!variantsDir) {
      setChoices([]);
      setChoicesLoading(false);
      setChoicesError(null);

      return;
    }

    let cancelled = false;

    setChoices([]);
    setChoicesLoading(true);
    setChoicesError(null);

    void loadCategoryModels(variantsDir)
      .then((models) => {
        if (cancelled) {
          return;
        }

        setChoices(models);
        setChoicesLoading(false);
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }

        const message =
          error instanceof Error ? error.message : 'Failed to load models';

        setChoices([]);
        setChoicesLoading(false);
        setChoicesError(message);
      });

    return () => {
      cancelled = true;
    };
  }, [variantsDir]);

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
          {selectedItem && variantsDir ? (
            <section
              className="furniture-panel__choices"
              aria-label={`${selectedItem.name} options`}
            >
              <p className="furniture-panel__choices-title">
                Choose {selectedItem.name.toLowerCase()}
              </p>

              {choicesLoading ? (
                <p className="furniture-panel__choices-status">Loading models…</p>
              ) : null}

              {isModelLoading ? (
                <p className="furniture-panel__choices-status">Loading sofa…</p>
              ) : null}

              {choicesError ? (
                <p className="furniture-panel__choices-status furniture-panel__choices-status--error">
                  {choicesError}
                </p>
              ) : null}

              {!choicesLoading && !choicesError && choices.length === 0 ? (
                <p className="furniture-panel__choices-status">
                  No models in this folder
                </p>
              ) : null}

              {choices.length > 0 ? (
                <ul className="furniture-panel__choices-list">
                  {choices.map((choice) => {
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
                          aria-busy={isModelLoading && isActive}
                          onClick={() => onChoiceSelect?.(choice.id)}
                        >
                          {choice.label}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export type { FurniturePanelProps } from './types';
