'use client';

import { useEffect, useMemo, useState } from 'react';
import { DiffusionNav } from '../components/DiffusionNav';
import { LabShell } from '../components/LabShell';
import { ScalarGrid } from '../components/TensorGrid';
import { cleanSignal, gaussianNoise, mixSignal } from '../lib/diffusion';

const TOTAL_STEPS = 12;

export default function SamplingLab() {
  const clean = useMemo(cleanSignal, []);
  const noise = useMemo(() => gaussianNoise(311), []);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const progress = step / TOTAL_STEPS;
  const tensor = mixSignal(clean, noise, 1 - progress);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setStep((current) => current >= TOTAL_STEPS ? 0 : current + 1), 500);
    return () => window.clearInterval(timer);
  }, [playing]);

  return (
    <LabShell active="diffusion" eyebrow="MODULE 09 · THE SAMPLING LOOP" title="One reverse step becomes a generation." intro="Generation repeats the same pattern: predict, update, lower the timestep. Structure emerges because every step moves the tensor toward regions the model considers plausible.">
      <DiffusionNav active="sampling" />
      <section className="sampling-stage">
        <div className="panel sampler-visual">
          <div className="panel-heading"><span>IDEALIZED REVERSE PROCESS</span><small>STEP {step} / {TOTAL_STEPS}</small></div>
          <ScalarGrid values={tensor} label="Current sampling tensor" />
        </div>
        <div className="panel sampler-controls">
          <div className="sampling-status"><small>CURRENT STATE</small><strong>{step === 0 ? 'PURE NOISE' : step === TOTAL_STEPS ? 'FINAL IMAGE' : 'DENOISING'}</strong><span>t = {(1 - progress).toFixed(2)}</span></div>
          <button className="large-play" onClick={() => setPlaying(!playing)}>{playing ? 'PAUSE Ⅱ' : 'PLAY ALL STEPS ▶'}</button>
          <div className="step-buttons"><button onClick={() => setStep(Math.max(0, step - 1))}>← PREVIOUS</button><button onClick={() => setStep(Math.min(TOTAL_STEPS, step + 1))}>NEXT →</button></div>
          <p>This demonstration uses an ideal noise predictor so you can isolate the loop itself. A real model’s imperfect predictions create new details instead of revealing a predetermined hidden image.</p>
        </div>
      </section>
      <section className="panel sampler-timeline">
        <div className="panel-heading"><span>DENOISING TIMELINE</span><small>CLICK ANY STEP</small></div>
        <div className="sampling-steps">{Array.from({ length: TOTAL_STEPS + 1 }, (_, index) => <button key={index} onClick={() => { setStep(index); setPlaying(false); }} className={step === index ? 'active' : index < step ? 'passed' : ''}><i /><span>{index}</span></button>)}</div>
        <input type="range" min="0" max={TOTAL_STEPS} value={step} onChange={(event) => { setStep(Number(event.target.value)); setPlaying(false); }} />
        <div className="loop-code"><span>1 · U-NET PREDICTS</span><b>→</b><span>2 · SAMPLER UPDATES</span><b>→</b><span>3 · LOWER TIMESTEP</span><b>↻</b></div>
      </section>
    </LabShell>
  );
}
