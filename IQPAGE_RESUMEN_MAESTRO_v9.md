# IQPAGE — RESUMEN MAESTRO v9
**Última actualización:** 22 de mayo de 2026
**Chat anterior:** IQPage 10 - Claude (claude.ai)

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
**Versión actual:** v1.0.9 (publicada y activa en Chrome Web Store ✅)

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

## 5. GOOGLE ADS — CONFIGURACIÓN ACTUAL

### Cuenta:
- **ID:** 844-502-2776
- **Email:** hiurich1980@gmail.com
- **Estado:** Activa ✅

### Google Tag nuevo:
- **ID:** `AW-18179823951` (cuenta nueva 844-502-2776)
- **Nota:** El tag viejo `AW-639818740` solo aparece en los archivos .md de documentación, nunca estuvo en el código — no hay nada que reemplazar.

### Campaña activa:
- **Nombre:** IQPage — Search — Pro Conversions
- **Tipo:** Search
- **Presupuesto:** $5.00 USD/día
- **Estrategia de puja:** Maximizar clics (cambiar a Conversiones cuando haya datos)
- **Ubicaciones:** USA + Canadá (solo presencia física)
- **Redes:** Solo Google Search (Display y Partners desactivados)
- **Dispositivos:** Solo ordenadores (móviles -100%, tablets -100%) ✅
- **Estado:** Habilitada — en fase de aprendizaje ✅

### Keywords activas (8):
```
[ai summarizer]
[summarize articles]
[summarize chrome extension]
"ai reading tool"
"summarize ai"
"summarize tool"
"ai summarize"
"student summarize"
```

### Keywords negativas:
```
free, open source, github, tutorial, how to build, python,
javascript, code, crack, torrent, diy, reddit, review, vs,
alternative, cheap, gratis, free trial, chrome extension free,
summarizer free
```

### Anuncios (títulos):
1. AI Summarizer for Any Page
2. Summarize Pages in 10 Seconds
3. Chat With Any Webpage – AI
4. IQPage – AI Reading Assistant
5. Powered by Claude AI
6. Pro Plan – Only $12/mo
7. Detect Bias in News Articles
8. Export Summaries to PDF & Word
9. Try Free – No Card Required
10. Read Smarter. Read Faster.
11. The Best AI Summarize Tool
12. Bias Detector for News & Articles

### Sitelinks:
- Pro Plan – $12/mo → `https://buy.stripe.com/28E00i2YLgxmd5N5JU8g001`
- Try Free → `https://iqpage.app`
- Key Features → `https://iqpage.app/#features`
- Get IQPage Extension → `https://iqpage.app` *(reemplazó "Install on Chrome" que fue rechazado)*

### Conversion Tracking:
- **Conversion ID:** `AW-18179823951`
- **Conversion Label:** `TY6lCKyZ-7AcEM-y6NxD`
- **Variables en Railway:** `GOOGLE_ADS_CONVERSION_ID` y `GOOGLE_ADS_CONVERSION_LABEL` ✅
- **Implementación:** Webhook Stripe → Railway → Google Ads Conversion API
- **Archivo:** `routes/stripe.js` → función `reportGoogleAdsConversion()`
- **Estado conversión:** Inactiva (cambia a activa con la primera conversión real)

### Resultados día 1 (21 mayo 2026):
- Impresiones: 41
- Clics: 2
- CPC medio: $1.02
- Coste: $2.05
- El 100% del gasto fue en móvil → corregido con ajuste -100% en móvil y tablet

---

## 6. CAMBIOS REALIZADOS EN ESTA SESIÓN (v8 → v9)

### Google Ads:
- ✅ Cuenta nueva creada (844-502-2776) — cuenta anterior 865-971-2894 estaba cerrada
- ✅ Campaña Search lanzada — $5/día — USA + Canadá
- ✅ Keywords, anuncios, sitelinks y negativas configurados
- ✅ Sitelink "Install on Chrome" rechazado → reemplazado por "Get IQPage Extension"
- ✅ Dispositivos ajustados: móvil -100%, tablet -100% (solo desktop)
- ✅ Conversion tracking implementado vía Stripe webhook → Railway → Google Ads API

### Backend (routes/stripe.js):
- ✅ **Fix crítico:** Webhook fallback por email — cuando `userId` es null en metadata, busca el usuario por `customer_details.email` y actualiza el plan igualmente
- ✅ **Nuevo endpoint:** `POST /api/create-portal-session` — genera URL del portal de Stripe para que el usuario cancele/cambie su suscripción
- ✅ Google Ads conversion tracking agregado en `checkout.session.completed`

### Commits del día:
- `675923e` — feat: google ads conversion tracking via stripe webhook
- `200ed84` — feat: google ads conversion tracking (refactor con env vars, USD)
- `7951647` — fix: webhook fallback por email cuando userId es null
- `a26072d` — feat: stripe customer portal endpoint

### Usuarios:
- `heidiaguilarchai@gmail.com` — pagó plan Edu $5 pero quedó en Free por bug del webhook → corregido manualmente en Supabase SQL Editor → plan = 'edu'
- `huguito@gmail.com` — plan Power activado manualmente ✅

---

## 7. USUARIOS ACTUALES (Supabase → profiles)

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
| manilaphcws@gmail.com | free |
| heidiaguilarchai@gmail.com | edu ✅ |
| huguito@gmail.com | power ✅ |

**Cuentas de prueba (excluir de métricas):** `heidiaguilarchai@gmail.com`, `hiurich1980@gmail.com`

**Primer pago real registrado:** `heidiaguilarchai@gmail.com` — $5 Edu — 22 mayo 2026 🎉

---

## 8. PENDIENTES CRÍTICOS

### 🔴 EN CURSO — PRÓXIMO PASO EXACTO

**Portal de cancelación de Stripe — paso pendiente:**

1. **Activar el portal en Stripe Dashboard:**
   - Ir a `dashboard.stripe.com`
   - Settings → Billing → Customer portal
   - Activarlo y configurar: permitir cancelar, cambiar plan, ver facturas
   - Guardar

2. **Agregar botón en la extensión** (después de activar el portal):
   - En Claude Code (terminal), pegar este prompt:
   ```
   En el popup de la extensión (extension/popup.html o popup.js), agrega un botón "Manage Subscription" que aparezca solo cuando el usuario tiene un plan de pago (edu, pro o power). Al hacer clic, debe llamar al endpoint POST /api/create-portal-session con el JWT del usuario y redirigir a la URL que devuelve. Ponlo cerca del botón de logout o en la sección de cuenta.
   ```
   - Hacer commit y push desde terminal zsh
   - Subir nuevo ZIP a Chrome Web Store

### 🔴 URGENTE

3. **AlternativeTo** — submitir (ya pasaron los 7 días desde creación de cuenta el 14 mayo)
4. **Google Ads — Search Terms Report** — revisar a los 7 días (28 mayo) qué keywords generaron clics reales

### 🟡 POST-INMEDIATO

5. **Campaña Brevo a periodistas** — email `email_journalists_launch.html` listo para enviar a lista de 11 emails verificados
6. **Hotmart** — resolver Payoneer, reactivar 5 productos
7. **Landing page `/pro`** — página dedicada para mejorar conversión del tráfico de Ads
8. **Campaña Brevo a escuelas** — quedan 64 emails de schools CSV sin enviar
9. **Verificar emails con NeverBounce/ZeroBounce** antes de próxima campaña masiva

### 🟢 MEDIANO PLAZO

10. **Rate limiting por user_id** en backend
11. **Rotación periódica de Supabase anon key**
12. **Verificación de RLS** en todas las tablas
13. **Programmatic SEO** — páginas por sitio
14. **Columna `welcome_email_sent`** en profiles (evitar emails duplicados)
15. **Landing pages anuales** — `iqpage.app/pro-anual` y `iqpage.app/power-anual`
16. **Blog/contenido SEO** — artículos sobre detección de sesgo, lectura inteligente
17. **Google Ads** — cambiar estrategia de puja de Clics a Conversiones cuando haya 10+ conversiones registradas

---

## 9. VARIABLES DE ENTORNO RAILWAY

| Variable | Valor/Descripción |
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
| `GOOGLE_ADS_CONVERSION_ID` | `AW-18179823951` |
| `GOOGLE_ADS_CONVERSION_LABEL` | `TY6lCKyZ-7AcEM-y6NxD` |

---

## 10. ANALYTICS

| Herramienta | ID/Key | Estado |
|---|---|---|
| Google Tag (Ads) nuevo | AW-18179823951 | ✅ Cuenta 844-502-2776 |
| Google Analytics GA4 | G-0M3FP8SF3M | ✅ |
| Google Search Console | iqpage.app | ✅ |
| Ahrefs | Proyecto "Iqpage" | ✅ |
| PostHog | phc_yGPVDEMQhr9K8im4LU3BktmuTCoXBs5imJtfUBVtoa5j | ✅ |

---

## 11. METODOLOGÍA DE TRABAJO

### Herramientas:
- **Claude.ai (este chat)** — coordinación general, decisiones de producto, generación de código y copy
- **Claude Code (terminal en VS Code)** — edición directa de archivos, commits (usar siempre el terminal de Claude Code, no el chat de VS Code que tiene bug de autenticación)
- **Terminal zsh (VS Code o macOS)** — comandos git, curl, grep — prompt: `hiurichg@MacBookAir backend %`
- **GitHub** — repositorio y deploy automático vía Railway
- **Railway** — variables de entorno, deploy automático al hacer push a `main`

### Flujo de trabajo:
1. Discutir cambio en Claude.ai
2. Claude genera el prompt
3. Pegar prompt en Claude Code **terminal** (no en el chat de VS Code — tiene bug 403)
4. Claude Code propone cambios → escribir **1** para auto-aceptar o **Shift+Tab**
5. En terminal zsh: `git add -A && git commit -m "mensaje" && git push origin main`
6. Railway hace deploy automático
7. Verificar con `curl https://iqpage-production.up.railway.app/health`

### Archivos importantes:
- Extensión: `/Users/hiurichg/Documents/PageIQ/extension/`
- Backend: `/Users/hiurichg/Documents/PageIQ/backend/`
- Landing: `/Users/hiurichg/Documents/PageIQ/index.html`
- ZIP extensión: `/Users/hiurichg/Documents/PageIQ/iqpage_extension_v1.0.9.zip`

### Reglas de comunicación:
- Prompts para Claude Code siempre especificando si van en terminal Claude Code o terminal zsh
- Respuestas concisas, sin contexto innecesario
- No inventar información — solo datos reales verificables
- Verificar volumen de keywords en Google Trends antes de agregarlas a Ads

### Bug conocido — Claude Code VS Code:
- El chat de Claude Code en VS Code da error 403 "Request not allowed"
- **Solución:** Usar siempre el **terminal de Claude Code** (escribir `claude` en terminal zsh → se abre la interfaz de terminal)
- El terminal de Claude Code sí funciona correctamente con la cuenta de Claude Pro

---

## 12. MENSAJE PARA CONTINUAR EN EL PRÓXIMO CHAT

```
Continúa el desarrollo de IQPage. Adjunto el IQPAGE_RESUMEN_MAESTRO_v9.md con todo el contexto.

Quedamos en el paso de activar el portal de cancelación de Stripe. Ya implementamos el endpoint POST /api/create-portal-session en Railway (commit a26072d). 

Lo que falta:
1. Activar el portal en Stripe Dashboard: Settings → Billing → Customer portal → activar y configurar cancelación, cambio de plan y facturas → guardar
2. Agregar botón "Manage Subscription" en el popup de la extensión que llame a ese endpoint

¿Empezamos con el paso 1 en Stripe?
```
