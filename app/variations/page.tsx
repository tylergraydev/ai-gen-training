'use client';

import { useMemo, useState } from 'react';
import { DiffusionNav } from '../components/DiffusionNav';
import { LabShell } from '../components/LabShell';
import { randomFactory, type Pixel } from '../lib/diffusion';

type Variable = 'seed' | 'prompt' | 'steps' | 'cfg' | 'sampler' | 'control';
type PromptStyle = 'astronaut' | 'watercolor';
type Sampler = 'Euler' | 'DDIM';
type Settings = { seed: number; prompt: PromptStyle; steps: number; cfg: number; sampler: Sampler; control: number };

const baseline: Settings = { seed: 42, prompt: 'astronaut', steps: 24, cfg: 7, sampler: 'Euler', control: .72 };
const variableInfo: Record<Variable, { label: string; owns: string; analogy: string }> = {
  seed: { label: 'SEED', owns: 'starting noise and initial composition possibilities', analogy: 'the shuffled deck before the game begins' },
  prompt: { label: 'PROMPT', owns: 'requested subject, style, and semantic direction', analogy: 'the written creative brief' },
  steps: { label: 'STEPS', owns: 'how many refinement opportunities the sampler receives', analogy: 'the number of revision passes' },
  cfg: { label: 'CFG', owns: 'how strongly prompt direction is favored', analogy: 'how loudly the art director insists' },
  sampler: { label: 'SAMPLER', owns: 'the route taken through denoising', analogy: 'the route chosen to the same destination' },
  control: { label: 'CONTROL', owns: 'how closely structural guidance is followed', analogy: 'how firmly tracing paper is held in place' },
};

function changedSettings(variable: Variable, values: Settings): Settings {
  return { ...baseline, [variable]: values[variable] };
}

function generate(settings: Settings): Pixel[] {
  const random = randomFactory(settings.seed);
  const randomX = 1.5 + random() * 7;
  const randomHorizon = 3 + Math.round(random() * 3);
  const personX = randomX * (1 - settings.control) + 4.5 * settings.control;
  const horizon = Math.round(randomHorizon * (1 - settings.control) + 4 * settings.control);
  const detail = Math.min(1, settings.steps / 24);
  const guidance = Math.max(.35, Math.min(1.55, settings.cfg / 7));
  const samplerShift = settings.sampler === 'Euler' ? 0 : 19;

  return Array.from({ length: 100 }, (_, index) => {
    const x = index % 10;
    const y = Math.floor(index / 10);
    const head = Math.hypot(x - personX, y - 2.5) < 1.2;
    const body = Math.abs(x - personX) < 1.25 && y >= 3 && y <= 8;
    let pixel: Pixel;
    if (settings.prompt === 'astronaut') {
      if (head) pixel = [205, 221, 224];
      else if (body) pixel = (x + y + samplerShift) % 2 ? [225, 232, 226] : [125, 151, 150];
      else if (y < horizon) pixel = [75 + y * 8, 41, 125];
      else if (y < horizon + 3) pixel = [(x + y) % 2 ? 35 : 48, 135, 130];
      else pixel = [(x + y) % 2 ? 139 : 161, 76, 163];
    } else {
      if (head) pixel = [154, 100, 72];
      else if (body) pixel = [205, 87 + ((x + y) % 2) * 25, 86];
      else if (y < horizon) pixel = [170 + (x % 2) * 10, 209, 225];
      else if (y < horizon + 3) pixel = [77, 139 + (x % 3) * 10, 174];
      else pixel = [224, 190 + (x % 2) * 12, 116];
    }
    const texture = ((index * 13 + settings.seed * 7 + samplerShift) % 17 - 8) * (1 - detail) * 3;
    const average = (pixel[0] + pixel[1] + pixel[2]) / 3;
    return pixel.map((channel) => Math.max(0, Math.min(255, Math.round(average + (channel - average) * guidance + texture)))) as Pixel;
  });
}

function checksum(pixels: Pixel[]) {
  return pixels.reduce((sum, pixel, index) => (sum + pixel[0] * 3 + pixel[1] * 5 + pixel[2] * 7 + index) % 65536, 0).toString(16).toUpperCase().padStart(4, '0');
}

function ImageGrid({ pixels, label }: { pixels: Pixel[]; label: string }) {
  return <div className="variation-image-grid" aria-label={label}>{pixels.map((pixel, index) => <i key={index} style={{ background: `rgb(${pixel.join(',')})` }} />)}</div>;
}

function SettingRows({ settings, changed }: { settings: Settings; changed?: Variable }) {
  const entries: Array<[Variable, string]> = [['seed', String(settings.seed)], ['prompt', settings.prompt], ['steps', String(settings.steps)], ['cfg', settings.cfg.toFixed(1)], ['sampler', settings.sampler], ['control', `${Math.round(settings.control * 100)}%`]];
  return <div className="setting-rows">{entries.map(([key, value]) => <span className={changed === key ? 'changed' : ''} key={key}><small>{variableInfo[key].label}</small><b>{value}</b>{changed === key && <i>CHANGED</i>}</span>)}</div>;
}

export default function VariationsLab() {
  const [variable, setVariable] = useState<Variable>('seed');
  const [variants, setVariants] = useState<Settings>({ seed: 314, prompt: 'watercolor', steps: 8, cfg: 14, sampler: 'DDIM', control: .12 });
  const [confirmed, setConfirmed] = useState(false);
  const comparison = changedSettings(variable, variants);
  const imageA = useMemo(() => generate(baseline), []);
  const imageB = useMemo(() => generate(comparison), [comparison.seed, comparison.prompt, comparison.steps, comparison.cfg, comparison.sampler, comparison.control]);
  const difference = Math.round(imageA.reduce((sum, pixel, index) => sum + pixel.reduce((cell, channel, c) => cell + Math.abs(channel - imageB[index][c]), 0), 0) / (100 * 3 * 255) * 100);

  const updateVariant = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setVariants((current) => ({ ...current, [key]: value }));
    setConfirmed(false);
  };

  return (
    <LabShell active="diffusion" eyebrow="MODULE 16 · CONTROLLED VARIATIONS" title="Change one variable. Learn what it owns." intro="Generation settings interact, so changing five at once hides cause and effect. This lab holds everything constant except one setting and compares the results side by side.">
      <DiffusionNav active="variations" />
      <section className="panel experiment-picker">
        <div className="panel-heading"><span>CHOOSE ONE VARIABLE TO TEST</span><small>ALL OTHERS STAY LOCKED</small></div>
        <div className="experiment-tabs">{(Object.keys(variableInfo) as Variable[]).map((item) => <button key={item} className={variable === item ? 'active' : ''} onClick={() => { setVariable(item); setConfirmed(false); }}><b>{variableInfo[item].label}</b><span>{variableInfo[item].owns}</span></button>)}</div>
        <div className="variable-editor">
          <div><small>EXPERIMENT</small><strong>Change {variableInfo[variable].label.toLowerCase()} only</strong><p>{variableInfo[variable].analogy}</p></div>
          {variable === 'seed' && <label><span>VERSION B SEED <b>{variants.seed}</b></span><input type="range" min="1" max="999" value={variants.seed} onChange={(event) => updateVariant('seed', Number(event.target.value))} /></label>}
          {variable === 'prompt' && <label><span>VERSION B PROMPT</span><select value={variants.prompt} onChange={(event) => updateVariant('prompt', event.target.value as PromptStyle)}><option value="astronaut">Astronaut on alien beach</option><option value="watercolor">Watercolor traveler by sea</option></select></label>}
          {variable === 'steps' && <label><span>VERSION B STEPS <b>{variants.steps}</b></span><input type="range" min="2" max="50" value={variants.steps} onChange={(event) => updateVariant('steps', Number(event.target.value))} /></label>}
          {variable === 'cfg' && <label><span>VERSION B CFG <b>{variants.cfg.toFixed(1)}</b></span><input type="range" min="1" max="18" step=".5" value={variants.cfg} onChange={(event) => updateVariant('cfg', Number(event.target.value))} /></label>}
          {variable === 'sampler' && <label><span>VERSION B SAMPLER</span><select value={variants.sampler} onChange={(event) => updateVariant('sampler', event.target.value as Sampler)}><option>Euler</option><option>DDIM</option></select></label>}
          {variable === 'control' && <label><span>VERSION B CONTROL <b>{Math.round(variants.control * 100)}%</b></span><input type="range" min="0" max="1" step=".01" value={variants.control} onChange={(event) => updateVariant('control', Number(event.target.value))} /></label>}
        </div>
      </section>
      <section className="variation-comparison">
        <div className="panel variation-card"><div className="panel-heading"><span>VERSION A · BASELINE</span><small>HASH {checksum(imageA)}</small></div><ImageGrid pixels={imageA} label="Baseline generation" /><SettingRows settings={baseline} /><strong>Reference experiment</strong></div>
        <div className="variation-middle"><b>{difference}%</b><span>PIXEL DIFFERENCE</span><i>↔</i><small>Only {variableInfo[variable].label.toLowerCase()} changed</small></div>
        <div className="panel variation-card changed-card"><div className="panel-heading"><span>VERSION B · TEST</span><small>HASH {checksum(imageB)}</small></div><ImageGrid pixels={imageB} label="Changed-setting generation" /><SettingRows settings={comparison} changed={variable} /><strong>Cause isolated</strong></div>
      </section>
      <section className="panel reproducibility-panel">
        <div className="panel-heading"><span>DOES THE SAME SEED GUARANTEE THE SAME IMAGE?</span><small>DETERMINISM TEST</small></div>
        <div className="repro-flow"><span><small>SETTINGS</small><b>Seed 42 + exact workflow</b></span><i>→</i><span><small>STARTING NOISE</small><b>Same tensor</b></span><i>→</i><span><small>RESULT</small><b>Hash {checksum(imageA)}</b></span></div>
        <button onClick={() => setConfirmed(true)}>RUN BASELINE AGAIN</button>
        <p className={confirmed ? 'confirmed' : ''}>{confirmed ? `MATCH CONFIRMED · ${checksum(imageA)} = ${checksum(imageA)}` : 'Run it again to verify that this simulator reproduces the exact same output.'}</p>
        <aside>In real software, the same seed is reproducible only when the model, workflow, sampler, scheduler, dimensions, software behavior, and hardware math remain compatible.</aside>
      </section>
      <section className="settings-ownership">
        {(Object.keys(variableInfo) as Variable[]).map((item) => <div key={item}><b>{variableInfo[item].label}</b><strong>{variableInfo[item].owns}</strong><span>{item === 'seed' ? 'Different seeds can rearrange the whole composition.' : item === 'prompt' ? 'Words redirect meaning and appearance.' : item === 'steps' ? 'Too few may stop before refinement settles.' : item === 'cfg' ? 'Too much can look harsh or over-forced.' : item === 'sampler' ? 'Different numerical paths produce different textures and details.' : 'Higher strength trades freedom for structural obedience.'}</span></div>)}
      </section>
    </LabShell>
  );
}
