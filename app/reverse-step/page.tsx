'use client';

import { useMemo, useState } from 'react';
import { DiffusionNav } from '../components/DiffusionNav';
import { LabShell } from '../components/LabShell';
import { ScalarGrid } from '../components/TensorGrid';
import { cleanSignal, cosineWeights, gaussianNoise, mixSignal } from '../lib/diffusion';

export default function ReverseStepLab() {
  const clean = useMemo(cleanSignal, []);
  const noise = useMemo(() => gaussianNoise(177), []);
  const error = useMemo(() => gaussianNoise(19), []);
  const [time, setTime] = useState(78);
  const [step, setStep] = useState(12);
  const currentProgress = time / 100;
  const nextProgress = Math.max(0, (time - step) / 100);
  const currentWeights = cosineWeights(currentProgress);
  const predictedNoise = noise.map((value, index) => value + error[index] * .08);
  const current = mixSignal(clean, noise, currentProgress);
  const estimatedClean = current.map((value, index) => (value - currentWeights.noise * predictedNoise[index]) / Math.max(currentWeights.signal, .04));
  const nextWeights = cosineWeights(nextProgress);
  const next = estimatedClean.map((value, index) => nextWeights.signal * value + nextWeights.noise * predictedNoise[index]);

  return (
    <LabShell active="diffusion" eyebrow="MODULE 08 · ONE REVERSE STEP" title="A sampler turns one prediction into an update." intro="The U-Net’s output is only a prediction. A sampler combines it with the current tensor and noise schedule to calculate the tensor at a slightly earlier, cleaner timestep.">
      <DiffusionNav active="reverse-step" />
      <section className="reverse-controls panel">
        <label><span>CURRENT TIME <b>t = {time}</b></span><input type="range" min="20" max="95" value={time} onChange={(event) => setTime(Number(event.target.value))} /></label>
        <label><span>STEP BACK <b>Δt = {step}</b></span><input type="range" min="2" max="20" value={step} onChange={(event) => setStep(Number(event.target.value))} /></label>
        <div><small>NEXT TIME</small><strong>t = {Math.max(0, time - step)}</strong></div>
      </section>
      <section className="reverse-pipeline">
        <div className="panel tensor-card"><div className="panel-heading"><span>CURRENT xₜ</span><small>t = {time}</small></div><ScalarGrid values={current} label="Current noisy tensor" /></div>
        <div className="pipeline-symbol">−<small>PREDICTED<br />NOISE</small></div>
        <div className="panel tensor-card"><div className="panel-heading"><span>ESTIMATED x̂₀</span><small>MODEL'S CLEAN GUESS</small></div><ScalarGrid values={estimatedClean} label="Estimated clean image" /></div>
        <div className="pipeline-symbol">→<small>RE-SCALE FOR<br />NEXT TIME</small></div>
        <div className="panel tensor-card result"><div className="panel-heading"><span>NEXT xₜ₋₁</span><small>t = {Math.max(0, time - step)}</small></div><ScalarGrid values={next} label="Next cleaner tensor" /></div>
      </section>
      <section className="panel reverse-note"><b>Important:</b><p>“Subtract the predicted noise” is a useful intuition, but real samplers apply schedule-dependent coefficients like the ones visualized here. Some samplers also inject fresh randomness.</p><code>xₜ → model prediction → sampler math → xₜ₋₁</code></section>
    </LabShell>
  );
}

