'use client';

import { useMemo, useState } from 'react';
import { DiffusionNav } from '../components/DiffusionNav';
import { LabShell } from '../components/LabShell';
import { ScalarGrid } from '../components/TensorGrid';
import { cleanSignal, gaussianNoise, mixSignal } from '../lib/diffusion';

const prompts = ['a smiling face', 'a ceramic robot', 'a fox in snow'];

export default function ModelInputLab() {
  const clean = useMemo(cleanSignal, []);
  const noise = useMemo(() => gaussianNoise(91), []);
  const [time, setTime] = useState(62);
  const [prompt, setPrompt] = useState(prompts[0]);
  const [focus, setFocus] = useState<'tensor' | 'time' | 'text'>('tensor');
  const mixed = mixSignal(clean, noise, time / 100);
  const tokens = ['<start>', ...prompt.split(' '), '<end>'];

  return (
    <LabShell active="diffusion" eyebrow="MODULE 06 · MODEL INPUTS" title="The network gets three kinds of context." intro="The U-Net does not receive static alone. It receives the current noisy tensor, a representation of the noise level, and—when text guided—a representation of the prompt.">
      <DiffusionNav active="model-input" />
      <section className="input-packet-grid">
        <button className={`panel input-packet ${focus === 'tensor' ? 'active' : ''}`} onClick={() => setFocus('tensor')}><small>INPUT A</small><strong>NOISY TENSOR xₜ</strong><span>shape: [1, 1, 10, 10]</span></button>
        <button className={`panel input-packet ${focus === 'time' ? 'active' : ''}`} onClick={() => setFocus('time')}><small>INPUT B</small><strong>TIMESTEP t</strong><span>one number → embedding</span></button>
        <button className={`panel input-packet ${focus === 'text' ? 'active' : ''}`} onClick={() => setFocus('text')}><small>INPUT C</small><strong>TEXT CONDITION</strong><span>tokens → embedding vectors</span></button>
        <div className="packet-arrows" aria-hidden="true"><i /><i /><i /></div>
        <div className="network-core"><span>U-NET</span><small>ONE FORWARD PASS</small></div>
      </section>
      <section className="lab-grid model-input-details">
        <div className="panel model-input-visual">
          <div className="panel-heading"><span>{focus === 'tensor' ? 'SPATIAL INPUT' : focus === 'time' ? 'TIME EMBEDDING' : 'TEXT EMBEDDINGS'}</span><small>CLICK A PACKET ABOVE</small></div>
          {focus === 'tensor' && <><ScalarGrid values={mixed} label="Noisy tensor supplied to model" /><label className="input-time-slider"><span>CHANGE NOISE LEVEL <b>t = {time}</b></span><input type="range" min="0" max="100" value={time} onChange={(event) => setTime(Number(event.target.value))} /></label></>}
          {focus === 'time' && <div className="embedding-bars">{Array.from({ length: 16 }, (_, i) => <i key={i} style={{ height: `${20 + Math.abs(Math.sin(time / (6 + i))) * 75}%` }} />)}</div>}
          {focus === 'text' && <div className="token-vectors">{tokens.map((token, index) => <div key={`${token}-${index}`}><b>{token}</b><span>{Array.from({ length: 8 }, (_, i) => <i key={i} style={{ opacity: .18 + ((index * 7 + i * 3) % 8) / 10 }} />)}</span></div>)}</div>}
        </div>
        <div className="panel model-input-controls">
          <div className="panel-heading"><span>CONDITION SETTINGS</span><small>INTERACTIVE</small></div>
          <label>PROMPT<select value={prompt} onChange={(event) => setPrompt(event.target.value)}>{prompts.map((item) => <option key={item}>{item}</option>)}</select></label>
          <div className="shape-stack"><span><b>xₜ</b> keeps spatial layout</span><span><b>t</b> tells the model how noisy it is</span><span><b>text</b> tells it what content to favor</span></div>
          <p>These inputs meet inside the network in different ways. The image travels through convolution blocks; time modifies many blocks; text is commonly injected through cross-attention.</p>
        </div>
      </section>
    </LabShell>
  );
}

