'use client';

import type { Pixel } from '../lib/diffusion';
import { scalarToByte } from '../lib/diffusion';

export function ScalarGrid({ values, selected, onSelect, label }: { values: number[]; selected?: number; onSelect?: (index: number) => void; label: string }) {
  return (
    <div className="learning-grid scalar-grid" aria-label={label}>
      {values.map((value, index) => {
        const byte = scalarToByte(value);
        return <button key={index} type="button" aria-label={`Cell ${index}: ${value.toFixed(2)}`} className={selected === index ? 'selected' : ''} style={{ background: `rgb(${byte},${byte},${byte})` }} onClick={() => onSelect?.(index)} />;
      })}
    </div>
  );
}

export function ColorGrid({ values, selected, onSelect, label, columns = 10 }: { values: Pixel[]; selected?: number; onSelect?: (index: number) => void; label: string; columns?: number }) {
  return (
    <div className="learning-grid color-learning-grid" aria-label={label} style={{ '--grid-columns': columns } as React.CSSProperties}>
      {values.map((pixel, index) => <button key={index} type="button" aria-label={`Pixel ${index}: ${pixel.join(', ')}`} className={selected === index ? 'selected' : ''} style={{ background: `rgb(${pixel.join(',')})` }} onClick={() => onSelect?.(index)} />)}
    </div>
  );
}

