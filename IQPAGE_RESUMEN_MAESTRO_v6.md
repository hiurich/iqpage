# IQPAGE — RESUMEN MAESTRO v6
**Última actualización:** 11 de mayo de 2026  
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
**Versión actual:** v1.0.5 (actualizada con fixes de seguridad)

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

### Planes Anuales (NUEVO — agregados el 10 de mayo)

| Plan | Precio Anual | Descuento | Price ID Stripe |
|---|---|---|---|
| Edu Anual | $51/año ($4.25/mo) | 15% | `price_1TVkGRC3ogU3v09mW6AexSyw` |
| Pro Anual | $115/año ($9.58/mo) | 20% | `price_1TVkKuC3ogU3v09mIAL2Nh0d` |
| Power Anual | $278/año ($23.17/mo) | 20% | `price_1TVkMbC3ogU3v09mmmKxr1LH` |

**⚠️ PENDIENTE:** Crear Payment Links de Stripe para los 3 planes anuales y actualizar index.html con los links correctos. Los CTAs anuales actualmente apuntan a los links mensuales.

### Links de pago Stripe (mensuales — activos):
- Edu: `https://buy.stripe.com/eVqeVcfLx94U0j18W68g000`
- Pro: `https://buy.stripe.com/28E00i2YLgxmd5N5JU8g001`
- Power: `https://buy.stripe.com/cNi6oGbvh5SIaXF5JU8g002`

### Variables de entorno Railway (Stripe):
- `STRIPE_PRICE_EDU` — precio mensual Edu
- `STRIPE_PRICE_PRO` — precio mensual Pro
- `STRIPE_PRICE_POWER` — precio mensual Power
- `STRIPE_PRICE_EDU_ANNUAL` = `price_1TVkGRC3ogU3v09mW6AexSyw`
- `STRIPE_PRICE_PRO_ANNUAL` = `price_1TVkKuC3ogU3v09mIAL2Nh0d`
- `STRIPE_PRICE_POWER_ANNUAL` = `price_1TVkMbC3ogU3v09mmmKxr1LH`

---

## 4. HOTMART

### Productos creados y activos:

| Producto | Precio | Comisión | HotLink de Pago |
|---|---|---|---|
| IQPage Edu | $5/mo | 30% | `https://pay.hotmart.com/T105771125Q` |
| IQPage Pro | $12/mo | 30% | `https://pay.hotmart.com/O105772418F` |
| IQPage Power | $29/mo | 25% | `https://pay.hotmart.com/C105772633L` |
| IQPage Pro Anual | $97 | 35% | `https://pay.hotmart.com/F105772829K` |
| IQPage Power Anual | $249 | 30% | `https://pay.hotmart.com/B105772956J` |

**Estado:** Todos pausados temporalmente hasta resolver método de retiro para Venezuela (Facebank).  
**Acción pendiente:** Contactar soporte Hotmart sobre opciones de retiro para Venezuela. Se redactó email de soporte. Considerar Payoneer como alternativa.

**Nota precios anuales Hotmart vs Stripe:** Los precios anuales en Hotmart ($97 Pro, $249 Power) son distintos a los de Stripe ($115 Pro, $278 Power). Unificar en el futuro.

---

## 5. WEBHOOK HOTMART — IMPLEMENTADO

**Archivo:** `backend/routes/webhook-hotmart.js`  
**Endpoint:** `https://iqpage-production.up.railway.app/api/webhook/hotmart`  
**Variable Railway:** `HOTMART_HOTTOK` — configurada ✅

**Lógica:**
- `PURCHASE_COMPLETE` → actualiza `profiles.plan` en Supabase por email
- Para planes anuales (nombre contiene "Anual") → calcula `subscription_end` = hoy + 365 días
- `PURCHASE_CANCELLED` / `PURCHASE_REFUNDED` → revierte a `free`, limpia `subscription_end`

**Registrado en Hotmart:** Sí, webhook apunta al endpoint correcto con hottok validado.

---

## 6. SEGURIDAD — AUDITORÍA COMPLETADA

### Fixes aplicados el 10 de mayo de 2026:

**CRÍTICO — resuelto:**
- ✅ `ANTHROPIC_API_KEY` rotada (nueva key en Railway)
- ✅ `SUPABASE_SERVICE_ROLE_KEY` rotada (nueva key en Railway)
- ✅ `STRIPE_SECRET_KEY` rotada (nueva key en Railway)
- ✅ `backend/.env` eliminado del historial completo de git (`git filter-repo`)
- ✅ `.gitignore` actualizado para ignorar `.env`

**Fixes de extensión:**
- ✅ JWT migrado de `chrome.storage.local` a `chrome.storage.session`
- ✅ Validación de sender en `background.js` (rechaza mensajes de orígenes no autorizados)
- ✅ Fix XSS en `content.js` — overlay usa `textContent` en lugar de `innerHTML`
- ✅ Fix XSS en `showExpandedNote` — respuesta de IA usaba innerHTML vulnerable
- ✅ `exclude_matches` en `manifest.json` — excluye Chrome Web Store

**Backend — sin issues:**
- ✅ Todas las API keys solo en variables de entorno Railway
- ✅ JWT verificado en cada request via `auth.js`
- ✅ Validación de plan en servidor (nunca en cliente)
- ✅ Stripe webhook valida firma HMAC
- ✅ Hotmart webhook valida hottok
- ✅ CORS restringido por EXTENSION_ID
- ✅ Helmet.js activo con HSTS y CSP

**Documento:** `IQPAGE_AUDITORIA_SEGURIDAD_v2.docx` generado por Claude Code.

**Recomendaciones pendientes (sin urgencia):**
- Rate limiting por `user_id` además de por IP
- Audit log en Supabase
- Rotación periódica de anon key cada 6 meses
- Verificación de RLS en todas las tablas

---

## 7. CHROME WEB STORE

- **Versión actual:** v1.0.5 (bump de versión + fixes de seguridad)
- **Usuarios activos:** 3
- **Reseñas respondidas:** Heidi Aguilar ⭐⭐⭐⭐⭐, Jaime Bolton ⭐⭐⭐⭐

**⚠️ PENDIENTE:** Subir v1.0.5 a Chrome Web Store.
- El zip `iqpage_extension_v1.0.5.zip` fue generado por Claude Code en `/Users/hiurichg/Documents/PageIQ/`
- Ir a `chrome.google.com/webstore/devconsole` → IQPage → Package → Upload new package

---

## 8. LANDING PAGE — CAMBIOS RECIENTES

### Toggle Monthly/Annual (NUEVO — 10 de mayo):
- Toggle agregado en sección `#pricing`
- Muestra precios mensuales por defecto
- Al activar Annual: muestra precio tachado, precio con descuento y nota "billed $X/yr"
- **⚠️ PENDIENTE:** Los CTAs anuales aún apuntan a Payment Links mensuales. Hay que:
  1. Crear 3 Payment Links anuales en Stripe (Edu $51, Pro $115, Power $278)
  2. Actualizar los href en `toggleBilling()` en index.html con los nuevos links

### Bugs pendientes del toggle:
- El layout visual quedó aceptable pero puede mejorarse
- El color `/mo` en tarjeta PRO (fondo violeta) fue corregido
- La alineación de botones fue corregida con `min-height: 90px` en `.plan-price-wrapper`

---

## 9. BACKEND — ARCHIVOS MODIFICADOS

### `backend/middleware/usageCheck.js`
- Pro: 200 resúmenes/mes
- Power: soft cap 700, fair use threshold 600
- Inyecta `req.powerFairUse = true` cuando Power user supera 600 resúmenes

### `backend/utils/modelSelector.js`
- Si `powerFairUse = true` → devuelve Haiku en lugar de Sonnet

### `backend/routes/summarize.js`
- Pasa `req.powerFairUse ?? false` al `selectModel()`

### `backend/routes/stripe.js`
- Agregados 3 nuevos Price IDs anuales en `PRICE_TO_PLAN`

### `backend/routes/webhook-hotmart.js`
- Nuevo archivo — maneja pagos Hotmart
- Subscription_end para planes anuales

### `backend/server.js`
- Registra ruta `/api/webhook/hotmart`

---

## 10. PRODUCT HUNT

- **Fecha:** 14 de mayo 2026 · 12:01 AM PDT (JUEVES)
- **URL:** producthunt.com/products/iqpage
- **Thread publicado:** "We're launching Thursday, would love your brutal feedback before we hit #1"

**Checklist el día del lanzamiento:**
- [ ] Pausar TODAS las campañas de Google Ads
- [ ] Responder cada comentario en las primeras 6 horas
- [ ] Monitorear posición en el ranking cada hora
- [ ] Verificar que IQPage funcione sin errores en Railway

**⚠️ PENDIENTE CRÍTICO:** Video demo de 60 segundos con Loom.
- Mostrar: instalar → abrir CNN → resumir → chatear → detectar sesgo
- El guión no fue completado en esta sesión

---

## 11. DIRECTORIOS SUBMITIDOS

| Directorio | URL | Estado |
|---|---|---|
| SaaSHub | saashub.com/iqpage | ✅ Verificado, pendiente aprobación |
| PeerPush | peerpush.net/p/iqpage | ✅ Listado, cola ~1 mes |
| Viral Bucket | myviralbucket.com | ✅ Listado y activo |
| AlternativeTo | alternativeto.net | ⏳ **Submitir el 15 de mayo** |

**AlternativeTo — recordatorio:** submitir el 15 de mayo.  
Competidores a seleccionar: Perplexity, ChatGPT, Glasp

---

## 12. GOOGLE ADS — ESTRATEGIA

**Estado:** Sin campañas activas. No lanzar hasta después del 14 de mayo.

**Estructura para cuando se lance:**
- Grupo 1 — Summarize ($1/día): `summarize article`, `summarize this article for me`
- Grupo 2 — ChatPDF ($3/día): `chatpdf`, `chatpdf alternative`, `chatpdf free`
- Grupo 3 — Claude/AI Extension ($1/día): `claude ai chrome extension`, `ai chrome extension`

---

## 13. SEO

**Landing pages vivas:**
| URL | Keyword | Estado |
|---|---|---|
| `iqpage.app/ai-summarizer-for-chrome` | ai summarizer chrome extension | ✅ Live |
| `iqpage.app/summarize-any-webpage` | summarize any webpage | ✅ Live |
| `iqpage.app/bias-detection-chrome-extension` | bias detection chrome extension | ✅ Live |
| `iqpage.app/ai-reading-assistant` | ai reading assistant | ✅ Live |
| `iqpage.app/chatpdf-alternative` | chatpdf alternative | ✅ Live |

**Analytics instalados:** GA4, Google Ads, PostHog, Search Console, Ahrefs.

---

## 14. PENDIENTES CRÍTICOS (orden de prioridad)

### 🔴 URGENTE (antes del 14 de mayo — JUEVES)

1. **Payment Links anuales Stripe** — crear 3 links para Edu ($51), Pro ($115), Power ($278) y actualizar index.html en `toggleBilling()`

2. **Video demo Product Hunt** — 60 segundos con Loom
   - Mostrar: instalar → abrir CNN → resumir → chatear → detectar sesgo

3. **Subir v1.0.5 a Chrome Web Store** — zip generado en `/Users/hiurichg/Documents/PageIQ/iqpage_extension_v1.0.5.zip`

### 🟡 POST-LANZAMIENTO (semana del 15 de mayo)

4. **AlternativeTo** — submitir el 15 de mayo

5. **Hotmart — método de retiro** — resolver Payoneer o banco alternativo, luego reactivar los 5 productos

6. **Google Ads** — lanzar campaña inglesa ($5/día) con keywords validadas

7. **Landing pages anuales** — crear `iqpage.app/pro-anual` y `iqpage.app/power-anual`

8. **Unificar precios anuales** Hotmart vs Stripe

### 🟢 MEDIANO PLAZO (mes 1-2)

9. **Blog** — contenido orientado a keywords de problema

10. **Rate limiting por user_id** en backend

11. **Rotación periódica de Supabase anon key**

12. **Verificación de RLS** en todas las tablas de Supabase

13. **Programmatic SEO** — páginas por sitio: `iqpage.app/summarize/reuters`, etc.

14. **Performance Max** — mes 2, con datos de conversión acumulados

---

## 15. METODOLOGÍA DE TRABAJO

### Herramientas usadas en esta sesión:
- **Claude.ai (este chat)** — coordinación general, generación de código, decisiones de producto
- **Claude Code (VS Code)** — edición directa de archivos, commits, auditoría de seguridad
- **GitHub** — repositorio y deploy automático vía Railway
- **Railway** — variables de entorno, deploy automático al hacer push

### Flujo de trabajo establecido:
1. Discutir cambio en Claude.ai
2. Claude genera el código o prompt
3. Pegar prompt en Claude Code (chat, no terminal) para cambios complejos
4. Para cambios simples: editar manualmente en VS Code y hacer commit desde terminal
5. Railway hace deploy automático al detectar push a `main`
6. Verificar en `iqpage.app` que el cambio quedó bien

### Reglas de comunicación:
- Respuestas concisas, sin contexto innecesario
- No explicar lo obvio ni repetir lo que se pidió
- No inventar información — solo datos reales verificables
- **Prohibido inventar datos, precios, códigos de descuento o cualquier información**
- Aplicar "humanizalo" cuando se pida para textos de marketing
- No usar — (usar comas en su lugar en textos de marketing)

---

## 16. ANALYTICS Y TRACKING

| Herramienta | ID/Key | Estado |
|---|---|---|
| Google Tag (Ads) | AW-639818740 | ✅ Instalado |
| Google Analytics GA4 | G-0M3FP8SF3M | ✅ Instalado |
| Google Search Console | iqpage.app | ✅ Verificado |
| Ahrefs | Proyecto "Iqpage" | ✅ Verificado |
| PostHog | phc_yGPVDEMQhr9K8im4LU3BktmuTCoXBs5imJtfUBVtoa5j | ✅ Instalado |

---

## 17. MAILCHIMP

- **Lista:** db938db231
- **Account ID:** dad7159161c2181dc49191bde
- **Estado:** Formulario instalado en homepage

---

## 18. REDDIT — POSTS PUBLICADOS

- `r/buildinpublic` — "From the death of my wife to building apps: this is my short story" ✅
- `r/chrome_extensions` — Post sobre primera reseña en CWS ✅
- `r/buildinpublic` — Respuesta al feedback sobre retención y bias detection ✅

---

## 19. NOTAS IMPORTANTES

- El resumen anterior era v5 — este es v6
- La landing page original (violet/paper theme con Syne + DM Sans) es la aprobada y en producción
- El lanzamiento es el **JUEVES 14 de mayo** a las 12:01 AM PDT
- Nunca inventar información, precios ni datos
- AlternativeTo: submitir el **15 de mayo** sin falta
- Railway tiene 3 días o $4.43 left — verificar saldo y recargar si es necesario
- El repo es público en GitHub (`hiurich/iqpage`) — las keys están seguras en Railway, no en el repo
