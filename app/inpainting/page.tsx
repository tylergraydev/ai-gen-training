'use client';

import { useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import { DiffusionNav } from '../components/DiffusionNav';
import { LabShell } from '../components/LabShell';
import { blendPixel, gaussianNoise, type Pixel } from '../lib/diffusion';

type EditPrompt = 'raincoat' | 'umbrella' | 'robot' | 'storm';
type PaintMode = 'paint' | 'erase';

const prompts: Record<EditPrompt, string> = {
  raincoat: 'Replace the shirt with a bright yellow raincoat',
  umbrella: 'Give the person a large red umbrella',
  robot: 'Replace the person with a friendly silver robot',
  storm: 'Replace the clear sky with dramatic storm clouds',
};

function originalScene(): Pixel[] {
  return Array.from({ length: 100 }, (_, index) => {
    const x = index % 10;
    const y = Math.floor(index / 10);
    const head = Math.hypot(x - 4.5, y - 2.5) < 1.15;
    const body = x >= 4 && x <= 5 && y >= 3 && y <= 8;
    if (head) return [111, 70, 49];
    if (body) return y < 6 ? [238, 76, 62] : [37, 49, 77];
    if (y < 4) return [126 + y * 12, 192 + y * 5, 228];
    if (y < 7) return [(x + y) % 2 ? 37 : 48, 116, 180];
    return [(x + y) % 2 ? 222 : 236, 190, 109];
  });
}

function proposedEdit(prompt: EditPrompt): Pixel[] {
  const source = originalScene();
  return source.map((pixel, index) => {
    const x = index % 10;
    const y = Math.floor(index / 10);
    const head = Math.hypot(x - 4.5, y - 2.5) < 1.15;
    const body = x >= 4 && x <= 5 && y >= 3 && y <= 8;
    if (prompt === 'raincoat' && body) return y < 7 ? [248, 202, 45] : [63, 55, 42];
    if (prompt === 'umbrella') {
      const canopy = y >= 1 && y <= 3 && Math.abs(x - 4.5) <= 3 - Math.abs(y - 2) * .7;
      if (canopy) return [(x + y) % 2 ? 207 : 235, 53, 60];
      if (body || (x === 6 && y >= 3 && y <= 7)) return body ? pixel : [85, 53, 39];
    }
    if (prompt === 'robot' && (head || body)) return (x + y) % 2 ? [185, 196, 205] : [102, 119, 133];
    if (prompt === 'storm' && y < 4) return (x * 7 + y * 3) % 5 < 2 ? [55, 65, 83] : [92, 104, 121];
    return pixel;
  });
}

function personMask() {
  return Array.from({ length: 100 }, (_, index) => {
    const x = index % 10;
    const y = Math.floor(index / 10);
    return Math.hypot(x - 4.5, y - 2.5) < 1.6 || (x >= 3 && x <= 6 && y >= 3 && y <= 8) ? 1 : 0;
  });
}

function presetMask(name: 'person' | 'sky' | 'foreground' | 'clear') {
  if (name === 'person') return personMask();
  if (name === 'clear') return Array(100).fill(0) as number[];
  return Array.from({ length: 100 }, (_, index) => {
    const y = Math.floor(index / 10);
    return name === 'sky' ? (y < 4 ? 1 : 0) : (y >= 7 ? 1 : 0);
  });
}

function featherMask(mask: number[], radius: number) {
  if (radius === 0) return mask;
  return mask.map((value, index) => {
    if (value === 1) return 1;
    const x = index % 10;
    const y = Math.floor(index / 10);
    let nearest = Infinity;
    mask.forEach((candidate, other) => {
      if (!candidate) return;
      const ox = other % 10;
      const oy = Math.floor(other / 10);
      nearest = Math.min(nearest, Math.hypot(x - ox, y - oy));
    });
    return nearest <= radius ? Math.max(0, 1 - nearest / (radius + .7)) : 0;
  });
}

export default function InpaintingLab() {
  const source = useMemo(originalScene, []);
  const painting = useRef(false);
  const [mask, setMask] = useState<number[]>(personMask);
  const [mode, setMode] = useState<PaintMode>('paint');
  const [brush, setBrush] = useState(1);
  const [feather, setFeather] = useState(1);
  const [strength, setStrength] = useState(.82);
  const [prompt, setPrompt] = useState<EditPrompt>('raincoat');
  const softMask = useMemo(() => featherMask(mask, feather), [mask, feather]);
  const edit = useMemo(() => proposedEdit(prompt), [prompt]);
  const noise = useMemo(() => gaussianNoise(8711, 300), []);
  const result = source.map((pixel, index) => blendPixel(pixel, edit[index], softMask[index] * strength));
  const noisyRegion = source.map((pixel, index) => {
    const randomPixel = pixel.map((_, channel) => Math.max(0, Math.min(255, Math.round((noise[index * 3 + channel] + 1) * 127.5)))) as Pixel;
    return blendPixel(pixel, randomPixel, softMask[index] * strength);
  });
  const coverage = Math.round(softMask.reduce((sum, value) => sum + value, 0));

  const applyBrush = (index: number) => {
    const cx = index % 10;
    const cy = Math.floor(index / 10);
    setMask((current) => current.map((value, cell) => {
      const x = cell % 10;
      const y = Math.floor(cell / 10);
      if (Math.max(Math.abs(x - cx), Math.abs(y - cy)) >= brush) return value;
      return mode === 'paint' ? 1 : 0;
    }));
  };

  const startPainting = (event: ReactPointerEvent<HTMLButtonElement>, index: number) => {
    painting.current = true;
    event.preventDefault();
    applyBrush(index);
  };

  return (
    <LabShell active="diffusion" eyebrow="MODULE 14 · INPAINTING" title="Protect most of the image. Redraw one part." intro="Inpainting combines an image, a mask, and a new prompt. The mask identifies where change is allowed; everything outside it is copied forward or strongly protected during sampling.">
      <DiffusionNav active="inpainting" />
      <section className="inpaint-workspace">
        <div className="panel inpaint-tools">
          <div className="panel-heading"><span>MASK TOOLS</span><small>WHITE = EDIT</small></div>
          <div className="segmented-control inpaint-mode"><button className={mode === 'paint' ? 'active' : ''} onClick={() => setMode('paint')}>PAINT</button><button className={mode === 'erase' ? 'active' : ''} onClick={() => setMode('erase')}>ERASE</button></div>
          <label><span>BRUSH SIZE <b>{brush}</b></span><input type="range" min="1" max="3" value={brush} onChange={(event) => setBrush(Number(event.target.value))} /></label>
          <label><span>EDGE FEATHER <b>{feather} px</b></span><input type="range" min="0" max="3" value={feather} onChange={(event) => setFeather(Number(event.target.value))} /></label>
          <div className="mask-presets"><span>QUICK MASKS</span><button onClick={() => setMask(presetMask('person'))}>PERSON</button><button onClick={() => setMask(presetMask('sky'))}>SKY</button><button onClick={() => setMask(presetMask('foreground'))}>SAND</button><button onClick={() => setMask(presetMask('clear'))}>CLEAR</button></div>
          <div className="mask-legend"><span><i className="mask-white" />EDIT</span><span><i className="mask-black" />PROTECT</span><span><i className="mask-gray" />BLEND EDGE</span></div>
        </div>
        <div className="panel mask-canvas-panel">
          <div className="panel-heading"><span>PAINT THE EDITABLE AREA</span><small>{coverage}% COVERAGE</small></div>
          <div className="mask-paint-grid" onPointerLeave={() => { painting.current = false; }}>
            {source.map((pixel, index) => <button key={index} aria-label={`Mask cell ${index}, ${mask[index] ? 'editable' : 'protected'}`} style={{ '--pixel': `rgb(${pixel.join(',')})`, '--mask': mask[index] } as CSSProperties} onPointerDown={(event) => startPainting(event, index)} onPointerEnter={() => { if (painting.current) applyBrush(index); }} onPointerUp={() => { painting.current = false; }} />)}
          </div>
          <p>Paint over the person, sky, or sand. The orange-white overlay is our teaching view of the mask; a real mask is a one-channel tensor.</p>
        </div>
        <div className="panel inpaint-instructions">
          <div className="panel-heading"><span>EDIT REQUEST</span><small>PROMPT + STRENGTH</small></div>
          <label><span>REPLACEMENT PROMPT</span><select value={prompt} onChange={(event) => setPrompt(event.target.value as EditPrompt)}>{(Object.keys(prompts) as EditPrompt[]).map((choice) => <option key={choice} value={choice}>{prompts[choice]}</option>)}</select></label>
          <label><span>DENOISE INSIDE MASK <b>{Math.round(strength * 100)}%</b></span><input type="range" min="0" max="1" step=".01" value={strength} onChange={(event) => setStrength(Number(event.target.value))} /></label>
          <div className="inpaint-rule"><b>OUTSIDE MASK</b><strong>0% noise</strong><span>Keep the original</span></div><div className="inpaint-rule editable"><b>INSIDE MASK</b><strong>{Math.round(strength * 100)}% noise</strong><span>Let the prompt redraw</span></div>
        </div>
      </section>
      <section className="inpaint-pipeline">
        <div className="panel inpaint-stage"><div className="panel-heading"><span>1 · MASKED INPUT</span><small>IMAGE + MASK</small></div><div className="inpaint-grid">{source.map((pixel, index) => <i key={index} style={{ background: `linear-gradient(rgba(255,255,255,${softMask[index] * .72}),rgba(255,255,255,${softMask[index] * .72})),rgb(${pixel.join(',')})` }} />)}</div><p>The mask marks permission to change—not what the replacement should look like.</p></div>
        <div className="img2img-arrow"><b>NOISE MASK</b><span>→</span><small>erase locally</small></div>
        <div className="panel inpaint-stage"><div className="panel-heading"><span>2 · LOCAL NOISE</span><small>PROTECTED CONTEXT SURVIVES</small></div><div className="inpaint-grid">{noisyRegion.map((pixel, index) => <i key={index} style={{ background: `rgb(${pixel.join(',')})` }} />)}</div><p>Noise is concentrated inside the mask. Nearby preserved content tells the model what must connect.</p></div>
        <div className="img2img-arrow"><b>DENOISE + BLEND</b><span>→</span><small>use prompt</small></div>
        <div className="panel inpaint-stage inpaint-result"><div className="panel-heading"><span>3 · COMPOSITE RESULT</span><small>EDITED + ORIGINAL</small></div><div className="inpaint-grid">{result.map((pixel, index) => <i key={index} style={{ background: `rgb(${pixel.join(',')})` }} />)}</div><p>Generated pixels fill the editable region while protected pixels stay anchored to the source.</p></div>
      </section>
      <section className="lab-grid inpaint-lessons">
        <div className="panel"><div className="panel-heading"><span>PAINTER'S-TAPE ANALOGY</span><small>MASKING</small></div><div className="tape-demo"><i /><b>NEW PAINT</b><span>PROTECTED WALL</span></div><p>The mask works like painter’s tape in reverse: it opens one region for new paint while covering everything you want to preserve.</p></div>
        <div className="panel"><div className="panel-heading"><span>WHY FEATHER THE EDGE?</span><small>SOFT TRANSITION</small></div><div className="feather-strip"><span>ORIGINAL</span><i style={{ '--feather': `${feather * 12 + 3}%` } as CSSProperties} /><span>GENERATED</span></div><p>A hard edge can look pasted on. Gray mask values create a transition where original and generated pixels mix, helping lighting, texture, and color meet smoothly.</p></div>
        <div className="panel context-panel"><div className="panel-heading"><span>CONTEXT STILL MATTERS</span><small>THE MODEL SEES AROUND THE HOLE</small></div><p>To create a believable sleeve, reflection, or shadow, the model needs nearby unmasked pixels. A mask that is too tight may clip the new object; one that is too broad may change details you meant to keep.</p></div>
      </section>
    </LabShell>
  );
}
