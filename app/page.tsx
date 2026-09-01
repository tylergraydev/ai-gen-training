import Link from 'next/link';
import { LabShell } from './components/LabShell';

const modules = [
  {
    href: '/color',
    number: '01',
    title: 'Color is a tuple',
    description: 'Mix red, green, blue, and alpha. See one perceived color emerge from separate channel values.',
    accent: 'color-card',
    visual: <div className="rgb-orbit" aria-hidden="true"><i /><i /><i /><b /></div>,
  },
  {
    href: '/images',
    number: '02',
    title: 'An image is a tensor',
    description: 'Inspect a tiny image cell by cell, then pull its three RGB channel maps apart.',
    accent: 'image-card',
    visual: <div className="pixel-mini" aria-hidden="true">{Array.from({length: 25}, (_, i) => <i key={i} style={{'--n': i} as React.CSSProperties} />)}</div>,
  },
  {
    href: '/video',
    number: '03',
    title: 'Video is a timeline',
    description: 'Play, pause, and scrub through a sequence of image tensors—one frame at a time.',
    accent: 'video-card',
    visual: <div className="film-mini" aria-hidden="true">{Array.from({length: 6}, (_, frame) => <span key={frame}>{Array.from({length: 16}, (_, i) => <i key={i} className={i === 4 + frame % 4 ? 'lit' : ''} />)}</span>)}</div>,
  },
  {
    href: '/noise',
    number: '04',
    title: 'Noise is random numbers',
    description: 'Generate a reproducible tensor of random values and blend it into a structured image.',
    accent: 'noise-card',
    visual: <div className="noise-mini" aria-hidden="true">{Array.from({length: 48}, (_, i) => <i key={i} style={{opacity: ((i * 47) % 100) / 100}} />)}</div>,
  },
];

export default function Home() {
  return (
    <LabShell
      eyebrow="AN INTERACTIVE COURSE"
      title="See the numbers behind an image."
      intro="AI image generation becomes much less mysterious when you can touch its building blocks. Start with color, assemble an image, then replace its structure with noise."
    >
      <section className="home-stage">
        <div className="path-line" aria-hidden="true"><span>START</span><i /><i /><i /><span>DIFFUSION →</span></div>
        <div className="module-grid">
          {modules.map((module) => (
            <Link href={module.href} key={module.href} className={`module-card ${module.accent}`}>
              <div className="card-top"><span>MODULE {module.number}</span><b>↗</b></div>
              <div className="card-visual">{module.visual}</div>
              <h2>{module.title}</h2>
              <p>{module.description}</p>
              <span className="enter-label">ENTER LAB <b>→</b></span>
            </Link>
          ))}
        </div>
      </section>
      <section className="course-principle">
        <span>THE RULE OF THIS LAB</span>
        <p>Every visual has a numerical view. Every number you change should produce something you can see.</p>
      </section>
    </LabShell>
  );
}
