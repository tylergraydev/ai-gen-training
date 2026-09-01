import Link from 'next/link';
import type { ReactNode } from 'react';

const lessons = [
  { href: '/color', number: '01', label: 'Color' },
  { href: '/images', number: '02', label: 'Images' },
  { href: '/video', number: '03', label: 'Video' },
  { href: '/noise', number: '04', label: 'Noise' },
];

export function LabShell({
  active,
  eyebrow,
  title,
  intro,
  children,
}: {
  active?: string;
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <div className="site-shell">
      <header className="topbar">
        <Link href="/" className="brand" aria-label="AI Image Lab home">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
          <span>AI IMAGE LAB</span>
        </Link>
        <nav className="lesson-nav" aria-label="Lessons">
          {lessons.map((lesson) => (
            <Link
              key={lesson.href}
              href={lesson.href}
              className={active === lesson.label.toLowerCase() ? 'active' : ''}
            >
              <small>{lesson.number}</small>{lesson.label}
            </Link>
          ))}
        </nav>
        <span className="course-tag">FROM PIXELS TO DIFFUSION</span>
      </header>

      <main>
        <section className="lesson-hero">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h1>{title}</h1>
          </div>
          <p className="lesson-intro">{intro}</p>
        </section>
        {children}
      </main>
    </div>
  );
}
