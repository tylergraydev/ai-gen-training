'use client';

import { useMemo, useState } from 'react';
import { ColorGrid, ScalarGrid } from '../components/TensorGrid';
import { DiffusionNav } from '../components/DiffusionNav';
import { LabShell } from '../components/LabShell';
import { makePromptScene, type Pixel } from '../lib/diffusion';

type LatentCell = [number, number, number, number];

function encode(image: Pixel[]): LatentCell[] {
  return Array.from({ length: 25 }, (_, index) => {
    const lx = index % 5;
    const ly = Math.floor(index / 5);
    const block = [image[(ly * 2) * 10 + lx * 2], image[(ly * 2) * 10 + lx * 2 + 1], image[(ly * 2 + 1) * 10 + lx * 2], image[(ly * 2 + 1) * 10 + lx * 2 + 1]];
    const avg = (channel: number) => block.reduce((sum, pixel) => sum + pixel[channel], 0) / block.length / 127.5 - 1;
    return [avg(0), avg(1), avg(2), (avg(0) + avg(1) + avg(2)) / 3];
  });
}

function decode(latent: LatentCell[]): Pixel[] {
  return Array.from({ length: 100 }, (_, index) => {
    const x = index % 10;
    const y = Math.floor(index / 10);
    const cell = latent[Math.floor(y / 2) * 5 + Math.floor(x / 2)];
    return [0, 1, 2].map((channel) => Math.max(0, Math.min(255, Math.round((cell[channel] + 1) * 127.5 + cell[3] * 18)))) as Pixel;
  });
}

export default function LatentLab() {
  const original = useMemo(() => makePromptScene('a red sun over blue water'), []);
  const initial = useMemo(() => encode(original), [original]);
  const [latent, setLatent] = useState<LatentCell[]>(initial);
  const [channel, setChannel] = useState(0);
  const [selected, setSelected] = useState(8);
  const decoded = decode(latent);
  const channelValues = latent.map((cell) => cell[channel]);

  const updateValue = (value: number) => setLatent((current) => current.map((cell, index) => {
    if (index !== selected) return cell;
    const next = [...cell] as LatentCell;
    next[channel] = value;
    return next;
  }));

  return (
    <LabShell active="diffusion" eyebrow="MODULE 11 · LATENT DIFFUSION" title="Modern models often denoise compressed features." intro="A variational autoencoder compresses pixels into a smaller learned tensor. Diffusion operates there, then a decoder converts the final latent features back into RGB pixels.">
      <DiffusionNav active="latent" />
      <section className="latent-pipeline">
        <div className="panel latent-image"><div className="panel-heading"><span>RGB IMAGE</span><small>10 × 10 × 3</small></div><ColorGrid values={original} label="Original RGB image" /></div>
        <div className="latent-arrow"><b>ENCODER</b><span>→</span><small>compress</small></div>
        <div className="panel latent-map"><div className="panel-heading"><span>LATENT CHANNEL {channel}</span><small>5 × 5 × 4</small></div><ScalarGrid values={channelValues} selected={selected} onSelect={setSelected} label="Selected latent feature map" /></div>
        <div className="latent-arrow"><b>DECODER</b><span>→</span><small>reconstruct</small></div>
        <div className="panel latent-image result"><div className="panel-heading"><span>DECODED IMAGE</span><small>10 × 10 × 3</small></div><ColorGrid values={decoded} label="Decoded image" /></div>
      </section>
      <section className="lab-grid latent-controls">
        <div className="panel latent-editor"><div className="panel-heading"><span>EDIT ONE LATENT FEATURE</span><small>cell [{Math.floor(selected / 5)}, {selected % 5}]</small></div><div className="segmented-control">{[0, 1, 2, 3].map((item) => <button className={channel === item ? 'active' : ''} key={item} onClick={() => setChannel(item)}>CH {item}</button>)}</div><label><span>VALUE <b>{latent[selected][channel].toFixed(2)}</b></span><input type="range" min="-1" max="1" step=".01" value={latent[selected][channel]} onChange={(event) => updateValue(Number(event.target.value))} /></label><button className="reset-latent" onClick={() => setLatent(initial.map((cell) => [...cell] as LatentCell))}>RESET LATENT ↻</button></div>
        <div className="panel latent-explanation"><div className="panel-heading"><span>WHY DO THIS?</span><small>LESS COMPUTE</small></div><div className="compression-count"><span><b>300</b> pixel scalars</span><i>→</i><span><b>100</b> latent scalars</span></div><p>A latent cell is not a miniature RGB pixel. Each channel is a learned feature, and the decoder can make one latent change influence a whole region of pixels. Real latent diffusion uses larger tensors, but the compression principle is the same.</p></div>
      </section>
    </LabShell>
  );
}
