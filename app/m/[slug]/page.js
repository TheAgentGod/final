'use client'
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';

export default function ModuleChat({ params }){
  const { slug } = params;
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hola, soy tu módulo. Cuéntame en una frase qué necesitas y te guío.' }
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);

  const title = useMemo(() => {
    const map = {
      "brand-strategist": "Brand Strategist",
      "marketing-planner": "Marketing Planner",
      "creative-director": "Creative Director",
      "visual-prompt-director": "Visual Prompt Director",
      "mj-director": "MJ Director",
      "copylab": "CopyLab",
      "brand-voice-designer": "Brand Voice Designer",
      "social-architect": "Social Architect",
      "smart-sales": "Smart Sales",
      "focus-growth-coach": "Focus & Growth Coach",
      "customer-experience-architect": "Customer Experience Architect",
      "brand-reputation-doctor": "Brand Reputation Doctor",
      "creative-therapy": "Creative Therapy"
    };
    return map[slug] || slug;
  }, [slug]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages]);

  async function send(){
    if(!input.trim()) return;
    const next = [...messages, { role: 'user', content: input.trim() }];
    setMessages(next);
    setInput('');
    setBusy(true);
    try{
      const res = await fetch(`/api/chat/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next.slice(-12) })
      });
      if(!res.ok){
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setMessages([...next, { role: 'assistant', content: data.reply }]);
    }catch(err){
      setMessages([...next, { role: 'assistant', content: 'Hubo un problema procesando tu pedido. Inténtalo de nuevo en un momento.' }]);
    }finally{
      setBusy(false);
    }
  }

  return (
    <main>
      <Link href="/" className="pill">← Volver</Link>
      <div className="hero" style={{marginTop:12}}>
        <h2>{title}</h2>
        <p>Conversación privada. El modelo corre vía API; tu prompt interno no se expone.</p>
      </div>
      <div className="chat">
        {messages.map((m,i) => (
          <div key={i} className={`msg ${m.role}`}>{m.content}</div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="inputRow">
        <textarea value={input} onChange={e=>setInput(e.target.value)} placeholder="Escribe aquí…" disabled={busy} />
        <button onClick={send} disabled={busy}>{busy ? 'Enviando…' : 'Enviar'}</button>
      </div>
    </main>
  )
}
