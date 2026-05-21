# IQPAGE — RESUMEN MAESTRO v7
**Última actualización:** 13 de mayo de 2026  
**Próximo hito:** Lanzamiento Product Hunt — 14 de mayo 2026 · 12:01 AM PDT (JUEVES)

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
**Versión actual:** v1.0.8 (en revisión en Chrome Web Store)

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
| Repositorio | GitHub | github.com/hiurich/iqpage |
| Dominio | GoDaddy → Netlify | iqpage.app |
| Email transaccional | Brevo | app.brevo.com |
| Email marketing | Brevo + Mailchimp | — |
| OAuth | Google Cloud Console | console.cloud.google.com |

---

## 3. PLANES Y PRECIOS

| Plan | Precio | Resúmenes | Q&A | Modelo |
|---|---|---|---|---|
| Free | $0/mo | 3/semana | 5/semana | Claude Haiku |
| Edu | $5/mo | 80/mes | Ilimitado | Claude Haiku |
| Pro | $12/mo | 200/mes | 500/mes | Claude Sonnet |
| Power | $29/mo | Ilimitado* | 2000/mes | Claude Sonnet |

### Planes Anuales

| Plan | Precio Anual | Descuento | Payment Link Stripe |
|---|---|---|---|
| Edu Anual | $51/año ($4.25/mo) | 15% | `https://buy.stripe.com/6oU5kC7f14OEfdVa0a8g003` |
| Pro Anual | $115/año ($9.58/mo) | 20% | `https://buy.stripe.com/aFaeVcarda8Yc1Jdcm8g004` |
| Power Anual | $278/año ($23.17/mo) | 20% | `https://buy.stripe.com/00wfZggPB2Gw7Ltc8i8g005` |

### Links de pago Stripe (mensuales):
- Edu: `https://buy.stripe.com/eVqeVcfLx94U0j18W68g000`
- Pro: `https://buy.stripe.com/28E00i2YLgxmd5N5JU8g001`
- Power: `https://buy.stripe.com/cNi6oGbvh5SIaXF5JU8g002`

---

## 4. CUPÓN PRODUCT HUNT

- **Código:** `IQPagePH`
- **Descuento:** 1 mes gratis (100%)
- **Límite:** 100 canjes
- **Vence:** 13 de junio de 2026
- **Dónde usar:** En el checkout de Stripe

---

## 5. CAMBIOS REALIZADOS EN ESTA SESIÓN (v6 → v7)

### Landing page (index.html):
- ✅ `<title>` actualizado: `IQPage — AI Summarizer for Chrome | Summarize Any Webpage in Seconds`
- ✅ `<meta description>` actualizado con keywords de conversión
- ✅ `og:title` y `twitter:title` actualizados
- ✅ `<h1>` cambiado de "Read Smarter." a "Summarize any webpage."
- ✅ Typewriter actualizado: `["In seconds.", "Spot manipulation.", "Detect bias.", "Read smarter."]`
- ✅ Payment Links anuales Stripe conectados en `toggleBilling()`
- ✅ `robots.txt` creado (allowlist facebookexternalhit)
- ✅ `netlify.toml` creado con PostHog reverse proxy y headers de seguridad

### Extensión Chrome:
- ✅ Botón "⚡ Upgrade" ahora abre `iqpage.app/#pricing` en lugar de ir directo al checkout de Pro
- ✅ Markdown renderizado en `#result-content` (usando marked.js)
- ✅ Modal de Compare ampliado (max-width: 380px, max-height: 320px)
- ✅ Plan se refresca al cambiar de pestaña (chrome.tabs.onActivated listener)
- ✅ Versión bumpeada a 1.0.8 en manifest.json
- ✅ ZIP `iqpage_extension_v1.0.8.zip` generado y subido a Chrome Web Store (en revisión)

### Backend:
- ✅ PostHog api_host apunta a `https://iqpage.app/ingest` (reverse proxy)
- ✅ `backend/utils/sendWelcomeEmail.js` creado — envía email de bienvenida via Brevo API
- ✅ `backend/middleware/auth.js` actualizado — dispara sendWelcomeEmail si perfil tiene menos de 5 minutos

### Email marketing:
- ✅ Brevo configurado y autenticado con `info@iqpage.app`
- ✅ DKIM y DMARC configurados en Netlify DNS
- ✅ `BREVO_API_KEY` agregada en Railway
- ✅ Plantilla de bienvenida creada en Brevo (Template ID: 2)
- ✅ Email de lanzamiento enviado a 268 contactos (law firms) — 31% open rate
- ✅ Email de lanzamiento enviado a 9 usuarios reales via Mailchimp

### SEO y analytics:
- ✅ Search Console reindexada
- ✅ PostHog URL autorizada: `iqpage.app`
- ✅ PostHog reverse proxy configurado via Netlify

### Redes sociales:
- ✅ Post en LinkedIn publicado (inglés y español)
- ✅ Email enviado a Product Hunt sobre posts rechazados

---

## 6. USUARIOS ACTUALES (Supabase → profiles)

| Email | Plan |
|---|---|
| meerabolton.706211@gmail.com | free |
| walderbaelish.308093@gmail.com | free |
| cwsking6@gmail.com | free |
| esguerrareehan@gmail.com | free |
| heyitsmetravor@gmail.com | free |
| sheriflandonic@gmail.com | free |
| pod1cws@gmail.com | free |
| testcwsblr@gmail.com | free |
| cwsblrtest@gmail.com | free |

**Cuentas de prueba (excluir):** `heidiaguilarchai@gmail.com`, `hiurich1980@gmail.com`

---

## 7. BREVO — CONFIGURACIÓN

- **Dominio autenticado:** iqpage.app (DKIM + DMARC en Netlify DNS)
- **Remitente:** `Hiurich — IQPage <info@iqpage.app>`
- **API Key Railway:** `BREVO_API_KEY`
- **Template ID bienvenida:** 2
- **Lista Law Firms:** #3 (268 contactos)
- **Límite plan free:** 300 emails/día (~9,000/mes)

---

## 8. ARCHIVOS DE EMAIL GENERADOS

| Archivo | Descripción |
|---|---|
| `email_launch.html` | Email de lanzamiento Product Hunt (enviado) |
| `email_welcome.html` | Email de bienvenida automático (configurado en Brevo) |

---

## 9. PRODUCT HUNT

- **Fecha:** 14 de mayo 2026 · 12:01 AM PDT (JUEVES)
- **URL:** producthunt.com/products/iqpage
- **Posts en Discussion:** rechazados — respondieron que hay que agregar más contexto personal y preguntas abiertas genuinas
- **Email enviado a:** hello@producthunt.com sobre posts rechazados

### Checklist el día del lanzamiento:
- [ ] Publicar Hunter comment a las 12:01 AM PDT
- [ ] Postear en Reddit r/buildinpublic
- [ ] Compartir en Threads
- [ ] Responder cada comentario en las primeras 6 horas
- [ ] Monitorear posición en el ranking cada hora
- [ ] Verificar que IQPage funcione sin errores en Railway

### Hunter comment (REDACTAR ANTES DEL LANZAMIENTO):
- Pendiente — no fue redactado en esta sesión

---

## 10. PENDIENTES CRÍTICOS

### 🔴 URGENTE (antes/durante el 14 de mayo)

1. **Hunter comment** — redactar y publicar a las 12:01 AM PDT
2. **Post en Product Hunt Discussion** — reescribir con más contexto personal y publicar
3. **Video demo 60s con Loom** — no completado (instalar → CNN → resumir → chatear → detectar sesgo)

### 🟡 POST-LANZAMIENTO (semana del 15 de mayo)

4. **AlternativeTo** — submitir el 15 de mayo (competidores: Perplexity, ChatGPT, Glasp)
5. **Hotmart — método de retiro** — resolver Payoneer, reactivar 5 productos
6. **Google Ads** — lanzar campaña inglesa ($5/día) después del 14 de mayo
7. **Unificar precios anuales** Hotmart vs Stripe
8. **Campaña Brevo a escuelas** — 364 emails pendientes (emails_schools.csv)
9. **Autenticación completa Brevo** — puede tardar hasta 48h en propagarse

### 🟢 MEDIANO PLAZO

10. **Rate limiting por user_id** en backend
11. **Rotación periódica de Supabase anon key**
12. **Verificación de RLS** en todas las tablas
13. **Programmatic SEO** — páginas por sitio
14. **Columna `welcome_email_sent`** en profiles (evitar emails duplicados)
15. **Landing pages anuales** — `iqpage.app/pro-anual` y `iqpage.app/power-anual`

---

## 11. METODOLOGÍA DE TRABAJO

### Herramientas:
- **Claude.ai (este chat)** — coordinación general, decisiones de producto, generación de código y copy
- **Claude Code (VS Code)** — edición directa de archivos, commits, auditoría
- **GitHub** — repositorio y deploy automático vía Railway
- **Railway** — variables de entorno, deploy automático al hacer push a `main`

### Skills disponibles en Claude Code:
`/launch-strategy`, `/marketing-psychology`, `/marketing-ideas`, `/paid-ads`, `/ad-creative`, `/copywriting`, `/humanizer`, `/social-content`, `/email-sequence`, `/cold-email`, `/page-cro`, `/paywall-upgrade-cro`, `/seo-audit`, `/ai-seo`, `/ui-ux-pro-max`, `/find-skills`, y más (ver `Guia_Claude_Code_Hiurich.pdf`)

### Flujo de trabajo:
1. Discutir cambio en Claude.ai
2. Claude genera el código o prompt
3. Pegar prompt en Claude Code (chat) para cambios complejos
4. Para cambios simples: editar manualmente en VS Code y hacer commit desde terminal
5. Railway hace deploy automático al detectar push a `main`
6. Verificar en `iqpage.app` que el cambio quedó bien

### Reglas de comunicación:
- Prompts para Claude Code siempre en bloque de código (con botón de copiar)
- Respuestas concisas, sin contexto innecesario
- No inventar información — solo datos reales verificables
- Aplicar `/humanizer` cuando se pida para textos de marketing

---

## 12. VARIABLES DE ENTORNO RAILWAY

| Variable | Descripción |
|---|---|
| `ANTHROPIC_API_KEY` | Claude AI |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase admin |
| `STRIPE_SECRET_KEY` | Stripe |
| `STRIPE_PRICE_EDU` | precio mensual Edu |
| `STRIPE_PRICE_PRO` | precio mensual Pro |
| `STRIPE_PRICE_POWER` | precio mensual Power |
| `STRIPE_PRICE_EDU_ANNUAL` | `price_1TVkGRC3ogU3v09mW6AexSyw` |
| `STRIPE_PRICE_PRO_ANNUAL` | `price_1TVkKuC3ogU3v09mIAL2Nh0d` |
| `STRIPE_PRICE_POWER_ANNUAL` | `price_1TVkMbC3ogU3v09mmmKxr1LH` |
| `HOTMART_HOTTOK` | webhook Hotmart |
| `BREVO_API_KEY` | email transaccional Brevo |

---

## 13. ANALYTICS

| Herramienta | ID/Key | Estado |
|---|---|---|
| Google Tag (Ads) | AW-639818740 | ✅ |
| Google Analytics GA4 | G-0M3FP8SF3M | ✅ |
| Google Search Console | iqpage.app | ✅ Reindexado |
| Ahrefs | Proyecto "Iqpage" | ✅ |
| PostHog | phc_yGPVDEMQhr9K8im4LU3BktmuTCoXBs5imJtfUBVtoa5j | ✅ Reverse proxy activo |

---

## 14. DIRECTORIOS SUBMITIDOS

| Directorio | URL | Estado |
|---|---|---|
| SaaSHub | saashub.com/iqpage | ✅ Pendiente aprobación |
| PeerPush | peerpush.net/p/iqpage | ✅ Cola ~1 mes |
| Viral Bucket | myviralbucket.com | ✅ Activo |
| AlternativeTo | alternativeto.net | ⏳ Submitir el 15 de mayo |

---

## 15. NOTAS IMPORTANTES

- El resumen anterior era v6 — este es v7
- El lanzamiento es el **JUEVES 14 de mayo** a las 12:01 AM PDT
- Nunca inventar información, precios ni datos
- Railway: verificar saldo antes del lanzamiento
- El repo es público en GitHub (`hiurich/iqpage`) — las keys están seguras en Railway
- Brevo límite free: 300 emails/día — quedan 32 emails para hoy 13 de mayo
- El Hunter comment es lo más crítico pendiente antes del lanzamiento
