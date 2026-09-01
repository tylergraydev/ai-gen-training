'use client';

import { useState } from 'react';
import { LabShell } from '../components/LabShell';

function Slider({ label, value, color, onChange }: { label: string; value: number; color: string; onChange: (n: number) => void }) {
  return (
    <label className="channel-slider">
      <span className="channel-key" style={{ background: color }}>{label}</span>
      <input aria-label={`${label} channel`} type="range" min="0" max="255" value={value} onChange={(event) => onChange(Number(event.target.value))} style={{ '--fill': `${value / 2.55}%`, '--channel': color } as React.CSSProperties} />
      <output>{value}</output>
    </label>
  );
}

export default function ColorLab() {
  const [r, setR] = useState(235);
  const [g, setG] = useState(92);
  const [b, setB] = useState(72);
  const [a, setA] = useState(255);
  const alpha = a / 255;
  const hex = `#${[r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('').toUpperCase()}`;

  return (
    <LabShell active="color" eyebrow="MODULE 01 · COLOR" title="One color. Four stored values." intro="A pixel’s color is not stored as a name like ‘coral.’ It is assembled from channel values. Move a slider and watch one component change the whole." >
      <section className="lab-grid color-lab">
        <div className="panel control-panel">
          <div className="panel-heading"><span>CHANNEL VALUES</span><small>0—255</small></div>
          <Slider label="R" value={r} color="#ff5c4d" onChange={setR} />
          <Slider label="G" value={g} color="#23b875" onChange={setG} />
          <Slider label="B" value={b} color="#4b7cff" onChange={setB} />
          <Slider label="A" value={a} color="#22242a" onChange={setA} />
          <button className="preset-button" onClick={() => { setR(235); setG(92); setB(72); setA(255); }}>RESET CORAL</button>
        </div>

        <div className="panel swatch-panel">
          <div className="checkerboard">
            <div className="color-swatch" style={{ background: `rgba(${r}, ${g}, ${b}, ${alpha})` }} />
          </div>
          <div className="swatch-readout">
            <div><small>THE STORED TUPLE</small><strong>[{r}, {g}, {b}, {a}]</strong></div>
            <div><small>VISIBLE RGB COLOR</small><strong>{hex}</strong></div>
          </div>
        </div>

        <div className="panel explanation-panel">
          <div className="panel-heading"><span>WHAT YOU ARE CHANGING</span></div>
          <div className="axis-diagram">
            <span className="pixel-box" style={{ background: `rgb(${r},${g},${b})` }} />
            <div className="branch-lines"><i /><i /><i /></div>
            <div className="channel-pills"><span>R = {r}</span><span>G = {g}</span><span>B = {b}</span></div>
          </div>
          <p><b>RGB</b> determines the pixel’s color. <b>Alpha</b> does not add a fourth color—it controls how much of this pixel covers what sits behind it.</p>
        </div>
      </section>
    </LabShell>
  );
}

