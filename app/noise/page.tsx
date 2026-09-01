'use client';

import { useMemo, useState } from 'react';
import { LabShell } from '../components/LabShell';

function randomFactory(seed: number) {
  let value = seed || 1;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function gaussian(random: () => number) {
  const u = Math.max(random(), 0.000001);
  const v = random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export default function NoiseLab() {
  const [seed, setSeed] = useState(42);
  const [amount, setAmount] = useState(100);
  const [colored, setColored] = useState(false);
  const values = useMemo(() => {
    const random = randomFactory(seed);
    return Array.from({ length: 144 }, () => colored ? [gaussian(random), gaussian(random), gaussian(random)] : [gaussian(random)]);
  }, [seed, colored]);

  const basePixel = (i: number) => {
    const x = i % 12;
    const y = Math.floor(i / 12);
    const distance = Math.hypot(x - 5.5, y - 5.5);
    const face = distance < 4.8;
    const eye = (x === 4 || x === 7) && (y === 4 || y === 5);
    const smile = y === 8 && x >= 4 && x <= 7;
    return eye || smile ? 35 : face ? 235 : 92;
  };

  const pixelColor = (sample: number[], i: number) => {
    const mix = amount / 100;
    const base = basePixel(i);
    const toByte = (n: number) => Math.max(0, Math.min(255, Math.round(base * (1 - mix) + (128 + n * 48) * mix)));
    const channels = sample.length === 3 ? sample.map(toByte) : [toByte(sample[0]), toByte(sample[0]), toByte(sample[0])];
    return `rgb(${channels.join(',')})`;
  };

  return (
    <LabShell active="noise" eyebrow="MODULE 04 · NOISE" title="Static is an array of random values." intro="The computer does not create ‘static’ as a visual effect. It fills a tensor with sampled numbers. We only see static after interpreting those numbers as pixel channels." >
      <section className="lab-grid noise-lab">
        <div className="panel noise-stage">
          <div className="panel-heading"><span>12 × 12 TENSOR</span><small>144 SAMPLES</small></div>
          <div className="noise-grid">
            {values.map((sample, i) => <i key={`${seed}-${i}`} style={{ background: pixelColor(sample, i) }} />)}
          </div>
          <div className="signal-labels"><span>STRUCTURE</span><span>RANDOMNESS</span></div>
        </div>

        <div className="panel noise-controls">
          <div className="panel-heading"><span>GENERATOR CONTROLS</span><small>TRY IT</small></div>
          <label className="amount-control"><span>NOISE AMOUNT <b>{amount}%</b></span><input type="range" min="0" max="100" value={amount} onChange={(e) => setAmount(Number(e.target.value))} style={{ '--fill': `${amount}%` } as React.CSSProperties} /></label>
          <div className="seed-box"><span>SEED</span><strong>{seed}</strong><button onClick={() => setSeed((seed * 9301 + 49297) % 233280)}>NEW NOISE ↻</button></div>
          <div className="mode-row"><span>CHANNEL MODE</span><div className="segmented-control"><button className={!colored ? 'active' : ''} onClick={() => setColored(false)}>GRAY</button><button className={colored ? 'active' : ''} onClick={() => setColored(true)}>RGB</button></div></div>
        </div>

        <div className="panel distribution-panel">
          <div className="panel-heading"><span>GAUSSIAN SAMPLES</span><small>BELL CURVE</small></div>
          <div className="bell-curve" aria-hidden="true"><span className="curve-line" /><i style={{left: '18%'}} /><i style={{left: '31%'}} /><i style={{left: '43%'}} /><i style={{left: '48%'}} /><i style={{left: '54%'}} /><i style={{left: '64%'}} /><i style={{left: '81%'}} /></div>
          <div className="curve-axis"><span>−3</span><span>−2</span><span>−1</span><b>0</b><span>1</span><span>2</span><span>3</span></div>
          <p>Most sampled values land near <b>zero</b>. Large positive or negative values are possible, but less common. The seed makes this exact set reproducible.</p>
          <code>noise[y, x, c] = random Gaussian number</code>
        </div>
      </section>
    </LabShell>
  );
}
