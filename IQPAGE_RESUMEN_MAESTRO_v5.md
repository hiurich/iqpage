# IQPAGE — RESUMEN MAESTRO v5
**Última actualización:** 9 de mayo de 2026  
**Próximo hito:** Lanzamiento Product Hunt — 14 de mayo 2026 · 12:01 AM PDT

---

## 1. PRODUCTO

**IQPage** es una extensión de Chrome con IA que permite:
- Resumir cualquier página web en menos de 10 segundos
- Chatear con el contenido de la página (Q&A con contexto completo)
- Detectar sesgo y lenguaje cargado en noticias
- Resaltado inteligente: Explicar, Traducir, Guardar como cita, Añadir nota
- Exportar resúmenes a PDF y Word
- Comparar cómo distintas fuentes cubren el mismo tema (hasta 3 tabs)
- Modos de nicho: Legal, Académico, Social, Consultoría, Ciencia

**Powered by:** Claude AI (Anthropic) — Haiku para Free/Edu, Sonnet para Pro/Power  
**Extension ID (CWS):** `igbighpdnelefhkbaknocckccpjconln`  
**Versión actual:** v1.0.4

---

## 2. STACK TÉCNICO

| Componente | Tecnología | URL |
|---|---|---|
| Frontend (landing) | HTML/CSS/JS vanilla | https://iqpage.app |
| Hosting landing | Netlify | app.netlify.com |
| Backend | Node.js + Express | https://iqpage-production.up.railway.app |
| Base de datos | Supabase (PostgreSQL) | supabase.com |
| Auth | Supabase Auth | — |
| Pagos (internacional) | Stripe | dashboard.stripe.com |
| Pagos (LATAM) | Hotmart | app.hotmart.com |
| AI | Anthropic Claude | console.anthropic.com |
| Repositorio | GitHub | github.com/Hainrixz/iqpage |
| Dominio | GoDaddy → Netlify | iqpage.app |
| Email | Microsoft 365 (GoDaddy) | info@iqpage.app |
| OAuth | Google Cloud Console | console.cloud.google.com |

---

## 3. PLANES Y PRECIOS

| Plan | Precio | Resúmenes | Q&A | Modelo |
|---|---|---|---|---|
| Free | $0/mo | 3/semana | 5/semana | Claude Haiku |
| Edu | $5/mo | 80/mes | Ilimitado | Claude Haiku |
| Pro | $12/mo | 200/mes | 500/mes | Claude Sonnet |
| Power | $29/mo | Ilimitado* | 2000/mes | Claude Sonnet |

*Power: soft cap interno de 700. Fair use: sobre 600 resúmenes/mes baja silenciosamente a Haiku.  
`POWER_FAIR_USE_THRESHOLD = 600`

**Links de pago Stripe:**
- Edu: `https://buy.stripe.com/eVqeVcfLx94U0j18W68g000`
- Pro: `https://buy.stripe.com/28E00i2YLgxmd5N5JU8g001`
- Power: `https://buy.stripe.com/cNi6oGbvh5SIaXF5JU8g002`

---

## 4. ARCHIVOS BACKEND MODIFICADOS

### `backend/middleware/usageCheck.js`
- Pro: 200 resúmenes/mes (era 100)
- Power: soft cap 700, fair use threshold 600
- Inyecta `req.powerFairUse = true` cuando Power user supera 600 resúmenes

### `backend/utils/modelSelector.js`
- Acepta parámetro `powerFairUse`
- Si `powerFairUse = true` → devuelve Haiku en lugar de Sonnet (downgrade silencioso)

### `backend/routes/summarize.js`
- Pasa `req.powerFairUse ?? false` al `selectModel()`

---

## 5. ANALYTICS Y TRACKING

| Herramienta | ID/Key | Estado |
|---|---|---|
| Google Tag (Ads) | AW-639818740 | ✅ Instalado en index.html |
| Google Analytics GA4 | G-0M3FP8SF3M | ✅ Instalado en index.html |
| Google Search Console | iqpage.app | ✅ Verificado vía GA4 |
| Ahrefs | Proyecto "Iqpage" | ✅ Verificado vía HTML tag |
| PostHog | phc_yGPVDEMQhr9K8im4LU3BktmuTCoXBs5imJtfUBVtoa5j | ✅ Instalado en index.html |

**Google Ads:**
- Dominio iqpage.app verificado en Gestor de datos
- Calidad de Etiqueta: **Excelente**
- Dominio configurado: `iqpage.app` (coincide exactamente)

**Search Console:**
- Sitemap enviado: `https://iqpage.app/sitemap.xml`
- 6 URLs en el sitemap (homepage + 5 landing pages)
- Re-indexación solicitada el 8 de mayo 2026

**Ahrefs:**
- Auditoría semanal: viernes
- 16 dominios de referencia
- DR: en crecimiento (partió de 0)

---

## 6. SEO — CAMBIOS APLICADOS AL INDEX.HTML

Todos deployados en producción:

```html
<link rel="canonical" href="https://iqpage.app"/>
<link rel="icon" type="image/png" sizes="32x32" href="/icon32.png"/>
<link rel="icon" type="image/png" sizes="128x128" href="/icon128.png"/>
<link rel="apple-touch-icon" href="/icon128.png"/>
<script type="application/ld+json">
  SoftwareApplication + FAQPage (5 preguntas)
</script>
```

**robots.txt** creado en raíz del repo:
```
User-agent: *
Allow: /
Sitemap: https://iqpage.app/sitemap.xml
```

**Ahrefs meta tag** instalado en `<head>`:
```html
<meta name="ahrefs-site-verification" content="bf90de575e8cd5042a5e9a862b337ba40a63729e8fb5833dbe0d594e3ed922d7"/>
```

---

## 7. LANDING PAGES SEO

Todas deployadas en producción bajo el mismo dominio/repo:

| URL | Keyword objetivo | Estado |
|---|---|---|
| `iqpage.app/ai-summarizer-for-chrome` | ai summarizer chrome extension | ✅ Live |
| `iqpage.app/summarize-any-webpage` | summarize any webpage | ✅ Live |
| `iqpage.app/bias-detection-chrome-extension` | bias detection chrome extension | ✅ Live |
| `iqpage.app/ai-reading-assistant` | ai reading assistant | ✅ Live |
| `iqpage.app/chatpdf-alternative` | chatpdf alternative | ✅ Live |

Cada landing incluye:
- Meta title, description y canonical única
- Schema markup `SoftwareApplication`
- H1 con keyword exacta
- Breadcrumb para estructura semántica
- Tabla de comparación vs competidores
- FAQ con preguntas reales de búsqueda
- CTA hacia CWS

---

## 8. DIRECTORIOS SUBMITIDOS

| Directorio | URL | Estado |
|---|---|---|
| SaaSHub | saashub.com/iqpage | ✅ Verificado, pendiente aprobación (hasta 32 días) |
| PeerPush | peerpush.net/p/iqpage | ✅ Listado, cola #2061, ~1 mes |
| Viral Bucket | myviralbucket.com | ✅ Listado y activo |
| AlternativeTo | alternativeto.net | ⏳ **Submitir el 15 de mayo** (cuenta necesita 7 días) |

**AlternativeTo — recordatorio:** submitir el 15 de mayo en `alternativeto.net/manage-item/`  
Competidores a seleccionar: Perplexity, ChatGPT, Glasp

---

## 9. HOTMART

5 productos configurados:

| Producto | Precio | Comisión |
|---|---|---|
| IQPage Edu | $5/mo | 30% |
| IQPage Pro | $12/mo | 30% |
| IQPage Power | $29/mo | 25% |
| IQPage Pro Anual | $97 | 35% |
| IQPage Power Anual | $249 | 30% |

**⚠️ PENDIENTE CRÍTICO:** Webhook de Hotmart NO implementado.  
Endpoint que debe crearse: `https://iqpage-production.up.railway.app/api/webhook/hotmart`  
Eventos a manejar: `PURCHASE_COMPLETE`, `PURCHASE_CANCELLED`, `PURCHASE_REFUNDED`  
Validar con: `HOTMART_HOTTOK` (variable de entorno en Railway)  
Al compra completada: actualizar `profiles.plan` en Supabase por email del comprador

---

## 10. GOOGLE ADS — ESTRATEGIA

**Estado actual:** Sin campañas activas.

**Recomendación:** No lanzar hasta después del 14 de mayo. Esperar datos de conversión reales del tráfico de Product Hunt.

**Keywords con volumen real (datos de Google Trends):**

| Keyword | Tendencia | Grupo |
|---|---|---|
| `chatpdf` | Alta (86/100) | Comparativas |
| `summarize article` | Alta (58-100) | Summarizer |
| `summarize this article` | Media-alta (57) | Summarizer |
| `chatpdf alternative` | Breakout creciente | Comparativas |
| `claude ai chrome extension` | Media (28, +70%) | AI Extension |
| `ai chrome extension` | Media (17-50) | AI Extension |

**Keywords descartadas (volumen 0):**
- `ai summarizer chrome extension` — 0 absoluto
- `how to summarize a webpage` — 0 absoluto
- `perplexity chrome extension` — solo spikes aislados

**Estructura de campaña para cuando se lance:**

- **Grupo 1 — Summarize** ($1/día) → `/ai-summarizer-for-chrome`
  - `summarize article`, `summarize this article for me`, `ai summarize article`
- **Grupo 2 — ChatPDF** ($3/día) → `/chatpdf-alternative`
  - `chatpdf`, `chatpdf alternative`, `chatpdf free`
- **Grupo 3 — Claude/AI Extension** ($1/día) → `/ai-reading-assistant`
  - `claude ai chrome extension`, `ai chrome extension`

**Keywords negativas desde día 1:**
- `youtube`, `pdf upload`, `chatgpt`, `free download`, `jobs`, `crack`

---

## 11. PRODUCT HUNT

- **Fecha:** 14 de mayo 2026 · 12:01 AM PDT
- **URL:** producthunt.com/products/iqpage
- **Página:** Solo visible con link directo (no pública hasta el lanzamiento)
- **Threads creados:** Sí (foro del producto)

**Checklist el día del lanzamiento:**
- [ ] Pausar TODAS las campañas de Google Ads
- [ ] Responder cada comentario en las primeras 6 horas
- [ ] Monitorear posición en el ranking cada hora
- [ ] Tener IQPage funcionando sin errores en Railway

---

## 12. REDDIT — POSTS PUBLICADOS

- `r/buildinpublic` — "From the death of my wife to building apps: this is my short story" ✅
- `r/chrome_extensions` — Post sobre primera reseña en CWS ✅
- `r/buildinpublic` — Respuesta al feedback sobre retención y bias detection ✅
- `r/shipped` — Mencionado para publicar también ahí

---

## 13. CHROME WEB STORE

- **Usuarios activos:** 3
- **Reseñas respondidas:**
  - Heidi Aguilar ⭐⭐⭐⭐⭐ — respondida ✅
  - Jaime Bolton ⭐⭐⭐⭐ — respondida ✅

---

## 14. REGLAS DE COMUNICACIÓN (establecidas en sesión)

- Respuestas concisas, sin contexto innecesario
- No explicar lo obvio ni repetir lo que se pidió
- No inventar información — solo datos reales verificables
- **Prohibido inventar datos, precios, códigos de descuento o cualquier información**
- Aplicar "humanizalo" cuando se pida para textos de marketing
- No usar — (usar comas en su lugar en textos de marketing)

---

## 15. SKILLS INSTALADAS

| Skill | Ubicación | Trigger |
|---|---|---|
| humanizalo | `~/.claude/skills/humanizalo/` | "aplica humanizalo" |
| the-architect | `/home/claude/the-architect/` | Correr en Claude Code |
| open-carrusel | `~/Desktop/open-carrusel/` | `npm run dev` en localhost:3001 |
| frontend-design | `/mnt/skills/public/frontend-design/` | Cualquier UI/web |

---

## 16. PENDIENTES CRÍTICOS (orden de prioridad)

### 🔴 URGENTE (antes del 14 de mayo)

1. **Webhook Hotmart** — sin esto los pagos LATAM no activan planes automáticamente
   - Crear `backend/routes/webhook-hotmart.js`
   - Validar `HOTMART_HOTTOK`
   - Actualizar `profiles.plan` en Supabase por email
   - Eventos: `PURCHASE_COMPLETE`, `PURCHASE_CANCELLED`, `PURCHASE_REFUNDED`

2. **Video demo para Product Hunt** — 60 segundos con Loom
   - Mostrar: instalar → abrir CNN → resumir → chatear → detectar sesgo

### 🟡 POST-LANZAMIENTO (semana del 15 de mayo)

3. **AlternativeTo** — submitir el 15 de mayo (cuenta ya tiene 7 días)
   - URL: `alternativeto.net/manage-item/`
   - Competidores: Perplexity, ChatGPT, Glasp

4. **Google Ads** — lanzar campaña inglesa ($5/día) con keywords validadas
   - Esperar datos de conversión de Product Hunt primero
   - Keywords reales: `chatpdf`, `summarize article`, `claude ai chrome extension`

5. **Campaña Google Ads en español** ($3/día) — semana 2 post-lanzamiento

### 🟢 MEDIANO PLAZO (mes 1-2)

6. **Blog** — contenido orientado a keywords de problema
   - "how to summarize articles online"
   - "how to detect bias in news"
   - "chatpdf vs iqpage"

7. **Performance Max** — mes 2, con datos de conversión acumulados

8. **Programmatic SEO** — páginas por sitio: `iqpage.app/summarize/reuters`, etc.

9. **Botones de compartir en redes** — solo en landing pages SEO y blog (no en homepage)

---

## 17. ARCHIVOS DEL REPO (estructura actual)

```
PageIQ/
├── index.html                          ← Landing principal
├── robots.txt                          ← Nuevo (8 mayo)
├── sitemap.xml                         ← Actualizado (6 URLs)
├── chrome.png                          ← Ícono Chrome para badge
├── icon16.png / icon32.png / icon48.png / icon128.png
├── og_image.jpg                        ← 1200x630px
├── screenshot_1_summarize.png
├── screenshot_2_chat.png
├── screenshot_3_minimenu.png
├── screenshot_4_export.png
├── screenshot_5_legal.png
├── privacy.html / terms.html
├── ai-summarizer-for-chrome/
│   └── index.html
├── summarize-any-webpage/
│   └── index.html
├── bias-detection-chrome-extension/
│   └── index.html
├── ai-reading-assistant/
│   └── index.html
├── chatpdf-alternative/
│   └── index.html
├── backend/
│   ├── middleware/
│   │   ├── usageCheck.js               ← MODIFICADO (pro 200, power fair use)
│   │   ├── rateLimit.js
│   │   └── auth.js
│   ├── routes/
│   │   ├── summarize.js                ← MODIFICADO (powerFairUse param)
│   │   ├── chat.js
│   │   ├── bias.js
│   │   ├── compare.js
│   │   ├── highlight.js
│   │   ├── niche.js
│   │   ├── stripe.js
│   │   └── user.js
│   └── utils/
│       ├── modelSelector.js            ← MODIFICADO (powerFairUse logic)
│       ├── costTracker.js
│       └── supabase.js
└── extension/
    ├── manifest.json
    ├── popup.js / popup.html
    ├── sidepanel.js / sidepanel.html
    ├── background.js
    └── content.js
```

---

## 18. HERRAMIENTAS DEL PANEL DE CONTROL

Dashboard HTML descargable generado: `iqpage_dashboard.html`

Incluye links directos + checklists para:
- iqpage.app, CWS, CWS Developer Dashboard, Railway, Netlify
- 5 landing pages SEO
- GA4, PostHog, Search Console, Google Ads, Ahrefs
- Supabase, Stripe, Hotmart, Anthropic Console
- Google Cloud Console, GoDaddy, Outlook
- Product Hunt, SaaSHub, PeerPush, Viral Bucket, AlternativeTo

---

## 19. MAILCHIMP

- **Lista:** db938db231
- **Account ID:** dad7159161c2181dc49191bde
- **Form action:** `https://gmail.us10.list-manage.com/subscribe/post?u=dad7159161c2181dc49191bde&id=db938db231`
- **Estado:** Formulario instalado en homepage

---

## 20. NOTAS IMPORTANTES

- El resumen maestro anterior era v4 — este es v5
- La landing page original (violet/paper theme con Syne + DM Sans) es la aprobada y en producción
- Las versiones Stripe y Wise fueron descartadas
- El lanzamiento se movió del 13 al **14 de mayo**
- Nunca inventar información, precios ni datos
- AlternativeTo: submitir el **15 de mayo** sin falta
