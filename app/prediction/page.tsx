'use client';

import { useMemo, useState } from 'react';
import { DiffusionNav } from '../components/DiffusionNav';
import { LabShell } from '../components/LabShell';
import { ScalarGrid } from '../components/TensorGrid';
import { cleanSignal, gaussianNoise, mixSignal } from '../lib/diffusion';

export default function PredictionLab() {
  const clean = useMemo(cleanSignal, []);
  const noise = useMemo(() => gaussianNoise(133), []);
  const error = useMemo(() => gaussianNoise(207), []);
  const [skill, setSkill] = useState(72);
  const mixed = mixSignal(clean, noise, .68);
  const predicted = noise.map((value, index) => value + error[index] * (1 - skill / 100) * .8);
  const difference = predicted.map((value, index) => Math.abs(value - noise[index]) * 2 - 1);
  const mse = predicted.reduce((sum, value, index) => sum + (value - noise[index]) ** 2, 0) / predicted.length;

  return (
    <LabShell active="diffusion" eyebrow="MODULE 07 · NOISE PREDICTION" title="The model predicts the noise it sees." intro="During common diffusion training, we already know the exact noise that was added. The U-Net makes a guess, and training adjusts its weights to reduce the difference.">
      <DiffusionNav active="prediction" />
      <section className="prediction-row">
        <div className="panel tensor-card"><div className="panel-heading"><span>MODEL INPUT xₜ</span><small>NOISY</small></div><ScalarGrid values={mixed} label="Noisy model input" /></div>
        <div className="prediction-arrow">U-NET<br />→</div>
        <div className="panel tensor-card result"><div className="panel-heading"><span>PREDICTED ε̂</span><small>THE GUESS</small></div><ScalarGrid values={predicted} label="Predicted noise" /></div>
      </section>
      <section className="lab-grid prediction-details">
        <div className="panel truth-panel"><div className="panel-heading"><span>KNOWN TARGET ε</span><small>WHAT WE ADDED</small></div><ScalarGrid values={noise} label="True noise target" /></div>
        <div className="panel error-panel"><div className="panel-heading"><span>ABSOLUTE ERROR</span><small>BRIGHT = MORE WRONG</small></div><ScalarGrid values={difference} label="Prediction error" /></div>
        <div className="panel training-panel">
          <div className="panel-heading"><span>SIMULATE TRAINING</span><small>MSE LOSS</small></div>
          <label><span>MODEL SKILL <b>{skill}%</b></span><input type="range" min="0" max="100" value={skill} onChange={(event) => setSkill(Number(event.target.value))} /></label>
          <div className="loss-number"><small>MEAN SQUARED ERROR</small><strong>{mse.toFixed(4)}</strong></div>
          <p>Training calculates this loss, sends gradients backward, and slightly changes millions of model weights. Repeated examples make the predicted noise resemble the known target.</p>
        </div>
      </section>
    </LabShell>
  );
}
