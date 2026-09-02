import Link from 'next/link';

const steps = [
  { href: '/forward-diffusion', number: '05', label: 'Forward' },
  { href: '/model-input', number: '06', label: 'Inputs' },
  { href: '/prediction', number: '07', label: 'Prediction' },
  { href: '/reverse-step', number: '08', label: 'Reverse step' },
  { href: '/sampling', number: '09', label: 'Sampling' },
  { href: '/conditioning', number: '10', label: 'Text' },
  { href: '/latent', number: '11', label: 'Latents' },
  { href: '/spatial-control', number: '12', label: 'Layout' },
];

export function DiffusionNav({ active }: { active: string }) {
  return (
    <nav className="diffusion-nav" aria-label="Diffusion lesson sequence">
      {steps.map((step) => <Link href={step.href} key={step.href} className={active === step.href.slice(1) ? 'active' : ''}><small>{step.number}</small><span>{step.label}</span></Link>)}
    </nav>
  );
}
