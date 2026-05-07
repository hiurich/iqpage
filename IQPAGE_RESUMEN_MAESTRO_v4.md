# IQPage — Resumen Maestro v4
**Última actualización: 6 de mayo de 2026**
**Estado: Pre-lanzamiento — 7 días para Product Hunt**

---

## 1. IDENTIDAD DEL PROYECTO

| Campo | Detalle |
|-------|---------|
| Producto | IQPage — AI reading assistant for Chrome |
| Fundador | Hiurich Granja (`hiurich1980@gmail.com`) |
| País | Venezuela |
| Repo GitHub | https://github.com/hiurich/iqpage |
| Landing | https://iqpage.app (Netlify) |
| Backend | https://iqpage-production.up.railway.app (Railway) |
| Extension ID | `igbighpdnelefhkbaknocckccpjconln` |
| CWS URL | https://chromewebstore.google.com/detail/igbighpdnelefhkbaknocckccpjconln |
| Product Hunt | https://www.producthunt.com/products/iqpage?launch=iqpage |
| Email | info@iqpage.app |

---

## 2. STACK TÉCNICO COMPLETO

| Capa | Tecnología |
|------|-----------|
| Extensión | Chrome Extension MV3 (JavaScript) |
| Backend | Node.js + Express en Railway |
| Base de datos | Supabase (PostgreSQL) |
| Pagos | Stripe (Live) |
| Landing | HTML/CSS/JS estático en Netlify |
| IA | Anthropic Claude API (claude-haiku para producción) |
| Analytics | PostHog (`phc_yGPVDEMQhr9K8im4LU3BktmuTCoXBs5imJtfUBVtoa5j`) |
| Newsletter | Mailchimp (audience: IQPage Newsletter) |
| Dominio | iqpage.app |
| Repo local | `~/Documents/PageIQ` |

---

## 3. PLANES Y PRECIOS

| Plan | Precio | Stripe Payment Link | Límites |
|------|--------|--------------------|---------| 
| Free | $0/mes | CWS directo | 3 summaries/semana · 5 Q&A/semana |
| Edu | $5/mes | `https://buy.stripe.com/eVqeVcfLx94U0j18W68g000` | 80 summaries/mes · Unlimited Q&A |
| Pro ⭐ | $12/mes | `https://buy.stripe.com/28E00i2YLgxmd5N5JU8g001` | 100 summaries · 500 Q&A · Bias · PDF/Word |
| Power | $29/mes | `https://buy.stripe.com/cNi6oGbvh5SIaXF5JU8g002` | 500 summaries · 2000 Q&A · Article comparison |

**Nota importante:** Los límites del plan Free se resetean cada lunes. El plan Free usa Claude Haiku con costo estimado de ~$0.001/usuario/semana.

---

## 4. FUNCIONALIDADES DE LA EXTENSIÓN

### Disponibles en producción (v1.0.4)
- **Instant Summaries** — Resume cualquier página en <10 segundos (Free)
- **Chat Q&A** — Pregunta lo que quieras sobre el contenido de la página (Free)
- **Smart Highlights** — Mini menú contextual: Explain · Translate · Save · Note (Free)
- **Citations Tab** — Guarda citas con metadata de la fuente (Free)
- **Bias Detection** — Detecta sesgos y lenguaje cargado (Pro)
- **Niche Prompts** — Legal, Academic, Social, Consulting, Science (Free)
- **PDF & Word Export** — Exporta resúmenes como documentos (Pro)
- **Article Comparison** — Compara hasta 3 fuentes sobre el mismo tema (Power)
- **Active Reading Mode** — Modo lectura activa (Edu+)
- **Study Prompts** — Prompts para estudio académico (Edu+)
- **Botón ⚡ Upgrade** en el header del popup (v1.0.4)

### Pendiente de desarrollar
- Selector de planes en el popup (actualmente va directo a Pro $12)
- Integración webhook Hotmart para activar planes automáticamente

---

## 5. LANDING PAGE (iqpage.app)

### Archivo principal
- **Ubicación local:** `~/Documents/PageIQ/index.html`
- **Deploy:** Automático via Netlify al hacer `git push origin main`

### Secciones de la landing (en orden)
1. **Nav** — Logo IQPage + "Get Started Free →" (link a CWS)
2. **Hero** — Badge Chrome + Badge PH lanzamiento 13 mayo + H1 + mockup interactivo
3. **Trust** — "Trusted by readers at Reuters, NYT, ArXiv, Medium, Wikipedia, GitHub"
4. **Features** — 6 tarjetas de funcionalidades con tilt 3D
5. **Showcase** — 5 tabs con screenshots reales de la extensión
6. **How it works** — 4 pasos animados
7. **Pricing** — 4 planes con cards interactivas
8. **Testimonials** — 3 testimonios (ficticios — pendiente reemplazar con reales)
9. **Newsletter** — Formulario Mailchimp integrado
10. **CTA Final** — "Add to Chrome — Free →"
11. **Footer** — Privacy · Terms · Email (sin badge PH, está en el hero)

### Mailchimp
- **Action URL:** `https://gmail.us10.list-manage.com/subscribe/post?u=dad7159161c2181dc49191bde&id=db938db231&f_id=008e4fe4f0`
- **Honeypot field:** `b_dad7159161c2181dc49191bde_db938db231`
- **Audience:** IQPage Newsletter
- **Email de bienvenida:** Diseñado (HTML generado) pero NO activado (requiere plan de pago)

### Product Hunt badge en Hero
- Badge rojo con logo PH + "Launching on Product Hunt · May 13th → "
- Link: `https://www.producthunt.com/products/iqpage?embed=true&utm_source=badge-featured`
- Imagen oficial PH: `https://api.producthog.com/widgets/embed-image/v1/featured.svg?post_id=1136904&theme=light`

### i18n (internacionalización)
- 6 idiomas: English 🇺🇸 · Español 🇪🇸 · Português 🇧🇷 · Deutsch 🇩🇪 · Bahasa Indonesia 🇮🇩 · 日本語 🇯🇵
- Botón flotante 🌐 en esquina inferior derecha
- Implementado con objeto `i18n` en JavaScript puro (sin librerías)

### Notas críticas de la landing
- `chrome.png` debe estar trackeado en git (`git add chrome.png`)
- PostHog: una sola instancia del snippet (no duplicar)
- Para editar textos con i18n usar `el.textContent` para `<a>` — nunca `innerHTML` en botones con href
- Netlify: agrupar cambios en UN SOLO push para conservar créditos de build (300/mes en plan gratuito — ya pagaron $9 para restaurar, ciclo reinicia 22 mayo)

---

## 6. INFRAESTRUCTURA Y SERVICIOS

### Railway (Backend)
- URL: `https://iqpage-production.up.railway.app`
- Variable crítica: `FRONTEND_URL=https://iqpage.app`
- Plan: Personal ($9/mes — pagado, activo)
- Ciclo de facturación: 23 abril → 22 mayo
- **Si el checkout falla:** verificar que `FRONTEND_URL` sea `https://iqpage.app`

### Netlify (Landing)
- Team: `hiurich1980's team`
- Proyecto: `iqpage.app` (el otro proyecto `getlaunchpad` está pausado — eliminar para liberar créditos)
- Plan: Starter pagado ($9/mes — pagado esta sesión para restaurar)
- **Regla de oro:** máximo 1 push por sesión de trabajo — agrupar todos los cambios

### Supabase
- Base de datos PostgreSQL para usuarios y planes

### Stripe
- Modo: Live (producción)
- Checkout funciona end-to-end verificado

### Chrome Web Store
- Versión publicada: **v1.0.4** ✅
- Estado: Live y aprobada

---

## 7. PRODUCT HUNT — LANZAMIENTO 13 MAYO

### Datos del listing
- **URL:** `https://www.producthunt.com/products/iqpage?launch=iqpage`
- **Fecha:** Martes 13 de mayo de 2026 a las **12:01 AM PDT**
- **Maker invite link:** `https://www.producthunt.com/posts/iqpage/maker-invite?code=wN1gzM`
- **Foro:** `p/iqpage`
- **Followers actuales:** 1

### Configuración completada ✅
- Shoutouts configurados
- First Comment preparado (en inglés, listo para copiar)
- Countdown activo en prelaunch page
- Badge PH embed en hero de la landing

### First Comment listo (copiar al instante al lanzar)
```
Hi Product Hunt! 👋

I'm Hiurich, solo maker behind IQPage.

I built this because I was spending 2+ hours a day reading articles and retaining almost nothing. So I built the reading assistant I always wanted.

IQPage lets you:
⚡ Summarize any webpage in seconds
💬 Chat with the content — ask anything
⚖️ Detect bias and loaded language
✨ Highlight, translate, save & annotate
📄 Export to PDF or Word

Built entirely on Claude AI (Anthropic). Free forever plan — no credit card required.

I'll be here all day answering every question. What would you use IQPage for? 🙏
```

### Reglas críticas de Product Hunt
- **NUNCA pedir votos directamente** — PH penaliza el vote brigading
- Usar: "me encantaría escuchar tu opinión" / "estaré respondiendo preguntas todo el día"
- Responder CADA comentario en menos de 5 minutos durante las primeras 12 horas
- Mantener actividad sostenida de 12:01 AM a 11:59 PM PDT

### Cronograma pre-lanzamiento
| Día | Acción | Canal |
|-----|--------|-------|
| 5 mayo (hoy) | Compartir link prelanzamiento personal | WhatsApp + LinkedIn |
| 6 mayo | Post historia de construcción | LinkedIn |
| 7 mayo | Tweet fecha + link | Twitter/X |
| 8 mayo | Story countdown | Instagram |
| 9 mayo | Post showcase | r/ChromeExtensions |
| 10 mayo | Build story | r/SideProject |
| 11 mayo | Post carrusel | Facebook |
| 12 mayo | Recordatorio "mañana" | Todas las redes |
| **13 mayo 12:01 AM** | **LANZAMIENTO** | **Product Hunt** |

### Threads PH Forum (publicar esta semana)
1. "Why I built IQPage — and why it took 8 months" → 5 mayo
2. "What would you use IQPage for? Looking for honest feedback before launch" → 8 mayo
3. "Two days to launch — AMA about building IQPage solo" → 11 mayo

---

## 8. REDES SOCIALES Y MARKETING

### Cuentas activas
- **Instagram:** @iqpage (en creación — ícono 180x180px generado)
- **Facebook:** Página IQPage (en creación)
- **Twitter/X:** (usar cuenta personal de Hiurich)
- **LinkedIn:** (usar perfil personal de Hiurich)

### Activos gráficos generados (en /outputs)
- `iqpage_instagram_icon.png` — 180x180px para Instagram
- `iqpage_banner_v1.jpg` — Banner Facebook 820x312px (oscuro con blobs)
- `iqpage_banner_v2.jpg` — Banner Facebook 820x312px (split diagonal)
- `iqpage_banner_v3.jpg` — Banner Facebook 820x312px (crema/editorial)
- `iqpage_fb_slide1.jpg` → `slide5.jpg` — Carrusel Facebook (5 slides JPG)

### Copy para Instagram BIO
```
⚡ AI reading assistant for Chrome
📄 Summarize any webpage in seconds
💬 Chat · Bias detection · Highlights
🆓 Free forever plan
👇 Try it now
iqpage.app
```

### Copy para post de presentación personal (Reddit/PH/LinkedIn)
Historia de Hiurich: De la muerte de su esposa en julio 2024 → reinvención → 8 meses desarrollando IQPage → 3 rechazos CWS → finalmente live → lanzamiento 13 mayo.

**Regla de Reddit:** `r/PhD` está **BANEADO PERMANENTEMENTE** — no publicar ahí nunca.

### Subreddits objetivo
- r/ChromeExtensions — [Showcase] IQPage
- r/SideProject — Build story personal
- r/productivity — Discusión sobre tiempo leyendo
- r/artificial — Claude vs GPT para bias detection
- r/GetStudying — Para público académico (alternativa a r/PhD)

---

## 9. ESTRATEGIA HOTMART (CANAL LATAM)

### Objetivo
Vender IQPage en Hotmart como canal adicional para mercado latinoamericano, aprovechando el ecosistema de afiliados y métodos de pago locales (Pix, PSE, OXXO, transferencias).

### Productos a crear en Hotmart
| Producto | Precio | Comisión afiliado |
|----------|--------|------------------|
| IQPage Edu Mensual | $5/mes | 30% |
| IQPage Pro Mensual | $12/mes | 30% |
| IQPage Power Mensual | $29/mes | 25% |
| IQPage Pro Anual | $97/año | 35% |
| IQPage Power Anual | $249/año | 30% |

### Integración técnica pendiente
Crear endpoint en backend Node.js para recibir webhooks de Hotmart:

```
POST /api/webhook/hotmart
Header: x-hotmart-hottok: [tu hottok secreto]

Eventos a manejar:
- PURCHASE_COMPLETE → activar plan
- PURCHASE_CANCELLED → revertir a free
- PURCHASE_REFUNDED → revertir a free
```

Variable de entorno a agregar: `HOTMART_HOTTOK=tu_hottok_secreto`

### Flujo completo
```
Usuario LATAM ve IQPage →
Va a Hotmart → Paga en moneda local →
Hotmart envía webhook a Railway →
Backend activa plan en Supabase →
Usuario accede con su email
```

---

## 10. GOOGLE ADS (CAMPAÑA PENDIENTE)

### Estructura de campañas
1. **Campaign 1 — Search English** (4 Ad Groups)
   - AI Summarizer
   - Chrome Extension AI
   - Bias Detection
   - Research & Study Tools

2. **Campaign 2 — Search Spanish** (2 Ad Groups)
   - Resumidor con IA
   - Herramientas IA para estudiantes

3. **Campaign 3 — Performance Max** (después de 30 días de data)

### Presupuesto recomendado
- Inicio: $5-10/día solo en inglés
- Mes 1: $150-300 total
- Mes 3: $300-600 total
- 70% mercados inglés / 30% LATAM español

### Mercados prioritarios
**Inglés:** USA · UK · Canada · Australia · Ireland
**Español:** México · Argentina · Colombia · España · Chile

### Acción crítica antes de lanzar
Instalar Google Tag (gtag.js) en `index.html` para tracking de conversiones. Sin esto Google no puede optimizar.

### Nota importante
**El 13 de mayo PAUSAR todos los ads.** El tráfico de Product Hunt no convierte en paid y inflará CPCs. Reanudar el 14 de mayo.

---

## 11. DOCUMENTOS GENERADOS EN ESTA SESIÓN

| Documento | Descripción |
|-----------|-------------|
| `IQPage_Facebook_Carrusel.pptx` | Carrusel 5 slides para Facebook |
| `iqpage_fb_slide1-5.jpg` | Los 5 slides como JPG listos para subir |
| `iqpage_banner_v1/v2/v3.jpg` | 3 variantes de banner Facebook 820x312px |
| `iqpage_instagram_icon.png` | Ícono 180x180px para Instagram |
| `IQPage_Launch_Strategy.docx` | Estrategia completa lanzamiento Product Hunt |
| `IQPage_Hotmart_Strategy.docx` | Estrategia Hotmart + código webhook |
| `IQPage_Google_Ads_Campaign.docx` | Playbook completo Google Ads |

---

## 12. PENDIENTES COMPLETOS (ORDEN DE PRIORIDAD)

### 🔴 URGENTES (esta semana antes del 13 mayo)

- [ ] **Compartir link de prelanzamiento PH** por WhatsApp con contactos cercanos HOY
- [ ] **Publicar en LinkedIn** la historia de construcción del producto
- [ ] **Tweet** con fecha de lanzamiento y link prelanzamiento
- [ ] **Story de Instagram** con countdown al 13 mayo
- [ ] **Publicar Thread 1 en PH Forum** — "Why I built IQPage"
- [ ] **Eliminar proyecto getlaunchpad** en Netlify (libera créditos)
- [ ] **Subir banner** a página de Facebook
- [ ] **Subir carrusel** de 5 slides a Facebook
- [ ] **Completar perfil de Instagram** con bio y ícono

### 🟡 PRE-LANZAMIENTO (9-12 mayo)

- [ ] **Video/Loom demo 60 segundos** para Product Hunt (lo hace Hiurich)
- [ ] **Publicar en r/ChromeExtensions** el viernes 9 mayo
- [ ] **Publicar en r/SideProject** el sábado 10 mayo
- [ ] **Post Facebook con carrusel** el domingo 11 mayo
- [ ] **Thread 2 en PH Forum** el 8 mayo
- [ ] **Thread 3 AMA en PH Forum** el 11 mayo
- [ ] **Recordatorio final** el 12 mayo en todas las redes
- [ ] **Instalar Google Tag** en index.html para tracking

### 🟢 POST-LANZAMIENTO (después del 13 mayo)

- [ ] **Selector de planes** en popup de extensión (actualmente va directo a Pro)
- [ ] **Reemplazar testimonios ficticios** con reviews reales de usuarios
- [ ] **Crear cuenta de productor en Hotmart** y subir productos
- [ ] **Desarrollar webhook Hotmart** en backend Node.js
- [ ] **Lanzar Google Ads** — Campaign 1 Search English ($5/día)
- [ ] **Stripe Tax** para cumplimiento fiscal Europa
- [ ] **A/B test pricing** Pro $9 vs $12
- [ ] **Email de bienvenida Mailchimp** — requiere plan de pago para automatización
- [ ] **Sección Trust landing** — cambiar "Trusted by Reuters..." por "Works on every site you read"

---

## 13. METODOLOGÍA DE TRABAJO PARA CONTINUAR EN OTRO CHAT

### Cómo empezar una nueva sesión
1. **Subir este archivo** (`IQPAGE_RESUMEN_MAESTRO_v4.md`) al nuevo chat como primer mensaje
2. Decir: "Continúa el desarrollo de IQPage. Aquí está el resumen maestro con todo el contexto"
3. El asistente tendrá todo el contexto necesario para continuar sin repetir trabajo

### Reglas de trabajo establecidas
- **Git push:** Siempre agrupar todos los cambios en UN SOLO commit/push por sesión. Nunca pushear cambios individuales pequeños (conserva créditos Netlify)
- **Formato de commit:** `git add . && git commit -m "descripción clara" && git push origin main`
- **Netlify:** Si aparece "exceeded credit limit", es por demasiados builds — esperar al 22 de mayo o pagar $9 para restaurar
- **Railway:** Si el backend falla, verificar `FRONTEND_URL=https://iqpage.app` en las variables de entorno
- **Archivos para el usuario:** Siempre entregar código completo listo para copiar/pegar — el usuario NO es desarrollador, no sabe editar XML ni navegar código

### Comandos frecuentes
```bash
# Ver estado del repo
cd ~/Documents/PageIQ && git status

# Push agrupado (SIEMPRE así)
cd ~/Documents/PageIQ && git add . && git commit -m "descripción" && git push origin main

# Ver versión actual de la extensión
cat ~/Documents/PageIQ/manifest.json | grep version
```

### Archivos críticos
| Archivo | Ubicación | Descripción |
|---------|-----------|-------------|
| Landing | `~/Documents/PageIQ/index.html` | Página principal completa |
| Extensión | `~/Documents/PageIQ/` | Código fuente completo |
| Backend | Railway (remoto) | Node.js + Express |
| Manifest | `~/Documents/PageIQ/manifest.json` | Versión actual: 1.0.4 |

### Datos que NO cambiar sin pensar
- Extension ID: `igbighpdnelefhkbaknocckccpjconln`
- PostHog key: `phc_yGPVDEMQhr9K8im4LU3BktmuTCoXBs5imJtfUBVtoa5j`
- Mailchimp honeypot: `b_dad7159161c2181dc49191bde_db938db231`
- Stripe links (ya están en producción y funcionando)

---

## 14. CONTEXTO PERSONAL DEL PROYECTO

Hiurich Granja, 45 años, venezolano. En 2023 su esposa fue diagnosticada con cáncer agresivo. La acompañó 24/7 hasta su muerte en julio 2024. Quedó sin trabajo, sin ingresos y en Venezuela. Comenzó a desarrollar IQPage sin experiencia previa en desarrollo de software. 8 meses de desarrollo, 3 rechazos del Chrome Web Store. Finalmente live. Lanzamiento en Product Hunt el 13 de mayo de 2026.

Esta historia es el corazón del marketing personal — auténtica, humana y poderosa. Úsarla con honestidad en LinkedIn, Reddit y Product Hunt.

---

*Generado: 6 de mayo de 2026 | IQPage v1.0.4 | 7 días para el lanzamiento*
