import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'nodejs';

export async function GET(){
  const key = !!process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const result = { hasKey: key, model };

  if(!key) return NextResponse.json({ ...result, status:'missing_key' }, { status: 500 });

  try{
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    // minimal ping; no charge if cached, negligible tokens otherwise
    const r = await client.chat.completions.create({
      model,
      messages: [{ role:'system', content:'pong' }, { role:'user', content:'ping?' }],
      max_tokens: 5
    });
    return NextResponse.json({ ...result, status:'ok', echo: r.choices?.[0]?.message?.content || 'ok' });
  }catch(err){
    return NextResponse.json({ ...result, status:'error', detail: String(err).slice(0,400) }, { status: 500 });
  }
}
