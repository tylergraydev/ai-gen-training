'use client';

import { useMemo, useState } from 'react';
import { DiffusionNav } from '../components/DiffusionNav';
import { LabShell } from '../components/LabShell';
import { ScalarGrid } from '../components/TensorGrid';
import { cleanSignal, cosineWeights, gaussianNoise, mixSignal } from '../lib/diffusion';

export default function ForwardDiffusionLab() {
  const clean = useMemo(cleanSignal, []);
  const [seed, setSeed] = useState(42);
  const [time, setTime] = useState(45);
  const [selected, setSelected] = useState(44);
  const noise = useMemo(() => gaussianNoise(seed), [seed]);
  const progress = time / 100;
  const weights = cosineWeights(progress);
  const mixed = mixSignal(clean, noise, progress);

  return (
    <LabShell active="diffusion" eyebrow="MODULE 05 · FORWARD DIFFUSION" title="Training deliberately destroys the image." intro="Choose a timestep. The system scales the clean signal down, scales one Gaussian noise sample up, then adds the two tensors element by element.">
      <DiffusionNav active="forward-diffusion" />
      <section className="diffusion-control-bar panel">
        <label><span>TIMESTEP <b>t = {time}</b></span><input type="range" min="0" max="100" value={time} onChange={(event) => setTime(Number(event.target.value))} /></label>
        <div className="weight-meter"><span style={{ width: `${weights.signal * 100}%` }}>SIGNAL {weights.signal.toFixed(2)}</span><span style={{ width: `${weights.noise * 100}%` }}>NOISE {weights.noise.toFixed(2)}</span></div>
        <button onClick={() => setSeed((seed * 9301 + 49297) % 233280)}>NEW NOISE · SEED {seed}</button>
      </section>
      <section className="three-tensor-stage">
        <div className="panel tensor-card"><div className="panel-heading"><span>CLEAN x₀</span><small>FIXED SIGNAL</small></div><ScalarGrid values={clean} selected={selected} onSelect={setSelected} label="Clean image tensor" /></div>
        <div className="tensor-operator">+</div>
        <div className="panel tensor-card"><div className="panel-heading"><span>NOISE ε</span><small>SEED {seed}</small></div><ScalarGrid values={noise} selected={selected} onSelect={setSelected} label="Gaussian noise tensor" /></div>
        <div className="tensor-operator">=</div>
        <div className="panel tensor-card result"><div className="panel-heading"><span>NOISY xₜ</span><small>t = {time}</small></div><ScalarGrid values={mixed} selected={selected} onSelect={setSelected} label="Noisy training sample" /></div>
      </section>
      <section className="panel scalar-equation">
        <div><small>SELECTED CELL</small><strong>[{Math.floor(selected / 10)}, {selected % 10}]</strong></div>
        <code><b>{weights.signal.toFixed(2)}</b> × {clean[selected].toFixed(2)} <i>+</i> <b>{weights.noise.toFixed(2)}</b> × {noise[selected].toFixed(2)} <i>=</i> {mixed[selected].toFixed(2)}</code>
        <p>This one calculation happens independently at every location and channel. The model receives the resulting <b>xₜ</b>, not the clean image.</p>
      </section>
    </LabShell>
  );
}

