import { useState } from 'react';
import Scene from './scene';
import { FurniturePanel } from './controls/furniture-panel';
import './app.css';

function App() {
  const [selectedFurnitureId, setSelectedFurnitureId] = useState<string | null>(
    null,
  );
  const [furnitureRequestId, setFurnitureRequestId] = useState(0);

  return (
    <main className="app">
      <Scene
        selectedFurnitureId={selectedFurnitureId}
        furnitureRequestId={furnitureRequestId}
      />
      
      <FurniturePanel
        selectedId={selectedFurnitureId}
        onSelect={(id) => {
          setSelectedFurnitureId(id);
          setFurnitureRequestId((current) => current + 1);
        }}
      />
    </main>
  );
}

export default App;
