# Aurum Experiencia — Cuestionario de Arquitectura de Autor

Cuestionario de captación de Aurum Arquitectos para proyectos en Hermosillo. Presenta la promesa y los entregables antes de iniciar y ofrece acceso directo a una sesión de claridad. El recorrido tiene seis pasos: estilo, sensaciones, actividades, espacios indispensables, terreno y fecha de inicio, y lectura inicial con contacto.

La lectura espacial aparece antes de pedir nombre y WhatsApp (o correo). Después del contacto muestra el perfil completo, el rango preliminar de superficie del catálogo oficial, espacios, prioridades y una recomendación inicial, con acceso a la agenda. La inversión sigue calculándose para el CRM; no se publica un precio en pantalla.

**Todo el texto, el logo y el link de agenda se editan desde Google Sheets** (pestaña `TEXTOS WEB` del CRM - YOD), sin tocar el código. La web los carga al abrir y cae a un respaldo embebido si el Sheet no responde.

Los textos de la experiencia de seis pasos usan claves `q6_` en esa misma pestaña. Las claves anteriores permanecen disponibles para los procesos existentes. El nuevo flujo no depende de sus títulos ni de su contador de ocho pasos. Los ajustes de amplitud, niveles, vehículos y carácter son opcionales en el paso de espacios; no añaden pantallas.

El lead conserva el payload y el cálculo existentes y añade `version_cuestionario`, `perfil_espacial`, `terreno_estado` e `inicio_proyecto`. La situación del terreno, el plazo y el nombre del perfil también viajan en `proyecto`, que el CRM ya almacena. No se modifica la automatización de seguimiento ni se envían mensajes al probar el sitio.

Meta recibe `PasoEmbudo` con el paso actual y `flujo: perfil_6`. El POST de actividad conserva las etapas terminales del esquema anterior (7 = contacto, 8 = resultado) y añade el paso del nuevo cuestionario. La agenda directa dispara `Schedule` con `origen: directo` y `SesionDirecta`, sin generar un lead ficticio. `Schedule` mide el clic de agenda, no una reserva confirmada.

- **App:** `index.html` (estático, sin dependencias — listo para GitHub Pages)
- **Contexto completo para retomar el trabajo:** `CLAUDE.md`
- **Catálogo oficial:** `data/aurum-catalogo.json`
- **Textos editables:** pestaña `TEXTOS WEB` (se crea con `sembrarTextos_()` en el Apps Script)
- **Molde del brief:** `templates/brief-template.html`

## Verificación

`tests/cuestionario.cjs` recorre el formulario en Chromium móvil y escritorio, verifica la recompensa previa al contacto, los perfiles, validación, persistencia sin datos de contacto, payload del CRM, UTM y acceso directo a la agenda. Intercepta todas las conexiones externas: no crea leads ni reservas reales.

Con Playwright instalado, ejecuta `node tests/cuestionario.cjs`. `AURUM_BROWSER_PATH` permite usar un Chromium disponible y `AURUM_SCREENSHOTS_DIR` guarda capturas de la portada, lectura y resultado. La app sigue siendo un HTML estático sin proceso de compilación.

## Deploy rápido
Settings → Pages → Deploy from branch → `main` → raíz. La app queda en `https://<usuario>.github.io/<repo>/`.
