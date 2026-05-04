# IQPage — Resumen Maestro del Proyecto
**Última actualización:** 4 de mayo de 2026  
**Versión:** 3.0

---

## 🏗️ STACK TÉCNICO

| Componente | Tecnología | Estado |
|---|---|---|
| Extensión Chrome | Manifest V3, Vanilla JS | ✅ Live en CWS |
| Backend | Node.js + Express | ✅ Railway (producción) |
| Base de datos | Supabase (Postgres + Auth) | ✅ Activo |
| AI | Anthropic Claude API (Haiku/Sonnet) | ✅ Activo |
| Pagos | Stripe (modo Live) | ✅ Configurado |
| Landing | HTML/CSS/JS | ✅ Netlify (iqpage.app) |
| Analytics | PostHog | ✅ Activo |

---

## 🔑 DATOS CRÍTICOS

### IDs y URLs
- **Extension ID producción CWS:** `igbighpdnelefhkbaknocckccpjconln`
- **Extension ID desarrollo:** `lbjcobmanpnccmbfcabcjpdlnonhbnhp`
- **CWS URL:** `https://chromewebstore.google.com/detail/igbighpdnelefhkbaknocckccpjconln`
- **Landing:** `https://iqpage.app`
- **Backend Railway:** `https://iqpage-production.up.railway.app`
- **Repo GitHub:** `https://github.com/hiurich/iqpage`

### Stripe — Payment Links (Live)
- **Edu $5/mes:** `https://buy.stripe.com/eVqeVcfLx94U0j18W68g000`
- **Pro $12/mes:** `https://buy.stripe.com/28E00i2YLgxmd5N5JU8g001`
- **Power $29/mes:** `https://buy.stripe.com/cNi6oGbvh5SIaXF5JU8g002`

### Stripe — Price IDs (Live)
- **Edu:** `price_1TT2zRC3ogU3v09mjpEOYELT`
- **Pro:** `price_1TT34fC3ogU3v09mSAkq2FFl`
- **Power:** `price_1TT36YC3ogU3v09mLH6T0MX0`

### Promo Code
- **Código:** `IQPagePH`
- **Descuento:** 100% — 1 mes gratis
- **Límite:** 100 usos
- **Expiración:** 13 junio 2026
- **⚠️ NOTA:** Este código está declarado en Product Hunt pero el checkout de Stripe via extensión aún no funciona correctamente (ver pendientes)

### Railway Variables (verificadas)
- `STRIPE_SECRET_KEY` = `sk_live_...` ✅
- `STRIPE_PRICE_EDU` = `price_1TT2zRC3ogU3v09mjpEOYELT` ✅
- `STRIPE_PRICE_PRO` = `price_1TT34fC3ogU3v09mSAkq2FFl` ✅
- `STRIPE_PRICE_POWER` = `price_1TT36YC3ogU3v09mLH6T0MX0` ✅
- `EXTENSION_ID` = `igbighpdnelefhkbaknocckccpjconln` ✅
- `FRONTEND_URL` = `https://iqpage.app` ✅
- `STRIPE_WEBHOOK_SECRET` = coincide con webhook de Railway ✅

### PostHog
- **Key:** `phc_yGPVDEMQhr9K8im4LU3BktmuTCoXBs5imJtfUBVtoa5j`
- **Host:** `https://us.i.posthog.com`

### Email
- **Soporte:** `info@iqpage.app` (Microsoft 365, SPF/DKIM/DMARC configurado)

---

## 📦 VERSIONES DE LA EXTENSIÓN

| Versión | Estado | Cambios |
|---|---|---|
| 1.0.0 | ✅ Publicada (primera) | Versión inicial |
| 1.0.1 | ✅ Publicada | Correcciones menores |
| 1.0.2 | ⏳ En revisión CWS | Price IDs de Stripe Live corregidos en popup.js |
| 1.0.3 | 🟡 Lista para subir cuando aprueben 1.0.2 | Botón Upgrade visible en header + fix checkout URL |

**⚠️ IMPORTANTE:** No se puede subir 1.0.3 hasta que CWS apruebe 1.0.2. Cuando aprueben 1.0.2, subir inmediatamente 1.0.3.

---

## ✅ COMPLETADO

### Extensión Chrome
- [x] Manifest V3, Vanilla JS
- [x] Funciones: Summarize, Q&A Chat, Bias Check, Compare, Smart Highlights, Niche Prompts
- [x] Quick Prompts: Legal, Study, Social, Consulting, Science
- [x] Exportación PDF y Word (Pro+), Markdown (Power)
- [x] Google OAuth via chrome.identity
- [x] Side Panel con historial de conversaciones
- [x] Onboarding de 3 pasos con tooltips
- [x] PostHog analytics integrado en popup.js
- [x] Price IDs de Stripe Live en popup.js (v1.0.2)
- [x] Botón "⚡ Upgrade" visible en header del popup (v1.0.3)
- [x] Fix checkout URL handler (v1.0.3)

### Backend (Railway)
- [x] Node.js + Express
- [x] Rutas: /api/summarize, /api/bias, /api/compare, /api/niche, /api/me, /api/create-checkout-session
- [x] Stripe webhook configurado y funcionando
- [x] Variables de entorno actualizadas a modo Live
- [x] FRONTEND_URL corregido (estaba corrupto)
- [x] EXTENSION_ID actualizado al ID de producción

### Stripe
- [x] Cuenta en modo Live
- [x] 3 productos creados: IQPage Edu, Pro, Power
- [x] 3 Payment Links creados y funcionando
- [x] Coupon IQPagePH creado (100% off, 100 usos, expira 13 jun 2026)
- [x] Descriptor de extracto: IQPAGE.APP
- [x] Nombre público: IQPage
- [x] Email soporte: info@iqpage.app
- [x] Webhook activo: https://iqpage-production.up.railway.app/api/stripe/webhook

### Landing (iqpage.app)
- [x] Hero con typewriter animado (5 frases rotativas)
- [x] Sección "See it in action" con 5 pestañas y screenshots reales (autoplay 4.5s)
- [x] Screenshots reales: screenshot_1_summarize.png al screenshot_5_legal.png
- [x] Sección Features con 6 tarjetas (3D tilt effect)
- [x] Sección How it Works con 4 pasos interactivos
- [x] Pricing con 4 planes — botones conectados a Stripe Payment Links ✅
- [x] Testimonials (3 usuarios ficticios — pendiente reemplazar con reales)
- [x] CTA Final
- [x] OG Image (1200x630px) — og_image.jpg en el repo
- [x] Meta tags OG y Twitter completos
- [x] Selector de idioma flotante (EN, ES, PT, DE, ID, JA)
- [x] Cursor personalizado con trail
- [x] PostHog snippet en index.html
- [x] Google Chrome icon usando chrome.png (no base64)
- [x] i18n fix para preservar href en botones de pricing con cambio de idioma

### Product Hunt
- [x] Draft del listing creado
- [x] Nombre, tagline, descripción
- [x] 5 screenshots subidas
- [x] Shoutouts: Claude, Supabase, Railway
- [x] First comment escrito
- [x] Promo code IQPagePH declarado
- [x] Pricing: "Paid with free plan"
- [x] Bootstrapped marcado
- [x] Solo maker marcado
- [x] **Fecha de lanzamiento propuesta: martes 13 de mayo de 2026**
- [x] Introduce Yourself post publicado y aprobado en PH forums

### Marketing — Contenido creado
- [x] 8 carruseles de Instagram (JPG 1080x1080):
  - "What IQPage does" (6 slides)
  - "How it works" (6 slides)
  - "5 reasons" (6 slides)
  - "IQPage for students" (6 slides)
  - "Before/After meme" (6 slides)
  - "Testimonials" (5 slides)
  - Stat post "52 min vs 5 min" (1 imagen)
  - Controversy "Reading every word is a waste" (1 imagen)
- [x] Estrategia Reddit completa (HTML) — 8 subreddits con directrices y posts
- [x] Estrategia Product Hunt v2 (HTML) — 5 foros con posts ajustados a normas Feb 2025
- [x] Post para Threads listo
- [x] Post para r/SideProject listo
- [x] Plantilla de respuesta para comentarios en PH y Reddit

### Gravatar / Identidad
- [x] Gravatar creado con ícono IQ
- [x] Nombre "IQPage" en Microsoft 365

---

## 🔴 PENDIENTES CRÍTICOS

### 1. Mailchimp — Captura de email en landing (EN PROGRESO)
**Qué hay que hacer:**
- Entrar a Mailchimp → Audience → Signup forms → Embedded forms
- Seleccionar formulario tipo "Unstyled"
- Desactivar todos los campos excepto Email
- Copiar el código embed que genera
- Agregar sección de captura de email antes del footer en index.html con este diseño:

```
[Sección oscura con fondo var(--ink)]
"Stay in the loop"
Subtítulo: "Get notified about new features and updates. No spam, ever."
[Input email] [Subscribe button en violeta]
Nota: "Join 500+ readers. Unsubscribe anytime."
```

- Hacer git push del index.html actualizado

### 2. Extensión — Subir v1.0.3 a CWS
**Cuándo:** En cuanto CWS apruebe la v1.0.2 (actualmente en revisión)
**Qué incluye v1.0.3:**
- Botón "⚡ Upgrade" visible en header (no en menú de 3 puntos)
- Fix del checkout URL handler (maneja múltiples formatos de respuesta)
- Los archivos corregidos son popup.html y popup.js (ya generados)

**Comandos para subir:**
```bash
sed -i '' 's/"version": "1.0.2"/"version": "1.0.3"/' ~/Documents/PageIQ/extension/manifest.json
cd ~/Documents/PageIQ && rm -f iqpage_extension.zip
zip -r iqpage_extension.zip extension/ --exclude "*.DS_Store"
```
Luego subir el ZIP en CWS Developer Dashboard → Subir nuevo paquete.

### 3. Probar checkout completo con extensión de producción
**Problema actual:** El checkout via extensión no funciona correctamente porque el JWT de la extensión de desarrollo no coincide con el ID de producción.
**Cómo probar:** Instalar la extensión desde CWS (cuando aprueben 1.0.2/1.0.3), iniciar sesión, pulsar ⚡ Upgrade, verificar que abre Stripe correctamente.

### 4. Git push pendiente
Hay cambios locales sin commitear:
```bash
cd ~/Documents/PageIQ && git add . && git commit -m "v1.0.3 popup files + Stripe payment links in landing" && git push origin main
```

### 5. Product Hunt — Video/Loom
- Grabar demo de 60 segundos del producto en acción
- Subir al listing de PH (campo Video/Loom en Images and media)
- Sin voz está bien — texto en pantalla + música trending

### 6. Landing — Reemplazar testimonios ficticios
Cuando tengas usuarios reales:
- Reemplazar Marco R., Sofia K., Alex T. por testimonios reales
- Agregar screenshots de comentarios de Reddit o reseñas de CWS
- Actualizar el contador "Join thousands" con número real

### 7. Activar Stripe en la extensión (checkout funcional)
El backend responde correctamente pero el flujo completo extensión → Stripe → activación de plan no ha sido probado end-to-end en producción. Verificar después de que CWS apruebe 1.0.3.

---

## 🟡 PENDIENTES IMPORTANTES (pre-lanzamiento PH)

### 8. Product Hunt — Programar fecha de lanzamiento
- Entrar al draft del listing
- Hacer clic en "Schedule launch for later"
- Seleccionar **martes 13 de mayo de 2026**
- Actualizar fecha de expiración del promo code IQPagePH en Stripe a 13 junio 2026

### 9. Landing — Comunicar límites del plan Free
Agregar bajo el precio $0:
```
"Limits reset every Monday. Upgrade anytime."
```
Esto elimina el miedo al límite y aumenta instalaciones del plan gratuito.

### 10. Landing — Sección Trust más honesta
Cambiar "Trusted by readers at Reuters, NYT..." por:
```
"Works on every site you read"
```
Con logos de sitios: Reuters, NYT, BBC, ArXiv, Medium, Wikipedia, GitHub.

### 11. Reddit — Publicar posts (listo para hacerlo ya)
Posts listos para publicar en orden:
1. **r/ChromeExtensions** — [Showcase] post (la extensión ya está live, momento perfecto)
2. **r/SideProject** — Build story con las 3 rechazadas del CWS
3. **r/productivity** — Discusión sobre tiempo de lectura
4. **r/artificial** — Comparación Claude vs GPT vs Gemini para bias detection
5. **r/GetStudying** — Beta testers (semana 3)

**⚠️ Recordatorio:** En r/PhD hay ban permanente. No intentar publicar ahí.

### 12. Instagram — Publicar contenido
8 carruseles y 2 posts estáticos listos. Orden recomendado:
1. Before/After meme (más viral)
2. Stat post "52 min vs 5 min"
3. "What IQPage does"
4. "How it works"
5. Controversy post
6. "5 reasons"
7. Testimonials
8. "IQPage for students"

---

## 🟢 PENDIENTES OPCIONALES (post-lanzamiento)

### 13. Stripe Tax — Cuando escales a Europa
Activar para cumplimiento de IVA europeo cuando tengas usuarios en Europa.

### 14. Social proof real
Cuando tengas 50+ usuarios: actualizar landing con número real de usuarios y países.

### 15. A/B test de pricing
Probar $9/mes vs $12/mes para el plan Pro.

---

## 📋 ESTRUCTURA DEL PROYECTO

```
~/Documents/PageIQ/
├── extension/                    — Chrome Extension MV3
│   ├── manifest.json            — version: 1.0.2 (1.0.3 pendiente)
│   ├── popup.html               — UI del popup (v1.0.3 corregida)
│   ├── popup.js                 — Lógica popup (v1.0.3 corregida)
│   ├── background.js            — Service worker
│   ├── content.js               — Content script
│   ├── sidepanel.html/js        — Panel lateral Q&A
│   ├── styles/                  — CSS separado
│   ├── icons/                   — icon16/32/48/128.png
│   └── lib/                     — jspdf.min.js, marked.min.js
├── backend/                     — Node.js + Express
│   ├── routes/stripe.js         — Checkout + Webhook
│   ├── utils/supabase.js        — Cliente Supabase
│   └── .env                     — Variables locales
├── index.html                   — Landing page
├── privacy.html / terms.html    — Páginas legales
├── og_image.jpg                 — OG Image 1200x630
├── chrome.png                   — Ícono Chrome para landing
├── screenshot_1_summarize.png   — Screenshots reales (5 total)
├── screenshot_2_chat.png
├── screenshot_3_minimenu.png
├── screenshot_4_export.png
├── screenshot_5_legal.png
└── iqpage_extension.zip         — ZIP actual para CWS
```

---

## 💰 PLANES Y PRECIOS

| Plan | Precio | Summaries | Q&A | Features especiales |
|---|---|---|---|---|
| Free | $0 | 3/semana | 5/semana | Highlights, Niche prompts |
| Edu | $5/mes | 80/mes | Ilimitado | Academic mode, Study prompts |
| Pro | $12/mes | 100/mes | 500/mes | Bias detection, PDF/Word export |
| Power | $29/mes | 500/mes | 2000/mes | Compare, Claude Sonnet siempre, MD export |

**Modelo AI:** Haiku (Free/Edu) | Sonnet (Pro automático/Power siempre)

---

## 🗓️ TIMELINE DE LANZAMIENTO

```
Semana 1 (5-11 mayo)
├── Esperar aprobación CWS v1.0.2
├── Subir v1.0.3 cuando aprueben
├── Completar Mailchimp en landing
├── Publicar en r/ChromeExtensions
└── Publicar primeros posts en Instagram

Semana 2 (12 mayo)
├── Publicar en r/SideProject
├── Publicar en r/productivity y r/artificial
├── Programar fecha en PH (13 mayo)
└── Grabar video demo para PH

Martes 13 mayo — LAUNCH DAY
├── 12:01 AM PST — Go live en Product Hunt
├── Publicar Show HN en Hacker News (7 AM EST)
├── Posts en r/ChromeExtensions y r/artificial
└── Responder cada comentario en < 5 minutos durante 24h
```

---

## ⚠️ NOTAS CRÍTICAS PARA CONTINUAR

1. **Chrome icon en landing:** El `src` del `<img class="chrome-img">` se rompe periódicamente. Siempre verificar que sea `src="chrome.png"` y no base64.

2. **i18n y hrefs:** El sistema de traducción reemplaza innerHTML de elementos `<a>`, lo que borraba los hrefs de los botones de pricing. Ya está corregido con `el.textContent` para elementos `<a>`.

3. **Extensión modo desarrollo vs producción:** El JWT de OAuth es específico del Extension ID. La extensión de desarrollo (`lbjcob...`) genera tokens que el backend rechaza porque espera tokens del ID de producción (`igbighp...`). Para probar el flujo completo, siempre usar la extensión del CWS.

4. **PostHog duplicado:** En algún punto el snippet de PostHog apareció dos veces en el HTML. Verificar que solo hay una instancia.

5. **FRONTEND_URL en Railway:** Estaba corrupto con caracteres aleatorios. Ya corregido a `https://iqpage.app`. Si el checkout falla, verificar esta variable primero.

6. **r/PhD ban permanente:** La cuenta fue baneada permanentemente en r/PhD por autopromoción directa. No intentar publicar ahí. Alternativa: r/GetStudying.

7. **PH Forums:** Dos posts rechazados en General Discussion. El post "Introduce Yourself" fue aprobado. Los foros de PH son muy restrictivos — cualquier mención de producto en el cuerpo del post puede resultar en rechazo.

---

## 📁 ARCHIVOS GENERADOS EN ESTE PROYECTO

Todos disponibles en `/mnt/user-data/outputs/`:

| Archivo | Descripción |
|---|---|
| `index.html` | Landing page más reciente |
| `popup.html` | Popup extensión v1.0.3 corregido |
| `popup.js` | JS popup v1.0.3 corregido |
| `og_image.jpg` | OG Image 1200x630 |
| `IQPage_Reddit_Strategy.html` | Estrategia Reddit con 8 subreddits |
| `IQPage_ProductHunt_Strategy_v2.html` | Estrategia PH actualizada normas Feb 2025 |
| `IQPage_PreLaunch_Strategy.html` | Plan completo pre-lanzamiento |
| `students_slide1-6.jpg` | Carrusel "IQPage for students" |
| `beforeafter_slide1-6.jpg` | Carrusel "Before/After" |
| `testimonial_slide1-5.jpg` | Carrusel testimoniales |
| `controversy_post.jpg` | Post estático "Reading every word" |
| `stat_post.jpg` | Post estático "52 min vs 5 min" |
| `how_slide1-6.jpg` | Carrusel "How it works" |
