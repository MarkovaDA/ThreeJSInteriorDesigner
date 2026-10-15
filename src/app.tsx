import { useRef, useState } from 'react';
import type { ModelZoom } from './camera';
import Scene, { LustreModel } from './scene';
import { FurniturePanel } from './controls/furniture-panel';
import { SlideOutPanel } from './controls/slide-out-panel';
import type {
  FurnitureLoadingState,
  SceneFurnitureSelection,
} from './furniture/types';
import './app.css';

function App() {
  const [selectedFurnitureId, setSelectedFurnitureId] = useState<string | null>(
    null,
  );
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [furnitureRequestId, setFurnitureRequestId] = useState(0);
  const [panelOpen, setPanelOpen] = useState(true);
  const [furnitureLoading, setFurnitureLoading] =
    useState<FurnitureLoadingState | null>(null);
  const modelZoomRef = useRef<ModelZoom | null>(null);

  const handleFurnitureSelect = (selection: SceneFurnitureSelection | null) => {
    if (selection) {
      setPanelOpen(true);
      setSelectedFurnitureId(selection.id);
      setSelectedChoiceId(null);
    }
  };

  return (
    <main className="app">
      <Scene
        selectedFurnitureId={selectedFurnitureId}
        furnitureRequestId={furnitureRequestId}
        sofaModel={selectedChoiceId}
        lustreModel={LustreModel.Default}
        onFurnitureSelect={handleFurnitureSelect}
        onFurnitureLoadingChange={setFurnitureLoading}
        onModelZoomReady={(zoom) => {
          modelZoomRef.current = zoom;
        }}
      />

      {furnitureLoading ? (
        <div className="scene-loader" role="status" aria-live="polite">
          <span className="scene-loader__spinner" aria-hidden="true" />
          <span className="scene-loader__text">
            Loading {furnitureLoading.label}…
          </span>
        </div>
      ) : null}

      <SlideOutPanel
        open={panelOpen}
        onOpenChange={setPanelOpen}
        side="right"
        title="Furniture"
        aria-label="Furniture panel"
      >
        <FurniturePanel
          selectedId={selectedFurnitureId}
          selectedChoiceId={selectedChoiceId}
          loadingLabel={furnitureLoading?.label ?? null}
          onSelect={(id) => {
            setSelectedFurnitureId(id);
            setSelectedChoiceId(null);
            setFurnitureRequestId((current) => current + 1);
          }}
          onChoiceSelect={setSelectedChoiceId}
          onZoomIn={() => modelZoomRef.current?.zoomBy(0.82)}
          onZoomOut={() => modelZoomRef.current?.zoomBy(1.22)}
          onZoomReset={() => modelZoomRef.current?.reset()}
        />
      </SlideOutPanel>
    </main>
  );
}

export default App;
