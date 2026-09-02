'use client';

import { useMemo, useState } from 'react';
import { DiffusionNav } from '../components/DiffusionNav';
import { LabShell } from '../components/LabShell';
import { type Pixel } from '../lib/diffusion';

type ControlType = 'edge' | 'depth' | 'pose' | 'segments';
type StylePrompt = 'astronaut' | 'watercolor' | 'night';

const controls: Record<ControlType, { label: string; keeps: string; analogy: string }> = {
  edge: { label: 'EDGE', keeps: 'outlines and boundaries', analogy: 'tracing paper' },
  depth: { label: 'DEPTH', keeps: 'near-versus-far structure', analogy: 'a stage-depth plan' },
  pose: { label: 'POSE', keeps: 'the body’s joint arrangement', analogy: 'a stick-figure choreographer' },
  segments: { label: 'SEGMENTS', keeps: 'which category owns each region', analogy: 'a color-coded zoning map' },
};

const prompts: Record<StylePrompt, string> = {
  astronaut: 'An astronaut standing on an alien beach',
  watercolor: 'A loose watercolor painting of a traveler by the sea',
  night: 'A person on a moonlit beach at night',
};

function semanticLabels() {
  return Array.from({ length: 100 }, (_, index) => {
    const x = index % 10;
    const y = Math.floor(index / 10);
    if (Math.hypot(x - 4.5, y - 2.4) < 1.1 || (x >= 4 && x <= 5 && y >= 3 && y <= 8)) return 3;
    if (y < 4) return 0;
    if (y < 7) return 1;
    return 2;
  });
}

function referenceScene(): Pixel[] {
  const labels = semanticLabels();
  return labels.map((label, index) => {
    const x = index % 10;
    const y = Math.floor(index / 10);
    if (label === 3) return y < 3 ? [111, 70, 49] : y < 6 ? [238, 76, 62] : [37, 49, 77];
    if (label === 0) return [126 + y * 12, 192 + y * 5, 228];
    if (label === 1) return [(x + y) % 2 ? 37 : 48, 116, 180];
    return [(x + y) % 2 ? 222 : 236, 190, 109];
  });
}

function controlMap(type: ControlType): Pixel[] {
  const labels = semanticLabels();
  const segmentColors: Pixel[] = [[113, 199, 239], [49, 106, 193], [232, 191, 94], [255, 98, 73]];
  const poseCells = new Set([24, 34, 43, 44, 45, 46, 54, 64, 73, 76, 83, 86]);
  return labels.map((label, index) => {
    const x = index % 10;
    const y = Math.floor(index / 10);
    if (type === 'segments') return segmentColors[label];
    if (type === 'pose') return poseCells.has(index) ? ([255, 242, 108] as Pixel) : ([18, 20, 27] as Pixel);
    if (type === 'depth') {
      const values = [40, 90, 175, 235];
      const value = values[label];
      return [value, value, value];
    }
    const neighbors = [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]];
    const boundary = neighbors.some(([nx, ny]) => nx < 0 || nx > 9 || ny < 0 || ny > 9 || labels[ny * 10 + nx] !== label);
    return boundary ? [244, 244, 238] : [18, 20, 27];
  });
}

function generatedScene(prompt: StylePrompt, personX: number, horizon: number): Pixel[] {
  return Array.from({ length: 100 }, (_, index) => {
    const x = index % 10;
    const y = Math.floor(index / 10);
    const head = Math.hypot(x - personX, y - 2.5) < 1.15;
    const body = Math.abs(x - personX) < 1.25 && y >= 3 && y <= 8;
    if (prompt === 'astronaut') {
      if (head) return [205, 221, 224];
      if (body) return (x + y) % 2 ? [225, 232, 226] : [125, 151, 150];
      if (y < horizon) return [75 + y * 8, 41, 125];
      if (y < horizon + 3) return [(x + y) % 2 ? 35 : 48, 135, 130];
      return [(x + y) % 2 ? 139 : 161, 76, 163];
    }
    if (prompt === 'watercolor') {
      if (head) return [154, 100, 72];
      if (body) return [205, 87 + ((x + y) % 2) * 25, 86];
      if (y < horizon) return [170 + (x % 2) * 10, 209, 225];
      if (y < horizon + 3) return [77, 139 + (x % 3) * 10, 174];
      return [224, 190 + (x % 2) * 12, 116];
    }
    const moon = Math.hypot(x - 7.5, y - 1.7) < 1.2;
    if (moon) return [246, 225, 151];
    if (head) return [113, 81, 68];
    if (body) return [42, 49, 72];
    if (y < horizon) return [18 + y * 3, 28 + y * 3, 66 + y * 8];
    if (y < horizon + 3) return [(x + y) % 2 ? 22 : 35, 64, 105];
    return [92, 87, 91];
  });
}

function PixelMap({ values, label }: { values: Pixel[]; label: string }) {
  return <div className="controlnet-pixel-grid" aria-label={label}>{values.map((pixel, index) => <i key={index} style={{ background: `rgb(${pixel.join(',')})` }} />)}</div>;
}

export default function ControlNetLab() {
  const reference = useMemo(referenceScene, []);
  const [type, setType] = useState<ControlType>('edge');
  const [prompt, setPrompt] = useState<StylePrompt>('astronaut');
  const [strength, setStrength] = useState(.78);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(.8);
  const map = useMemo(() => controlMap(type), [type]);
  const promptPosition = prompt === 'astronaut' ? 7 : prompt === 'watercolor' ? 2 : 6;
  const promptHorizon = prompt === 'astronaut' ? 5 : prompt === 'watercolor' ? 3 : 6;
  const windowWeight = Math.max(0, end - start);
  const typeWeight = type === 'pose' ? .94 : type === 'segments' ? .88 : type === 'edge' ? .82 : .72;
  const influence = Math.min(1, strength * windowWeight * typeWeight * 1.35);
  const controlledX = promptPosition * (1 - influence) + 4.5 * influence;
  const controlledHorizon = Math.round(promptHorizon * (1 - influence) + 4 * influence);
  const uncontrolled = generatedScene(prompt, promptPosition, promptHorizon);
  const controlled = generatedScene(prompt, controlledX, controlledHorizon);

  return (
    <LabShell active="diffusion" eyebrow="MODULE 15 · CONTROLNET" title="Describe the picture. Constrain its structure." intro="A prompt says what the image should contain. ControlNet reads an additional structural map and repeatedly nudges the denoiser to respect it. Different maps preserve different kinds of information.">
      <DiffusionNav active="controlnet" />
      <section className="panel controlnet-selector">
        <div className="panel-heading"><span>CHOOSE WHAT MUST SURVIVE</span><small>ONE REFERENCE · FOUR REPRESENTATIONS</small></div>
        <div className="control-type-tabs">{(Object.keys(controls) as ControlType[]).map((item) => <button key={item} className={type === item ? 'active' : ''} onClick={() => setType(item)}><b>{controls[item].label}</b><span>{controls[item].keeps}</span></button>)}</div>
        <label><span>NEW IMAGE PROMPT</span><select value={prompt} onChange={(event) => setPrompt(event.target.value as StylePrompt)}>{(Object.keys(prompts) as StylePrompt[]).map((item) => <option key={item} value={item}>{prompts[item]}</option>)}</select></label>
      </section>
      <section className="controlnet-input-stage">
        <div className="panel controlnet-card"><div className="panel-heading"><span>1 · REFERENCE IMAGE</span><small>HUMAN-FRIENDLY</small></div><PixelMap values={reference} label="Reference beach image" /><p>The source contains color, texture, objects, and structure all mixed together.</p></div>
        <div className="controlnet-transform"><b>{type.toUpperCase()} PREPROCESSOR</b><span>→</span><small>extract only the requested structure</small></div>
        <div className="panel controlnet-card map-card"><div className="panel-heading"><span>2 · CONTROL MAP</span><small>{controls[type].label}</small></div><PixelMap values={map} label={`${controls[type].label} control map`} /><p>This map behaves like {controls[type].analogy}. It communicates {controls[type].keeps}.</p></div>
      </section>
      <section className="panel controlnet-settings">
        <div className="panel-heading"><span>HOW STRONGLY AND FOR HOW LONG?</span><small>CONTROL SCHEDULE</small></div>
        <label><span>CONTROL STRENGTH <b>{Math.round(strength * 100)}%</b></span><input type="range" min="0" max="1" step=".01" value={strength} onChange={(event) => setStrength(Number(event.target.value))} /></label>
        <label><span>START APPLYING <b>{Math.round(start * 100)}%</b></span><input type="range" min="0" max=".9" step=".05" value={start} onChange={(event) => setStart(Math.min(Number(event.target.value), end - .05))} /></label>
        <label><span>STOP APPLYING <b>{Math.round(end * 100)}%</b></span><input type="range" min=".1" max="1" step=".05" value={end} onChange={(event) => setEnd(Math.max(Number(event.target.value), start + .05))} /></label>
        <div className="control-timeline"><i style={{ left: `${start * 100}%`, width: `${(end - start) * 100}%` }} /><span>EARLY: COMPOSITION</span><span>LATE: TEXTURE</span></div>
      </section>
      <section className="controlnet-comparison">
        <div className="panel controlnet-output"><div className="panel-heading"><span>PROMPT ONLY</span><small>MODEL CHOOSES STRUCTURE</small></div><PixelMap values={uncontrolled} label="Prompt-only generated result" /><strong>Same words, loose composition</strong><p>The prompt requests an astronaut, but it does not precisely specify the subject’s location or the horizon.</p></div>
        <div className="comparison-vs"><span>VS</span><b>+ CONTROL MAP</b></div>
        <div className="panel controlnet-output controlled"><div className="panel-heading"><span>PROMPT + CONTROLNET</span><small>{Math.round(influence * 100)}% EFFECTIVE INFLUENCE</small></div><PixelMap values={controlled} label="ControlNet-guided generated result" /><strong>New appearance, inherited structure</strong><p>The prompt supplies the astronaut and style while the {controls[type].label.toLowerCase()} map pulls the result toward the reference.</p></div>
      </section>
      <section className="panel controlnet-network">
        <div className="panel-heading"><span>WHAT HAPPENS DURING EACH DENOISING STEP?</span><small>A SIDE NETWORK ADDS GUIDANCE</small></div>
        <div className="network-lane main"><small>NOISY LATENT + PROMPT + t</small><b>MAIN DENOISER</b><i>→</i><strong>NOISE PREDICTION</strong></div>
        <div className="network-lane control"><small>{controls[type].label} MAP</small><b>CONTROLNET</b><span>learned structural features</span><i>↑ ↑ ↑</i></div>
        <p>Think of the main denoiser as the artist and ControlNet as transparent tracing paper placed over several stages of the drawing. It does not draw the final pixels itself; it supplies extra feature signals that steer the artist’s intermediate work.</p>
      </section>
      <section className="control-kinds"><div><b>EDGE</b><span>Keep silhouettes and lines; appearance can change.</span></div><div><b>DEPTH</b><span>Keep 3D arrangement while allowing different objects.</span></div><div><b>POSE</b><span>Keep body joints without copying clothing or identity.</span></div><div><b>SEGMENTS</b><span>Keep semantic regions such as sky, person, and ground.</span></div></section>
    </LabShell>
  );
}
