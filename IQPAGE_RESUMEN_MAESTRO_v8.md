# IQPAGE — RESUMEN MAESTRO v8
**Última actualización:** 21 de mayo de 2026
**Chat anterior:** IQPage 9 - Claude (claude.ai)

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
**Versión actual:** v1.0.9 (subida a Chrome Web Store — pendiente aprobación)

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

### Payment Links Stripe (mensuales):
- Edu: `https://buy.stripe.com/eVqeVcfLx94U0j18W68g000`
- Pro: `https://buy.stripe.com/28E00i2YLgxmd5N5JU8g001`
- Power: `https://buy.stripe.com/cNi6oGbvh5SIaXF5JU8g002`

### Payment Links Stripe (anuales):
- Edu Anual: `https://buy.stripe.com/6oU5kC7f14OEfdVa0a8g003`
- Pro Anual: `https://buy.stripe.com/aFaeVcarda8Yc1Jdcm8g004`
- Power Anual: `https://buy.stripe.com/00wfZggPB2Gw7Ltc8i8g005`

### Payment Link con Free Trial 30 días (Power):
- `https://buy.stripe.com/fZueVc2YLepe3vd1tE8g006`

---

## 4. CUPÓN PRODUCT HUNT

- **Código:** `IQPagePH`
- **Descuento:** 1 mes gratis (100%)
- **Límite:** 100 canjes
- **Vence:** 13 de junio de 2026
- **Dónde usar:** En el checkout de Stripe

---

## 5. CAMBIOS REALIZADOS EN ESTA SESIÓN (v7 → v8)

### Extensión Chrome:
- ✅ CDN de marked.js reemplazado por archivo local `lib/marked.min.js` en popup.html
- ✅ Versión bumpeada a 1.0.9 en manifest.json
- ✅ ZIP `iqpage_extension_v1.0.9.zip` generado y subido a Chrome Web Store (pendiente aprobación)
- ✅ Primer rechazo de v1.0.8 resuelto (CDN externo en Manifest V3)

### Stripe:
- ✅ Payment Link creado con Free Trial de 30 días para Power
- ✅ Confirmado que Stripe siempre requiere método de pago incluso con trial

### Brevo:
- ✅ Cuenta suspendida por hard bounce rate 18.86%
- ✅ Dominio iqpage.app reautenticado (DKIM)
- ✅ Cuenta reactivada
- ✅ Segmento "Hard Bounces Schools" eliminado
- ✅ Email de escuelas enviado a 300 contactos (50.25% apertura, 46% CTR)
- ✅ Email de periodistas/investigadores creado (email_journalists_launch.html)

### Email marketing:
- ✅ 3 emails HTML creados para Brevo:
  - `email_schools_launch.html` — enviado a 300 escuelas
  - `email_journalists_launch.html` — para periodistas/investigadores
  - Email de usuarios Supabase — enviado via Mailchimp

### Generación de leads:
- ✅ Workflow N8N configurado (Google Maps Scraper)
- ✅ Script Python con Serper API funcionando para scraping de emails
- ✅ Apify configurado — LinkedIn Profile Scraper + Email ($10/1k)
- ✅ 11 emails verificados de periodistas NYT, NY Post, NY Mag extraídos
- ✅ Múltiples CSVs limpiados (law firms, schools, research institutes, news agencies)
- ✅ Búsquedas LinkedIn configuradas: `site:linkedin.com/in "journalist" "New York" "@gmail.com" OR "@yahoo.com"...`

### Usuarios:
- Todos los usuarios reales están en plan **free** (9 usuarios)
- huguito@gmail.com — activar plan power manualmente desde Supabase SQL Editor cuando se registre

### Google Ads:
- ⏳ Cuenta anterior cerrada (865-971-2894)
- ⏳ Pendiente crear cuenta nueva en ads.google.com

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

- **Dominio autenticado:** iqpage.app (DKIM + DMARC en Netlify DNS) ✅
- **Remitente:** `Hiurich — IQPage <info@iqpage.app>`
- **API Key Railway:** `BREVO_API_KEY`
- **Template ID bienvenida:** 2
- **Lista Law Firms:** #3 (268 contactos)
- **Lista Schools:** 300 contactos (limpiada)
- **Límite plan free:** 300 emails/día
- **Estado cuenta:** Reactivada después de suspensión por bounces

### Reglas para evitar nueva suspensión:
- Nunca enviar más de 50 emails a lista nueva sin verificar primero
- Verificar emails con NeverBounce o ZeroBounce antes de importar
- Hard bounce rate debe mantenerse bajo 2%

---

## 8. ANALYTICS

| Herramienta | ID/Key | Estado |
|---|---|---|
| Google Tag (Ads) | AW-639818740 | ✅ |
| Google Analytics GA4 | G-0M3FP8SF3M | ✅ |
| Google Search Console | iqpage.app | ✅ |
| Ahrefs | Proyecto "Iqpage" | ✅ |
| PostHog | phc_yGPVDEMQhr9K8im4LU3BktmuTCoXBs5imJtfUBVtoa5j | ✅ |

---

## 9. DIRECTORIOS SUBMITIDOS

| Directorio | URL | Estado |
|---|---|---|
| SaaSHub | saashub.com/iqpage | ✅ Pendiente aprobación |
| PeerPush | peerpush.net/p/iqpage | ✅ Cola ~1 mes |
| Viral Bucket | myviralbucket.com | ✅ Activo |
| AlternativeTo | alternativeto.net | ⏳ Submitir (cuenta creada, esperar 7 días desde 14 mayo) |
| Product Hunt | producthunt.com/posts/iqpage | ✅ Lanzado el 14 mayo |

---

## 10. PENDIENTES CRÍTICOS

### 🔴 URGENTE

1. **Chrome Web Store** — verificar aprobación de v1.0.9 (fix CDN marked.js)
2. **Google Ads** — crear cuenta nueva y lanzar campaña Search ($5/día) enfocada en suscripciones
3. **AlternativeTo** — submitir (ya pasaron 7 días desde creación de cuenta el 14 mayo)
4. **huguito@gmail.com** — activar plan Power en Supabase cuando se registre

### 🟡 POST-INMEDIATO

5. **Campaña Brevo a periodistas** — email `email_journalists_launch.html` listo para enviar a lista de 11 emails verificados + journalists_linkedin_urls extraídos
6. **Hotmart** — resolver Payoneer, reactivar 5 productos
7. **Campaña Brevo a escuelas** — quedan 64 emails de schools CSV sin enviar
8. **Verificar emails con NeverBounce/ZeroBounce** antes de próxima campaña masiva

### 🟢 MEDIANO PLAZO

9. **Rate limiting por user_id** en backend
10. **Rotación periódica de Supabase anon key**
11. **Verificación de RLS** en todas las tablas
12. **Programmatic SEO** — páginas por sitio
13. **Columna `welcome_email_sent`** en profiles (evitar emails duplicados)
14. **Landing pages anuales** — `iqpage.app/pro-anual` y `iqpage.app/power-anual`
15. **Blog/contenido SEO** — artículos sobre detección de sesgo, lectura inteligente

---

## 11. GENERACIÓN DE LEADS — HERRAMIENTAS CONFIGURADAS

### Serper API
- **API Key:** en serper.dev (2,500 créditos disponibles)
- **Script:** `scrape_news_agencies.py` en `/Users/hiurichg/Documents/PageIQ/`
- **Uso:** Buscar emails en Google Maps por nicho y ciudad

### Apify
- **URL:** console.apify.com
- **Actor:** LinkedIn Profile Scraper + Email (harvestapi) — $10/1k perfiles
- **Saldo:** ~$4.52 restantes
- **Uso:** Extraer emails de perfiles LinkedIn

### N8N
- **URL:** hiurich.app.n8n.cloud
- **Workflow:** "Scrape Unlimited Leads with Google Maps" — importado
- **Google Sheet:** "Scrape Unlimited Leads Without APIs" — conectada

### Búsquedas LinkedIn útiles:
```
site:linkedin.com/in "journalist" "New York" "@gmail.com" OR "@yahoo.com" OR "@hotmail.com" OR "@outlook.com"
site:linkedin.com/in "news reporter" "New York" "@gmail.com" OR "@yahoo.com"
site:linkedin.com/in "editor" "media" "@gmail.com" OR "@yahoo.com"
```

### Nichos por Bing Maps scraper:
- Universities New York
- Research Institute New York
- Marketing Agency New York
- News Agency New York
- Business Consulting Firm New York
- Law Firm New York
- Private School New York
- Software Company New York
- Nonprofit Organization New York
- Digital Media Agency New York

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

## 13. METODOLOGÍA DE TRABAJO

### Herramientas:
- **Claude.ai (este chat)** — coordinación general, decisiones de producto, generación de código y copy
- **Claude Code (VS Code)** — edición directa de archivos, commits, auditoría
- **GitHub** — repositorio y deploy automático vía Railway
- **Railway** — variables de entorno, deploy automático al hacer push a `main`

### Flujo de trabajo:
1. Discutir cambio en Claude.ai
2. Claude genera el código o prompt
3. Pegar prompt en Claude Code (chat) para cambios complejos
4. Para cambios simples: editar manualmente en VS Code y hacer commit desde terminal
5. Railway hace deploy automático al detectar push a `main`
6. Verificar en `iqpage.app` que el cambio quedó bien

### Archivos importantes:
- Extensión: `/Users/hiurichg/Documents/PageIQ/extension/`
- Backend: `/Users/hiurichg/Documents/PageIQ/backend/`
- Landing: `/Users/hiurichg/Documents/PageIQ/index.html`
- ZIP extensión: `/Users/hiurichg/Documents/PageIQ/iqpage_extension_v1.0.9.zip`

### Reglas de comunicación:
- Prompts para Claude Code siempre en bloque de código (con botón de copiar)
- Respuestas concisas, sin contexto innecesario
- No inventar información — solo datos reales verificables
- Aplicar humanizalo cuando se pida para textos de marketing

---

## 14. NOTAS IMPORTANTES

- El repo es público en GitHub (`hiurich/iqpage`) — las keys están seguras en Railway
- Brevo límite free: 300 emails/día
- Skill de diseño web disponible en Claude Code: **awesome-design-md** (70 estilos: Apple, Ferrari, Stripe, Notion, Tesla, etc.)
- Para activar plan a usuario manualmente: SQL Editor Supabase → `UPDATE public.profiles SET plan = 'power' WHERE email = 'email@ejemplo.com';`
- Google Ads cuenta anterior (865-971-2894) está cerrada — crear cuenta nueva
