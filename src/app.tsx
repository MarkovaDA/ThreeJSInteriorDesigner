import { useState } from 'react';
import Scene from './scene';
import { FurniturePanel } from './controls/furniture-panel';
import { SlideOutPanel } from './controls/slide-out-panel';
import type { SceneFurnitureSelection } from './furniture/types';
import './app.css';

function App() {
  const [selectedFurnitureId, setSelectedFurnitureId] = useState<string | null>(
    null,
  );
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [furnitureRequestId, setFurnitureRequestId] = useState(0);
  const [panelOpen, setPanelOpen] = useState(true);
  const [sofaLoading, setSofaLoading] = useState(false);
  const [sceneSelection, setSceneSelection] =
    useState<SceneFurnitureSelection | null>(null);

  const handleFurnitureSelect = (selection: SceneFurnitureSelection | null) => {
    setSceneSelection(selection);

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
        onFurnitureSelect={handleFurnitureSelect}
        onSofaLoadingChange={setSofaLoading}
      />

      {sofaLoading ? (
        <div className="scene-loader" role="status" aria-live="polite">
          <span className="scene-loader__spinner" aria-hidden="true" />
          <span className="scene-loader__text">Loading sofa…</span>
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
          isModelLoading={sofaLoading}
          onSelect={(id) => {
            setSelectedFurnitureId(id);
            setSelectedChoiceId(null);
            setSceneSelection(null);
            setFurnitureRequestId((current) => current + 1);
          }}
          onChoiceSelect={setSelectedChoiceId}
        />
      </SlideOutPanel>
    </main>
  );
}

export default App;
