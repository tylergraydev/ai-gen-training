'use client';

import { useState } from 'react';
import { LabShell } from '../components/LabShell';

type Channel = 'RGB' | 'R' | 'G' | 'B';
type Pixel = [number, number, number];
const palette: Pixel[] = [
  [20, 31, 45], [35, 73, 101], [54, 123, 144], [244, 187, 76], [239, 110, 72], [245, 225, 181],
];
const makePixels = () => Array.from({ length: 36 }, (_, i) => {
  const x = i % 6;
  const y = Math.floor(i / 6);
  return [...palette[(x + Math.floor(y / 2) + (x > 3 ? 1 : 0)) % palette.length]] as Pixel;
});

export default function ImagesLab() {
  const [selected, setSelected] = useState(20);
  const [channel, setChannel] = useState<Channel>('RGB');
  const [pixels, setPixels] = useState<Pixel[]>(makePixels);
  const rgb = pixels[selected];

  const display = ([r, g, b]: Pixel) => {
    if (channel === 'R') return `rgb(${r},${r},${r})`;
    if (channel === 'G') return `rgb(${g},${g},${g})`;
    if (channel === 'B') return `rgb(${b},${b},${b})`;
    return `rgb(${r},${g},${b})`;
  };

  const updatePixel = (next: Pixel) => {
    setPixels((current) => current.map((pixel, index) => index === selected ? next : pixel));
  };

  const updateChannel = (index: number, value: number) => {
    const next = [...rgb] as Pixel;
    next[index] = value;
    updatePixel(next);
  };

  const hex = `#${rgb.map((value) => value.toString(16).padStart(2, '0')).join('')}`;

  return (
    <LabShell active="images" eyebrow="MODULE 02 · IMAGES" title="A grid of editable pixels becomes a tensor." intro="An image has two spatial axes and one channel axis. Select any pixel, change its stored RGB values, and watch one cell of the image tensor update." >
      <section className="lab-grid image-lab">
        <div className="panel pixel-inspector">
          <div className="panel-heading"><span>6 × 6 IMAGE</span><small>SELECT + EDIT A PIXEL</small></div>
          <div className="big-pixel-grid">
            {pixels.map((pixel, i) => (
              <button key={i} aria-label={`Pixel x ${i % 6}, y ${Math.floor(i / 6)}`} className={selected === i ? 'selected' : ''} style={{ background: display(pixel) }} onClick={() => setSelected(i)} />
            ))}
          </div>
          <div className="image-actions"><span>Showing: <b>{channel}</b></span><button onClick={() => setPixels(makePixels())}>RESET IMAGE ↻</button></div>
        </div>

        <div className="panel tensor-inspector pixel-editor-panel">
          <div className="panel-heading"><span>PIXEL EDITOR</span><small>image[y, x, c]</small></div>
          <div className="address-readout"><span>image[</span><b>{Math.floor(selected / 6)}</b><span>,</span><b>{selected % 6}</b><span>,</span><b>:</b><span>]</span></div>
          <label className="color-well" style={{ background: `rgb(${rgb.join(',')})` }}>
            <span>CLICK TO PICK</span>
            <input type="color" value={hex} aria-label="Selected pixel color" onChange={(event) => {
              const value = event.target.value;
              updatePixel([parseInt(value.slice(1, 3), 16), parseInt(value.slice(3, 5), 16), parseInt(value.slice(5, 7), 16)]);
            }} />
          </label>
          <div className="pixel-channel-editors">
            {(['R', 'G', 'B'] as const).map((label, index) => (
              <label key={label}><span>{label}</span><input type="range" min="0" max="255" value={rgb[index]} onChange={(event) => updateChannel(index, Number(event.target.value))} /><output>{rgb[index]}</output></label>
            ))}
          </div>
          <div className="paint-palette" aria-label="Color presets">
            {palette.map((color) => <button key={color.join('-')} aria-label={`Set pixel to rgb ${color.join(', ')}`} style={{ background: `rgb(${color.join(',')})` }} onClick={() => updatePixel([...color] as Pixel)} />)}
          </div>
          <p>Editing one slider changes exactly one scalar at this address. The other 107 values in the tensor stay untouched.</p>
        </div>

        <div className="panel channel-inspector">
          <div className="panel-heading"><span>CHANNEL VIEW</span><small>THE THIRD AXIS</small></div>
          <div className="segmented-control" role="group" aria-label="Channel view">
            {(['RGB', 'R', 'G', 'B'] as Channel[]).map((item) => <button className={channel === item ? 'active' : ''} onClick={() => setChannel(item)} key={item}>{item}</button>)}
          </div>
          <div className="tensor-shape">
            <div><strong>6</strong><span>HEIGHT<br />y positions</span></div><b>×</b>
            <div><strong>6</strong><span>WIDTH<br />x positions</span></div><b>×</b>
            <div className="accent"><strong>3</strong><span>CHANNELS<br />R, G, B</span></div>
          </div>
          <p className="total-values">TOTAL SCALARS: <b>6 × 6 × 3 = 108</b></p>
        </div>
      </section>
    </LabShell>
  );
}
