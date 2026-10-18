import { useRef, useState } from 'react';
import type { ModelZoom } from '@/camera';
import { FurniturePanel } from '@/controls/furniture-panel';
import { SlideOutPanel } from '@/controls/slide-out-panel';
import type {
  FurnitureLoadingState,
  SceneFurnitureSelection,
} from '@/furniture/types';
import Scene from '@/scene';
import './app.css';

function App() {
  const [selectedFurnitureId, setSelectedFurnitureId] = useState<
    string | undefined
  >(undefined);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | undefined>(
    undefined,
  );
  const [furnitureRequestId, setFurnitureRequestId] = useState(0);
  const [panelOpen, setPanelOpen] = useState(true);
  const [furnitureLoading, setFurnitureLoading] = useState<
    FurnitureLoadingState | undefined
  >(undefined);
  const modelZoomRef = useRef<ModelZoom | undefined>(undefined);

  const handleFurnitureSelect = (selection?: SceneFurnitureSelection) => {
    if (selection) {
      setPanelOpen(true);
      setSelectedFurnitureId(selection.id);
      setSelectedChoiceId(undefined);
    }
  };

  return (
    <main className="app">
      <Scene
        selectedFurnitureId={selectedFurnitureId}
        furnitureRequestId={furnitureRequestId}
        sofaModel={selectedChoiceId}
        lustreModel="red_cuisine.glb"
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
          loadingLabel={furnitureLoading?.label}
          onSelect={(id) => {
            setSelectedFurnitureId(id);
            setSelectedChoiceId(undefined);
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
