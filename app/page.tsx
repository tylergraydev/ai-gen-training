import Link from 'next/link';
import { LabShell } from './components/LabShell';

const foundationModules = [
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

const diffusionModules = [
  { href: '/forward-diffusion', number: '05', title: 'Forward diffusion', description: 'Mix clean signal with Gaussian noise using a controlled timestep.' },
  { href: '/model-input', number: '06', title: 'Model inputs', description: 'See how the noisy tensor, timestep, and prompt enter the network.' },
  { href: '/prediction', number: '07', title: 'Noise prediction', description: 'Compare the U-Net’s guess to the known training target and loss.' },
  { href: '/reverse-step', number: '08', title: 'One reverse step', description: 'Turn a model prediction into one slightly cleaner tensor.' },
  { href: '/sampling', number: '09', title: 'Sampling loop', description: 'Repeat prediction and update steps until an image emerges.' },
  { href: '/conditioning', number: '10', title: 'Text conditioning', description: 'Watch prompts and guidance steer the denoising direction.' },
  { href: '/latent', number: '11', title: 'Latent diffusion', description: 'Compress pixels, edit learned features, and decode them again.' },
  { href: '/spatial-control', number: '12', title: 'Spatial conditioning', description: 'Drag labeled regions onto a board and guide where concepts appear.' },
];

export default function Home() {
  return (
    <LabShell
      eyebrow="AN INTERACTIVE COURSE"
      title="See the numbers behind an image."
      intro="AI image generation becomes much less mysterious when you can touch its building blocks. Learn the data first, then follow a diffusion model from training corruption to a generated image."
    >
      <section className="home-stage">
        <div className="track-heading"><span>TRACK 01</span><h2>Data foundations</h2><p>What the tensors represent before a neural network touches them.</p></div>
        <div className="path-line" aria-hidden="true"><span>START</span><i /><i /><i /><span>DIFFUSION →</span></div>
        <div className="module-grid">
          {foundationModules.map((module) => (
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
      <section className="diffusion-home-stage">
        <div className="track-heading"><span>TRACK 02</span><h2>The diffusion process</h2><p>Move through training, prediction, sampling, guidance, and latent space.</p></div>
        <div className="diffusion-module-grid">
          {diffusionModules.map((module) => <Link href={module.href} key={module.href} className="diffusion-module-card"><span>{module.number}</span><div><h3>{module.title}</h3><p>{module.description}</p></div><b>→</b></Link>)}
        </div>
      </section>
      <section className="course-principle">
        <span>THE RULE OF THIS LAB</span>
        <p>Every visual has a numerical view. Every number you change should produce something you can see.</p>
      </section>
    </LabShell>
  );
}
