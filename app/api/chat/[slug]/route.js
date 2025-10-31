import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { SYSTEM_PROMPTS } from '../../../../lib/system-prompts';

export const runtime = 'nodejs'; // server-only

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

    // Guardrails
    const last = messages[messages.length-1]?.content || '';
    if (isForbiddenExtraction(last)) {
      return NextResponse.json({ ok:false, error:'blocked', reply: 'Lo siento — no puedo ayudar con esa solicitud.' }, { status: 200 });
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      return NextResponse.json({ ok:false, error:'missing_key', detail:'Falta OPENAI_API_KEY' }, { status: 500 });
    }

    const client = new OpenAI({ apiKey: OPENAI_API_KEY });
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    // Build final messages
    const finalMessages = [
      { role: 'system', content: sys },
      ...messages.filter(m => m && (m.role === 'user' || m.role === 'assistant')).map(m => ({
        role: m.role, content: String(m.content||'').slice(0, 6000)
      }))
    ].slice(-14);

    const completion = await client.chat.completions.create({
      model,
      messages: finalMessages,
      temperature: 0.7
    });

    const reply = completion?.choices?.[0]?.message?.content || '…';
    return NextResponse.json({ ok:true, reply });
  }catch(e){
    const safe = (e && (e.message || e.toString())) || 'Server error';
    return NextResponse.json({ ok:false, error:'exception', detail: safe.slice(0,400) }, { status: 500 });
  }
}
