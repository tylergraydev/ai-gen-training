'use client';

import { useMemo, useState } from 'react';
import { ColorGrid } from '../components/TensorGrid';
import { DiffusionNav } from '../components/DiffusionNav';
import { LabShell } from '../components/LabShell';
import { blendPixel, cosineWeights, gaussianNoise, randomFactory, type Pixel } from '../lib/diffusion';

type PromptChoice = 'sunset' | 'snow' | 'alien';

const prompts: Record<PromptChoice, { label: string; text: string; freedom: string }> = {
  sunset: { label: 'Golden sunset', text: 'A person on a beach at golden sunset', freedom: 'mostly restyle' },
  snow: { label: 'Snowy lake', text: 'A person beside a snowy mountain lake', freedom: 'change the setting' },
  alien: { label: 'Alien shore', text: 'An explorer on a violet alien shoreline', freedom: 'reinterpret heavily' },
};

function sourceScene(): Pixel[] {
  return Array.from({ length: 100 }, (_, index) => {
    const x = index % 10;
    const y = Math.floor(index / 10);
    const person = x >= 4 && x <= 5 && y >= 3 && y <= 8;
    const head = Math.hypot(x - 4.5, y - 2.5) < 1.15;
    if (head) return [111, 70, 49];
    if (person) return y < 6 ? [238, 76, 62] : [37, 49, 77];
    if (y < 4) return [126 + y * 12, 192 + y * 5, 228];
    if (y < 7) return [(x + y) % 2 ? 37 : 48, 116, 180];
    return [(x + y) % 2 ? 222 : 236, 190, 109];
  });
}

function targetScene(choice: PromptChoice): Pixel[] {
  return Array.from({ length: 100 }, (_, index) => {
    const x = index % 10;
    const y = Math.floor(index / 10);
    const person = x >= 4 && x <= 5 && y >= 3 && y <= 8;
    const head = Math.hypot(x - 4.5, y - 2.5) < 1.15;
    if (choice === 'sunset') {
      const sun = Math.hypot(x - 7.5, y - 2.2) < 1.25;
      if (sun) return [255, 224, 103];
      if (head) return [112, 62, 43];
      if (person) return y < 6 ? [246, 191, 61] : [72, 42, 70];
      if (y < 4) return [246 - y * 13, 139 - y * 6, 113 + y * 15];
      if (y < 7) return [(x + y) % 2 ? 55 : 72, 74, 139];
      return [(x + y) % 2 ? 214 : 230, 140, 82];
    }
    if (choice === 'snow') {
      const mountain = y >= 2 && y < 6 && (Math.abs(x - 2) <= y - 2 || Math.abs(x - 7) <= y - 3);
      if (head) return [112, 73, 55];
      if (person) return y < 6 ? [35, 101, 157] : [35, 45, 62];
      if (mountain) return [205 - y * 5, 216 - y * 3, 228];
      if (y < 4) return [149, 195, 228];
      if (y < 7) return [(x + y) % 2 ? 66 : 86, 129, 157];
      return [(x + y) % 2 ? 225 : 241, 239, 234];
    }
    const moon = Math.hypot(x - 7.5, y - 2) < 1.5;
    if (moon) return [142, 238, 186];
    if (head) return [178, 211, 179];
    if (person) return y < 6 ? [230, 104, 48] : [38, 36, 67];
    if (y < 4) return [74 + y * 10, 42, 125 + y * 13];
    if (y < 7) return [(x + y) % 2 ? 31 : 50, 126, 128];
    return [(x + y) % 2 ? 131 : 151, 75, 166];
  });
}

function noisyImage(source: Pixel[], strength: number, seed: number): Pixel[] {
  const noise = gaussianNoise(seed, 300);
  const weights = cosineWeights(strength);
  return source.map((pixel, index) => pixel.map((channel, channelIndex) => {
    const normalized = channel / 127.5 - 1;
    const mixed = normalized * weights.signal + noise[index * 3 + channelIndex] * weights.noise;
    return Math.max(0, Math.min(255, Math.round((mixed + 1) * 127.5)));
  }) as Pixel);
}

function resultImage(source: Pixel[], target: Pixel[], strength: number, seed: number): Pixel[] {
  const random = randomFactory(seed + 99);
  const change = Math.pow(strength, 1.22);
  return source.map((pixel, index) => {
    const blended = blendPixel(pixel, target[index], change);
    const variation = (random() - 0.5) * 16 * strength;
    return blended.map((channel) => Math.max(0, Math.min(255, Math.round(channel + variation)))) as Pixel;
  });
}

export default function ImageToImageLab() {
  const source = useMemo(sourceScene, []);
  const [prompt, setPrompt] = useState<PromptChoice>('sunset');
  const [strength, setStrength] = useState(0.42);
  const [seed, setSeed] = useState(2419);
  const target = useMemo(() => targetScene(prompt), [prompt]);
  const noisy = useMemo(() => noisyImage(source, strength, seed), [source, strength, seed]);
  const result = useMemo(() => resultImage(source, target, strength, seed), [source, target, strength, seed]);
  const preserved = Math.round((1 - Math.pow(strength, 1.1)) * 100);
  const startStep = Math.round(strength * 100);
  const description = strength < 0.25 ? 'Small correction' : strength < 0.6 ? 'Guided reinterpretation' : strength < 0.85 ? 'Major redesign' : 'Nearly a new generation';

  return (
    <LabShell active="diffusion" eyebrow="MODULE 13 · IMAGE-TO-IMAGE" title="Erase just enough to redraw." intro="Image-to-image does not begin from pure noise. It encodes an existing image, adds a chosen amount of noise, and asks the sampler to rebuild it under a new prompt. Denoise strength decides how much survives.">
      <DiffusionNav active="image-to-image" />
      <section className="panel img2img-controls">
        <div className="panel-heading"><span>EDITING INSTRUCTIONS</span><small>SAME SEED · DIFFERENT STRENGTH</small></div>
        <label className="img2img-prompt"><span>NEW PROMPT</span><select value={prompt} onChange={(event) => setPrompt(event.target.value as PromptChoice)}>{(Object.keys(prompts) as PromptChoice[]).map((choice) => <option key={choice} value={choice}>{prompts[choice].text}</option>)}</select></label>
        <label className="img2img-strength"><span>DENOISE STRENGTH <b>{Math.round(strength * 100)}%</b></span><input type="range" min="0" max="1" step=".01" value={strength} onChange={(event) => setStrength(Number(event.target.value))} /></label>
        <button onClick={() => setSeed((current) => current + 137)}>NEW SEED · {seed} ↻</button>
      </section>
      <section className="img2img-pipeline">
        <div className="panel img2img-card"><div className="panel-heading"><span>1 · EXISTING IMAGE</span><small>RGB PIXELS</small></div><ColorGrid values={source} label="Original beach image" /><strong>Original composition</strong><p>The person, horizon, and foreground already have positions.</p></div>
        <div className="img2img-arrow"><b>VAE ENCODE</b><span>→</span><small>compress</small></div>
        <div className="panel img2img-card noisy"><div className="panel-heading"><span>2 · ADD NOISE</span><small>START AT t={startStep}</small></div><ColorGrid values={noisy} label="Noisy encoded starting image" /><strong>{Math.round(strength * 100)}% denoise strength</strong><p>The sampler receives a partially erased version—not a blank canvas.</p></div>
        <div className="img2img-arrow"><b>PROMPT + SAMPLE</b><span>→</span><small>rebuild</small></div>
        <div className="panel img2img-card result"><div className="panel-heading"><span>3 · EDITED RESULT</span><small>{prompts[prompt].label.toUpperCase()}</small></div><ColorGrid values={result} label="Simulated image-to-image result" /><strong>{description}</strong><p>The new prompt has {prompts[prompt].freedom} while the source anchors the layout.</p></div>
      </section>
      <section className="lab-grid img2img-readouts">
        <div className="panel preservation-panel"><div className="panel-heading"><span>THE TRADEOFF</span><small>ONE SLIDER, TWO EFFECTS</small></div><div className="tradeoff-meter"><span style={{ width: `${preserved}%` }}>SOURCE MEMORY <b>{preserved}%</b></span><span style={{ width: `${100 - preserved}%` }}>PROMPT FREEDOM <b>{100 - preserved}%</b></span></div><div className="tradeoff-labels"><span>Trace the original</span><span>Redraw from imagination</span></div><p>Strength does not literally mean “percent of pixels replaced.” It chooses how far up the noise schedule the edit begins. More noise destroys more reliable information, giving the prompt more room to redirect the result.</p></div>
        <div className="panel img2img-analogy"><div className="panel-heading"><span>PENCIL-SKETCH ANALOGY</span><small>WHY IT WORKS</small></div><div className="eraser-demo"><i style={{ opacity: 1 - strength }} /><span>{Math.round(strength * 100)}% ERASED</span></div><p>Imagine erasing part of a drawing, then handing it to another artist with new instructions. Light erasing permits recoloring. Heavy erasing permits a new setting, pose, or subject—but risks losing the composition you wanted to preserve.</p></div>
      </section>
      <section className="panel strength-guide"><div><b>0–20%</b><strong>Touch-up</strong><span>Colors, lighting, small texture changes</span></div><div><b>20–60%</b><strong>Restyle</strong><span>New mood and details; layout usually survives</span></div><div><b>60–85%</b><strong>Rebuild</strong><span>Large scene changes; identity may drift</span></div><div><b>85–100%</b><strong>Regenerate</strong><span>Source becomes only a faint suggestion</span></div></section>
    </LabShell>
  );
}
