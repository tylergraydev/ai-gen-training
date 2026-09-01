'use client';

import { useMemo, useState } from 'react';
import { ColorGrid } from '../components/TensorGrid';
import { DiffusionNav } from '../components/DiffusionNav';
import { LabShell } from '../components/LabShell';
import { blendPixel, makePromptScene, type Pixel } from '../lib/diffusion';

const prompts = ['a red sun over blue water', 'a green tree under a violet sky', 'a gold moon in a dark sky'];

export default function ConditioningLab() {
  const [prompt, setPrompt] = useState(prompts[0]);
  const [guidance, setGuidance] = useState(7.5);
  const conditioned = useMemo(() => makePromptScene(prompt), [prompt]);
  const unconditional = useMemo<Pixel[]>(() => Array.from({ length: 100 }, (_, index) => {
    const y = Math.floor(index / 10);
    return [108 + y * 4, 112 + y * 3, 119 + y * 2];
  }), []);
  const amount = Math.min(1, guidance / 7.5);
  const guided = conditioned.map((pixel, index) => blendPixel(unconditional[index], pixel, amount));

  return (
    <LabShell active="diffusion" eyebrow="MODULE 10 · TEXT CONDITIONING" title="Text steers which denoising direction wins." intro="A text encoder turns prompt tokens into vectors. Cross-attention lets image features consult those vectors, while classifier-free guidance strengthens the difference between conditional and unconditional predictions.">
      <DiffusionNav active="conditioning" />
      <section className="prompt-console panel">
        <div className="prompt-prefix">PROMPT</div>
        <select value={prompt} onChange={(event) => setPrompt(event.target.value)}>{prompts.map((item) => <option key={item}>{item}</option>)}</select>
        <div className="prompt-tokens">{prompt.split(' ').map((token, index) => <span key={`${token}-${index}`}><small>{index + 1}</small>{token}</span>)}</div>
      </section>
      <section className="conditioning-stage">
        <div className="panel tensor-card"><div className="panel-heading"><span>UNCONDITIONAL</span><small>“WHAT COULD BE HERE?”</small></div><ColorGrid values={unconditional} label="Unconditional result" /></div>
        <div className="guidance-equation"><b>+</b><span>GUIDANCE<br />× {guidance.toFixed(1)}</span></div>
        <div className="panel tensor-card"><div className="panel-heading"><span>CONDITIONAL</span><small>“MATCH THE PROMPT”</small></div><ColorGrid values={conditioned} label="Prompt-conditioned result" /></div>
        <div className="guidance-equation"><b>=</b></div>
        <div className="panel tensor-card result"><div className="panel-heading"><span>GUIDED RESULT</span><small>COMBINED DIRECTION</small></div><ColorGrid values={guided} label="Guided result" /></div>
      </section>
      <section className="lab-grid guidance-details">
        <div className="panel guidance-control"><div className="panel-heading"><span>GUIDANCE SCALE</span><small>CFG</small></div><label><span>WEAK <b>{guidance.toFixed(1)}</b> STRONG</span><input type="range" min="0" max="15" step=".5" value={guidance} onChange={(event) => setGuidance(Number(event.target.value))} /></label><p>Low guidance gives the model freedom. Higher guidance emphasizes prompt agreement. Excessive guidance can reduce variety and create harsh artifacts.</p></div>
        <div className="panel attention-map"><div className="panel-heading"><span>CROSS-ATTENTION IDEA</span><small>FEATURES ASK TEXT</small></div><div className="attention-flow"><span>IMAGE FEATURE<br /><b>round shape</b></span><i>queries</i><span>TEXT TOKENS<br /><b>“sun” “red”</b></span><i>returns</i><span>UPDATED FEATURE<br /><b>red circular sun</b></span></div></div>
      </section>
    </LabShell>
  );
}

