import Scene from './scene';
import { FurniturePanel } from './controls/furniture-panel';
import './app.css';

function App() {
  return (
    <main className="app">
      <Scene />
      <FurniturePanel />
    </main>
  );
}

export default App;
