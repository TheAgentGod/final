import Link from 'next/link';
import { modules } from '../lib/modules';

function Section({ title, children }){
  return (
    <div className="section">
      <h4>{title}</h4>
      <div className="grid">{children}</div>
    </div>
  )
}

function Card({m}){
  return (
    <article className="card">
      <h3>{m.name}</h3>
      <p>{m.desc}</p>
      <div className="actions">
        <Link className="btn primary" href={`/m/${m.slug}`}>Abrir</Link>
      </div>
    </article>
  )
}

export default function Page(){
  const groups = {
    base: ['brand-strategist','marketing-planner'],
    look: ['creative-director','visual-prompt-director','mj-director'],
    voice: ['copylab','brand-voice-designer','social-architect'],
    growth: ['smart-sales','focus-growth-coach'],
    legacy: ['customer-experience-architect','brand-reputation-doctor','creative-therapy']
  };
  const mapBySlug = Object.fromEntries(modules.map(m => [m.slug, m]));
  return (
    <main>
      <section className="hero">
        <h2>Estructura, claridad y criterio aplicados a tu marca.</h2>
        <p>Los módulos funcionan dentro de tu web. Sin abrir ChatGPT.</p>
      </section>
      <Section title="THE BASE">
        {groups.base.map(s => <Card key={s} m={mapBySlug[s]} />)}
      </Section>
      <Section title="THE LOOK">
        {groups.look.map(s => <Card key={s} m={mapBySlug[s]} />)}
      </Section>
      <Section title="THE VOICE">
        {groups.voice.map(s => <Card key={s} m={mapBySlug[s]} />)}
      </Section>
      <Section title="THE GROWTH">
        {groups.growth.map(s => <Card key={s} m={mapBySlug[s]} />)}
      </Section>
      <Section title="THE LEGACY">
        {groups.legacy.map(s => <Card key={s} m={mapBySlug[s]} />)}
      </Section>
    </main>
  )
}
