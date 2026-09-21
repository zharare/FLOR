import { useState } from 'react';
import BouquetScene from './components/BouquetScene.jsx';

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <main className={`experience ${isPlaying ? 'is-playing' : ''}`}>
      <div className="grain" aria-hidden="true" />
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />

      <header className="intro" aria-hidden={isPlaying}>
        <p className="eyebrow">un pequeño jardín para</p>
        <h1>Valeria</h1>
      </header>

      <BouquetScene active={isPlaying} />

      {!isPlaying && (
        <section className="play-wrap" aria-label="Iniciar la experiencia floral">
          <button className="play-button" type="button" onClick={() => setIsPlaying(true)}>
            <span className="play-icon" aria-hidden="true" />
            <span className="play-label">PLAY</span>
          </button>
          <p className="play-note">toca para florecer</p>
        </section>
      )}

      {isPlaying && (
        <button className="restart" type="button" onClick={() => setIsPlaying(false)}>
          reiniciar
        </button>
      )}
    </main>
  );
}
