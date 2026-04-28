# IQPage — Resumen Maestro del Proyecto v2
> Documento de continuidad para retomar el desarrollo en un nuevo chat.
> Metodología: guía paso a paso, capturas de pantalla para verificar cada acción, un paso a la vez.
> Usuario sin conocimientos de programación — explicar todo detalladamente.

---

## 1. Qué es IQPage

Extensión de Chrome con IA (Claude de Anthropic) que permite:
1. Resumen automático de páginas web
2. Chat Q&A sobre el contenido de la página
3. Exportación PDF/Word (plan Pro+)
4. Resaltado inteligente (Explicar, Traducir, Guardar cita, Nota)
5. Prompts de nicho (legal, académico, redes sociales, consultoría, ciencia)
6. Detección de sesgos (plan Pro+)
7. Comparador de artículos hasta 3 tabs con modal de selección (plan Power)
8. Onboarding interactivo de 3 pasos para nuevos usuarios

---

## 2. Planes y precios

| Plan | Precio | Límites | Modelo IA |
|------|--------|---------|-----------|
| Free | $0 | 3 resúmenes/semana, 5 Q&A/semana | Haiku siempre |
| Pro | $12/mes | 100 resúmenes/mes, 500 Q&A/mes | Haiku + Sonnet automático |
| Edu | $5/mes | 80 resúmenes/mes, Q&A ilimitado | Haiku siempre |
| Power | $29/mes | 500 resúmenes/mes, 2000 Q&A/mes | Sonnet siempre |

---

## 3. Stack tecnológico

- **Extensión:** Manifest V3, JavaScript vanilla
- **Backend:** Node.js + Express (carpeta `/backend`)
- **Base de datos:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth + Google OAuth
- **Pagos:** Stripe Checkout (modo TEST actualmente)
- **Hosting backend:** Railway
- **Hosting landing:** Netlify
- **Dominio:** iqpage.app (comprado en GoDaddy)
- **Repositorio:** https://github.com/hiurich/iqpage

---

## 4. Estado actual del proyecto

### ✅ Completado
- Extensión funcionando completamente en Chrome
- Backend desplegado en Railway (online 24/7)
- Supabase configurado con tablas `profiles` e `history`
- Google OAuth funcionando — login probado y verificado
- Chat Q&A, Summarize, Mini menú funcionando
- Exportación PDF y DOC funcionando (plan Pro+)
- Onboarding interactivo de 3 fases funcionando
- Auditoría de seguridad completa (score ~85/100)
- 6 capturas de pantalla 1280x800px para Chrome Web Store (redimensionadas correctamente)
- ZIP de la extensión regenerado con todos los fixes
- **Cuenta de desarrollador Chrome Web Store verificada** ✅
- Términos de Servicio publicados en `iqpage.app/terms`
- Política de privacidad publicada en `iqpage.app/privacy`
- **Landing page funcionando en `https://iqpage.app`** ✅
- **SSL activo con Netlify DNS** ✅
- **Email `info@iqpage.app` funcionando** ✅ (Microsoft 365 via GoDaddy)
- **DKIM activo y verificado** en Microsoft Defender ✅
- **SPF configurado** ✅
- **DMARC configurado** ✅
- Perfil de Product Hunt creado (usuario: Hiurich G.)
- **Bias Check corregido** — parseaba mal el JSON de Claude ✅
- **Compare corregido** — ahora tiene modal de selección de tabs ✅
- **Extensión enviada a Chrome Web Store** (tercera vez) — en revisión ✅

### ⏳ En proceso
- **Chrome Web Store** — extensión en revisión (1-3 semanas)
- **Email a Outlook** — va a spam, esperar 24-48h para que DMARC se propague

### ❌ Pendiente
- **PostHog analytics** — cuenta creada en app.posthog.com, pendiente de instalar el snippet en landing y extensión
- **Stripe en producción** — activar después de aprobación de Chrome Web Store
- **Lanzamiento en Product Hunt** — después de aprobación
- **OG image** — convertir `iqpage_og_1200x630.html` a PNG
- **Actualizar ZIP final** después de cualquier cambio de código

---

## 5. Credenciales y servicios

| Servicio | Notas |
|----------|-------|
| Anthropic API Key | Railway Variables — empieza con `sk-ant-` |
| Supabase URL | `https://vwpdzxhwnztcfvyuhxaz.supabase.co` |
| Railway URL | `https://iqpage-production.up.railway.app` |
| Extension ID (local dev) | `lbjcobmanpnccmbfcabcjpdlnonhbnhp` |
| Extension ID (Chrome Web Store) | `igbighpdnelefhkbaknocckccpjconln` |
| Email soporte | `info@iqpage.app` (Microsoft 365 via GoDaddy) |
| Webmail | https://outlook.cloud.microsoft/mail/ |
| Netlify | `app.netlify.com` — proyecto `iqpage.app` |
| Google Cloud | `console.cloud.google.com` — proyecto `iqpage` |
| PostHog | `app.posthog.com` — cuenta creada, pendiente configurar |

---

## 6. Configuración DNS (Netlify DNS — nameservers p08)

Los nameservers de GoDaddy apuntan a Netlify DNS:
- dns1.p08.nsone.net
- dns2.p08.nsone.net
- dns3.p08.nsone.net
- dns4.p08.nsone.net

### Registros DNS en Netlify:

| Tipo | Nombre | Valor |
|------|--------|-------|
| NETLIFY | iqpage.app | iqpage.netlify.app |
| NETLIFY | www.iqpage.app | iqpage.netlify.app |
| MX | @ | iqpage-app.mail.protection.outlook.com (prioridad 0) |
| TXT | @ | v=spf1 include:secureserver.net include:outlook.com -all |
| TXT | _dmarc | v=DMARC1; p=none; rua=mailto:info@iqpage.app |
| CNAME | selector1._domainkey | selector1-iqpage-app._domainkey.NETORG20643295.y-v1.dkim.mail.microsoft |
| CNAME | selector2._domainkey | selector2-iqpage-app._domainkey.NETORG20643295.y-v1.dkim.mail.microsoft |

---

## 7. Google OAuth — Configuración

- **Proyecto Google Cloud:** IQPage (`console.cloud.google.com/?project=iqpage`)
- **Cliente Web:** `946684141879-3gjnvkjjatv4tte01bta8b13sb5t42bk.apps.googleusercontent.com`
- **Cliente Chrome Extension:** `946684141879-peces0ntjuc55htbmtda5g1pjjvhmn5f.apps.googleusercontent.com`

### URIs de redireccionamiento autorizados en cliente Web:
1. `https://lbjcobmanpnccmbfcabcjpdlnonhbnhp.chromiumapp.org/` — ID local de desarrollo
2. `https://igbighpdnelefhkbaknocckccpjconln.chromiumapp.org/` — ID de Chrome Web Store

### ID en cliente Chrome Extension:
- `igbighpdnelefhkbaknocckccpjconln` (ID de Chrome Web Store)

---

## 8. Correcciones de código realizadas en esta sesión

### popup.js — Bias Check fix
El backend devolvía el análisis con markdown fences (```json). Se agregó limpieza:
```javascript
const a = data?.analysis ?? data ?? {};
if (!a || typeof a !== 'object') {
  showError('Bias analysis returned an unexpected response.');
  return;
}
```

### popup.js — Compare con modal de selección
La función Compare ahora muestra un modal con lista de tabs abiertas donde el usuario selecciona cuáles comparar (mínimo 2, máximo 3). La tab activa aparece pre-seleccionada y marcada como "Current".

### backend/routes/bias.js — JSON parsing fix
Se agregó limpieza de markdown fences antes de parsear el JSON de Claude:
```javascript
const cleaned = rawText
  .replace(/^```json\s*/i, '')
  .replace(/^```\s*/i, '')
  .replace(/```\s*$/i, '')
  .trim();
```

### extension/lib/jspdf.min.js — URL remota eliminada
Se eliminó la referencia a `https://cdnjs.cloudflare.com/ajax/libs/pdfobject/2.1.1/pdfobject.min.js` que causaba rechazo en Chrome Web Store por "código remoto".

---

## 9. Estructura de archivos del proyecto

```
~/Documents/PageIQ/
├── backend/           (Node.js + Express)
│   └── routes/
│       └── bias.js    (corregido)
├── extension/         (Extensión Chrome)
│   ├── icons/
│   ├── lib/           (marked.min.js, jspdf.min.js — sin URLs remotas)
│   ├── styles/
│   ├── background.js
│   ├── content.js
│   ├── manifest.json
│   ├── popup.html     (actualizado con modal de Compare)
│   └── popup.js       (actualizado con modal de Compare y fix de Bias)
├── Capturas de Pantalla/  (6 screenshots 1280x800px para Chrome Web Store)
├── index.html             (landing page)
├── privacy.html           (política de privacidad)
├── terms.html             (términos de servicio)
├── iqpage_extension.zip   (ZIP listo — regenerado con todos los fixes)
├── iqpage_og_1200x630.html
└── supabase_schema.sql
```

---

## 10. Comandos útiles

```bash
# Subir cambios al repositorio (terminal normal de VS Code)
cd ~/Documents/PageIQ && git add . && git commit -m "descripción" && git push origin main

# Regenerar ZIP de la extensión (terminal normal de VS Code)
cd ~/Documents/PageIQ && rm -f iqpage_extension.zip && zip -r iqpage_extension.zip extension/ --exclude "*.DS_Store"

# Redimensionar capturas para Chrome Web Store
cd ~/Documents/PageIQ/Capturas\ de\ Pantalla && for f in *.png; do sips --resampleWidth 1280 "$f" --out "${f%.png}_fixed.png"; done
```

---

## 11. Próximos pasos prioritarios (en orden)

1. **Instalar PostHog en la landing** — agregar snippet en `index.html` y hacer git push
2. **Instalar PostHog en la extensión** — agregar tracking en `popup.js` y `background.js`
3. **Esperar respuesta Chrome Web Store** (1-3 semanas)
4. **Verificar email a Outlook** — después de 48h revisar si DMARC mejoró entrega
5. **Activar Stripe en producción** — después de aprobación Chrome Web Store
6. **Lanzar en Product Hunt** — después de aprobación
7. **Convertir OG image a PNG** — para redes sociales

---

## 12. Historial de rechazos Chrome Web Store y soluciones

### Rechazo 1 — Blue Argon + Red Potassium
- **Blue Argon:** URL remota en `jspdf.min.js` → Eliminada con `sed`
- **Red Potassium:** Error 400 redirect_uri_mismatch → ID de extensión desactualizado en Google Cloud

### Rechazo 2 — Red Potassium
- **Causa:** ID de extensión en cliente Chrome Extension no coincidía
- **Solución:** Actualizado ID en Google Cloud Console + agregado redirect URI en cliente Web

### Rechazo 3 — Pendiente resultado
- Login verificado y funcionando antes de enviar
- URLs actualizadas a `https://iqpage.app`

---

## 13. Problema conocido activo

**Reset de usage manual** — ejecutar en Supabase SQL Editor cuando se agote el límite:
```sql
UPDATE profiles 
SET summaries_used = 0, qa_used = 0, highlights_used = 0
WHERE email = 'hiurich1980@gmail.com';
```

---

## 14. Metodología de trabajo

- **Claude Code en VS Code** — para modificaciones de código
- **Claude.ai** — para planificación, debugging y orientación
- Guiar paso a paso, un paso a la vez
- Usuario sin conocimientos de programación — explicar todo detalladamente
- Especificar siempre si el terminal es de VS Code o de la Mac
- Pedir captura de pantalla para verificar cada acción antes de continuar
- Cuando Claude Code modifica código: `git push` → Railway redespliegue automático → recargar extensión en `chrome://extensions`

---

## 15. Links importantes

| Servicio | URL |
|----------|-----|
| Landing | https://iqpage.app |
| Netlify | https://app.netlify.com/projects/iqpage |
| Netlify DNS | https://app.netlify.com/teams/hiurich1980/dns/iqpage.app |
| Railway | https://railway.app |
| Supabase | https://supabase.com/dashboard/project/vwpdzxhwnztcfvyuhxaz |
| Chrome Web Store Dashboard | https://chrome.google.com/webstore/devconsole |
| Google Cloud | https://console.cloud.google.com/?project=iqpage |
| Microsoft Defender DKIM | https://security.microsoft.com/dkimv2 |
| Exchange Admin | https://admin.cloud.microsoft/exchange |
| PostHog | https://app.posthog.com |
| Webmail | https://outlook.cloud.microsoft/mail/ |
| GitHub | https://github.com/hiurich/iqpage |

---

*Documento actualizado — Sesión 5 de desarrollo de IQPage.*
*Landing en producción. Email configurado con SPF/DKIM/DMARC. Extensión en revisión en Chrome Web Store (3er intento). PostHog pendiente de instalar.*
