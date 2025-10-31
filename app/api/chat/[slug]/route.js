import { NextResponse } from 'next/server';
import { SYSTEM_PROMPTS } from '../../../../lib/system-prompts';

export const runtime = 'nodejs'; // server only

function isForbiddenExtraction(text=''){
  if(!text) return false;
  const t = text.toLowerCase();
  const bad = [
    'system prompt', 'instrucciones del sistema', 'muestra el prompt',
    'qué tienes cargado', 'que tienes cargado', 'exporta json del prompt',
    'exporta el prompt', 'clonar', 'replicar', 'haz otro gpt', 'haz otro agente',
    'muestrame tus reglas', 'descargar reglas', 'enseñame tus reglas'
  ];
  return bad.some(k => t.includes(k));
}

export async function POST(req, { params }){
  try{
    const { slug } = params;
    const sys = SYSTEM_PROMPTS[slug];
    if(!sys) return new Response('Not found', { status: 404 });

    const body = await req.json();
    const messages = Array.isArray(body?.messages) ? body.messages : [];

    // Guardrails: refuse prompt extraction attempts
    const last = messages[messages.length-1]?.content || '';
    if (isForbiddenExtraction(last)) {
      return NextResponse.json({ reply: 'Lo siento — no puedo ayudar con esa solicitud.' });
    }

    // Build final messages
    const finalMessages = [
      { role: 'system', content: sys },
      ...messages.filter(m => m.role === 'user' || m.role === 'assistant').map(m => ({
        role: m.role, content: String(m.content||'').slice(0, 6000)
      }))
    ].slice(-14);

    const apiKey = process.env.OPENAI_API_KEY;
    if(!apiKey) return new Response('Missing OPENAI_API_KEY', { status: 500 });

    // Call OpenAI
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: finalMessages,
        temperature: 0.7
      })
    });
    if(!resp.ok){
      const txt = await resp.text();
      return new Response(txt, { status: resp.status });
    }
    const data = await resp.json();
    const reply = data.choices?.[0]?.message?.content || '...';
    return NextResponse.json({ reply });
  }catch(e){
    return new Response('Server error', { status: 500 });
  }
}
