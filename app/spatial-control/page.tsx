'use client';

import { useRef, useState, type DragEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { DiffusionNav } from '../components/DiffusionNav';
import { LabShell } from '../components/LabShell';

type Concept = 'person' | 'ocean' | 'sand' | 'sky' | 'sun';
type LayoutItem = { id: number; concept: Concept; x: number; y: number; w: number; h: number };

const conceptInfo: Record<Concept, { label: string; color: string; hint: string }> = {
  person: { label: 'PERSON', color: '#ff6d40', hint: 'subject' },
  ocean: { label: 'OCEAN', color: '#516bff', hint: 'background' },
  sand: { label: 'SAND', color: '#e2b85b', hint: 'foreground' },
  sky: { label: 'SKY', color: '#8ecdf2', hint: 'background' },
  sun: { label: 'SUN', color: '#ffd34f', hint: 'detail' },
};

const initialItems: LayoutItem[] = [
  { id: 1, concept: 'sky', x: 0, y: 0, w: 100, h: 42 },
  { id: 2, concept: 'ocean', x: 0, y: 40, w: 100, h: 27 },
  { id: 3, concept: 'sand', x: 0, y: 65, w: 100, h: 35 },
  { id: 4, concept: 'person', x: 42, y: 30, w: 17, h: 55 },
];

const defaultSize: Record<Concept, [number, number]> = {
  person: [18, 48], ocean: [70, 25], sand: [70, 28], sky: [70, 35], sun: [15, 15],
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export default function SpatialControlLab() {
  const boardRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(10);
  const dragState = useRef<{ id: number; dx: number; dy: number } | null>(null);
  const [items, setItems] = useState<LayoutItem[]>(initialItems);
  const [selected, setSelected] = useState(4);
  const [strength, setStrength] = useState(78);
  const selectedItem = items.find((item) => item.id === selected);

  const addConcept = (concept: Concept, x = 50, y = 50) => {
    const [w, h] = defaultSize[concept];
    const item = { id: nextId.current++, concept, x: clamp(x - w / 2, 0, 100 - w), y: clamp(y - h / 2, 0, 100 - h), w, h };
    setItems((current) => [...current, item]);
    setSelected(item.id);
  };

  const boardPoint = (clientX: number, clientY: number) => {
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return { x: 50, y: 50 };
    return { x: ((clientX - rect.left) / rect.width) * 100, y: ((clientY - rect.top) / rect.height) * 100 };
  };

  const startMove = (event: ReactPointerEvent<HTMLButtonElement>, item: LayoutItem) => {
    const point = boardPoint(event.clientX, event.clientY);
    dragState.current = { id: item.id, dx: point.x - item.x, dy: point.y - item.y };
    setSelected(item.id);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveItem = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const state = dragState.current;
    if (!state) return;
    const point = boardPoint(event.clientX, event.clientY);
    setItems((current) => current.map((item) => item.id === state.id ? {
      ...item,
      x: clamp(point.x - state.dx, 0, 100 - item.w),
      y: clamp(point.y - state.dy, 0, 100 - item.h),
    } : item));
  };

  const dropConcept = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const concept = event.dataTransfer.getData('concept') as Concept;
    if (!conceptInfo[concept]) return;
    const point = boardPoint(event.clientX, event.clientY);
    addConcept(concept, point.x, point.y);
  };

  const updateSelected = (key: 'w' | 'h', value: number) => setItems((current) => current.map((item) => item.id === selected ? {
    ...item,
    [key]: value,
    x: key === 'w' ? clamp(item.x, 0, 100 - value) : item.x,
    y: key === 'h' ? clamp(item.y, 0, 100 - value) : item.y,
  } : item));

  return (
    <LabShell active="diffusion" eyebrow="MODULE 12 · SPATIAL CONDITIONING" title="Give the model a blocking diagram." intro="A text prompt describes what should exist. A spatial control map adds where it should exist. Drag labeled regions onto the board to direct the composition while the model still denoises a separate latent.">
      <DiffusionNav active="spatial-control" />
      <section className="spatial-workspace">
        <div className="panel concept-palette">
          <div className="panel-heading"><span>CONCEPT PALETTE</span><small>DRAG OR TAP</small></div>
          <p>Place the broad ideas first, like blocking actors and scenery on a movie set.</p>
          <div className="concept-list">
            {(Object.keys(conceptInfo) as Concept[]).map((concept) => (
              <button key={concept} draggable onDragStart={(event) => event.dataTransfer.setData('concept', concept)} onClick={() => addConcept(concept)} style={{ '--concept': conceptInfo[concept].color } as React.CSSProperties}>
                <i /> <b>{conceptInfo[concept].label}</b><small>{conceptInfo[concept].hint}</small><span>＋</span>
              </button>
            ))}
          </div>
          <button className="reset-layout" onClick={() => { setItems(initialItems); setSelected(4); }}>RESET BEACH LAYOUT ↻</button>
        </div>
        <div className="panel layout-board-panel">
          <div className="panel-heading"><span>YOUR LAYOUT CONTROL</span><small>EXPLICIT REGIONS</small></div>
          <div ref={boardRef} className="layout-board" onDragOver={(event) => event.preventDefault()} onDrop={dropConcept} aria-label="Composition layout board">
            {items.map((item) => (
              <button key={item.id} className={selected === item.id ? 'selected' : ''} style={{ left: `${item.x}%`, top: `${item.y}%`, width: `${item.w}%`, height: `${item.h}%`, '--concept': conceptInfo[item.concept].color } as React.CSSProperties} onPointerDown={(event) => startMove(event, item)} onPointerMove={moveItem} onPointerUp={() => { dragState.current = null; }} onPointerCancel={() => { dragState.current = null; }} aria-label={`Move ${conceptInfo[item.concept].label} region`}>
                <span>{conceptInfo[item.concept].label}</span>
              </button>
            ))}
          </div>
          <div className="board-caption"><span>POSITION = WHERE</span><span>SIZE = HOW PROMINENT</span><span>OVERLAP = RELATIONSHIP</span></div>
        </div>
        <div className="panel region-editor">
          <div className="panel-heading"><span>SELECTED REGION</span><small>{selectedItem ? conceptInfo[selectedItem.concept].label : 'NONE'}</small></div>
          {selectedItem ? <>
            <label><span>WIDTH <b>{Math.round(selectedItem.w)}%</b></span><input type="range" min="8" max="100" value={selectedItem.w} onChange={(event) => updateSelected('w', Number(event.target.value))} /></label>
            <label><span>HEIGHT <b>{Math.round(selectedItem.h)}%</b></span><input type="range" min="8" max="100" value={selectedItem.h} onChange={(event) => updateSelected('h', Number(event.target.value))} /></label>
            <button className="remove-region" onClick={() => { setItems((current) => current.filter((item) => item.id !== selected)); setSelected(-1); }}>REMOVE REGION</button>
          </> : <p>Select a region on the board to resize or remove it.</p>}
        </div>
      </section>
      <section className="panel conditioning-pipeline">
        <div className="panel-heading"><span>WHAT ENTERS THE DENOISING STEP?</span><small>THREE SEPARATE SIGNALS</small></div>
        <div className="conditioning-input"><small>1 · STARTING STATE</small><div className="latent-noise-swatch">{Array.from({ length: 64 }, (_, i) => <i key={i} style={{ opacity: ((i * 47) % 91 + 9) / 100 }} />)}</div><strong>NOISY LATENT</strong><p>The changing visual state.</p></div>
        <b className="conditioning-plus">＋</b>
        <div className="conditioning-input"><small>2 · WHAT</small><div className="prompt-card">“A single person standing on a sunny beach”</div><strong>TEXT PROMPT</strong><p>The concepts and appearance.</p></div>
        <b className="conditioning-plus">＋</b>
        <div className="conditioning-input"><small>3 · WHERE</small><div className="mini-layout">{items.map((item) => <i key={item.id} style={{ left: `${item.x}%`, top: `${item.y}%`, width: `${item.w}%`, height: `${item.h}%`, background: conceptInfo[item.concept].color }} />)}</div><strong>LAYOUT CONTROL</strong><p>The composition and regions.</p></div>
        <b className="conditioning-arrow">→</b>
        <div className="unet-result"><small>REPEATED EACH STEP</small><strong>U-NET</strong><span>guided denoising</span></div>
      </section>
      <section className="lab-grid spatial-explanation">
        <div className="panel control-strength"><div className="panel-heading"><span>CONTROL STRENGTH</span><small>{strength}%</small></div><label><span>LOOSE INTERPRETATION</span><span>FOLLOW MAP CLOSELY</span><input type="range" min="0" max="100" value={strength} onChange={(event) => setStrength(Number(event.target.value))} /></label><p>Higher strength makes the model respect your regions more closely. Lower strength gives it more freedom to improve or rearrange the composition.</p></div>
        <div className="panel important-distinction"><div className="panel-heading"><span>IMPORTANT DISTINCTION</span><small>MAP ≠ LATENT</small></div><div><b>Layout map</b><span>Human-readable labels: person here, water there.</span></div><div><b>Latent</b><span>Learned numerical features being denoised.</span></div><p>The map is like stage directions beside a rough painting. It influences the painter without becoming the painting.</p></div>
      </section>
    </LabShell>
  );
}
