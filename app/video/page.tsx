'use client';

import { useEffect, useMemo, useState } from 'react';
import { LabShell } from '../components/LabShell';

type Pixel = [number, number, number];
const FRAME_COUNT = 8;
const SIZE = 8;

function makeFrame(frame: number): Pixel[] {
  return Array.from({ length: SIZE * SIZE }, (_, index) => {
    const x = index % SIZE;
    const y = Math.floor(index / SIZE);
    const ballX = frame;
    const ballY = 2 + Math.round(Math.sin(frame * 0.9) * 2);
    if (Math.hypot(x - ballX, y - ballY) < 1.55) return [255, 103, 63];
    if (y === 6) return [74, 98, 148];
    return [21 + y * 8, 29 + y * 9, 44 + y * 13];
  });
}

export default function VideoLab() {
  const frames = useMemo(() => Array.from({ length: FRAME_COUNT }, (_, frame) => makeFrame(frame)), []);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [fps, setFps] = useState(4);
  const [selectedPixel, setSelectedPixel] = useState(18);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setCurrent((frame) => (frame + 1) % FRAME_COUNT), 1000 / fps);
    return () => window.clearInterval(timer);
  }, [playing, fps]);

  const selected = frames[current][selectedPixel];

  return (
    <LabShell active="video" eyebrow="MODULE 03 · VIDEO" title="A video is a timeline of image tensors." intro="Each frame is a complete image. Add a time axis and display those images quickly in sequence, and your visual system perceives motion." >
      <section className="lab-grid video-lab">
        <div className="panel video-player-panel">
          <div className="panel-heading"><span>FRAME VIEWER</span><small>CLICK A PIXEL TO INSPECT</small></div>
          <div className="video-canvas">
            {frames[current].map((pixel, index) => <button key={index} aria-label={`Pixel x ${index % SIZE}, y ${Math.floor(index / SIZE)}`} className={selectedPixel === index ? 'selected' : ''} style={{ background: `rgb(${pixel.join(',')})` }} onClick={() => setSelectedPixel(index)} />)}
          </div>
          <div className="transport-controls">
            <button onClick={() => setCurrent((current - 1 + FRAME_COUNT) % FRAME_COUNT)} aria-label="Previous frame">←</button>
            <button className="play-button" onClick={() => setPlaying(!playing)}>{playing ? 'PAUSE Ⅱ' : 'PLAY ▶'}</button>
            <button onClick={() => setCurrent((current + 1) % FRAME_COUNT)} aria-label="Next frame">→</button>
            <span>FRAME <b>{String(current + 1).padStart(2, '0')}</b> / {String(FRAME_COUNT).padStart(2, '0')}</span>
          </div>
        </div>

        <div className="panel video-readout">
          <div className="panel-heading"><span>CURRENT ADDRESS</span><small>video[t, y, x, c]</small></div>
          <div className="video-address">video[<b>{current}</b>, <b>{Math.floor(selectedPixel / SIZE)}</b>, <b>{selectedPixel % SIZE}</b>, :]</div>
          <div className="video-selected-color" style={{ background: `rgb(${selected.join(',')})` }} />
          <div className="video-tuple">[{selected.join(', ')}]</div>
          <p>Time <b>t = {current}</b> selects one image. The remaining indices select one pixel and its three channel values inside that frame.</p>
          <label className="fps-control"><span>PLAYBACK SPEED <b>{fps} FPS</b></span><input type="range" min="1" max="12" value={fps} onChange={(event) => setFps(Number(event.target.value))} /></label>
        </div>

        <div className="panel timeline-panel">
          <div className="panel-heading"><span>FRAME TIMELINE</span><small>TIME RUNS LEFT → RIGHT</small></div>
          <div className="frame-strip">
            {frames.map((frame, frameIndex) => (
              <button key={frameIndex} onClick={() => { setCurrent(frameIndex); setPlaying(false); }} className={current === frameIndex ? 'active' : ''} aria-label={`Go to frame ${frameIndex + 1}`}>
                <span className="frame-number">{String(frameIndex + 1).padStart(2, '0')}</span>
                <span className="frame-thumbnail">{frame.map((pixel, index) => <i key={index} style={{ background: `rgb(${pixel.join(',')})` }} />)}</span>
              </button>
            ))}
          </div>
          <input className="timeline-scrubber" aria-label="Timeline position" type="range" min="0" max={FRAME_COUNT - 1} value={current} onChange={(event) => { setCurrent(Number(event.target.value)); setPlaying(false); }} />
          <div className="video-shape">
            <span><b>8</b> FRAMES</span><i>×</i><span><b>8</b> HEIGHT</span><i>×</i><span><b>8</b> WIDTH</span><i>×</i><span className="channels"><b>3</b> CHANNELS</span><strong>= 1,536 scalars</strong>
          </div>
        </div>
      </section>
    </LabShell>
  );
}
