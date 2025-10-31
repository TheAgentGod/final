# The Creativity Engine — Self‑Hosted (Next.js + OpenAI API)

✔ Vive en tu propio dominio.  
✔ Los 12 módulos funcionan vía API (no abre ChatGPT).  
✔ Los prompts están **del lado servidor** (no se exponen).  
✔ Guardrails: rehúsa extracción de prompts y clonación.

## 1) Setup
- Clona o sube esta carpeta a un **repo privado** (GitHub).
- En Vercel → New Project → Import.
- Variables de entorno en **Settings → Environment Variables**:
  - `OPENAI_API_KEY` = tu API key de OpenAI
  - (opcional) `OPENAI_MODEL` = `gpt-4o-mini` (o el que prefieras)

## 2) Rutas
- `/` → home con tarjetas
- `/m/<slug>` → chat nativo del módulo
- `/api/chat/<slug>` → endpoint backend que inyecta el system prompt seguro

## 3) Seguridad
- Los prompts viven en `lib/system-prompts.js` y **no se importan en el cliente**.
- El endpoint bloquea intentos de extracción (palabras clave).
- Puedes ampliar las reglas en `isForbiddenExtraction()`.

## 4) Local
```
npm install
npm run dev
```
Crea `.env.local` con tu `OPENAI_API_KEY`.

© The Creativity Engine — Gaby Castellanos
