# Estudio de Métricas

**Aplicación:** https://estudio-de-metricas.vercel.app

Herramienta personal de Melany Brito para calcular engagement de Instagram, TikTok y LinkedIn, gestionar clientes y preparar reportes verificables.

## Qué incluye

- Capturas de Instagram: OCR local, revisión editable y aplicación de métricas sin enviar imágenes a servidores.
- Informes visuales con desglose de interacciones, lectura explicable, guía de seguimiento y modo descriptivo si faltan datos.
- Nueve métodos sociales con fórmula visible, metas opcionales y datos faltantes diferenciados de cero.
- Clientes, varias cuentas por cliente, campañas, archivo y edición.
- Historial persistente, filtros por cliente/red/cuenta/fechas y comparaciones de contextos compatibles.
- CSV propio con vista previa, validación y omisión de duplicados.
- Reportes PDF, texto copiable, CSV y versiones inmutables de reportes.
- Respaldos JSON con checksum SHA-256 y restauración validada.
- Calculadoras de conversión, CTR, CPC, CPM, CPL, CAC, ROAS, ROI y dos estimaciones de CLV.
- Diseño responsive en español, teclado, foco visible y tipografías alojadas localmente.

## Empezar a usar

1. En **Clientes**, crea una marca o persona y añade sus cuentas.
2. En **Calculadora**, elige red, cuenta y método. Escribe un título, fechas y métricas.
3. Guarda el análisis. Los campos desconocidos pueden quedar vacíos y aparecerán como incompletos.
4. En **Resumen**, consulta el historial o compara registros compatibles.
5. En **Reportes**, filtra un cliente y revisa el contenido antes de descargar el PDF.
6. En **Configuración**, descarga periódicamente un respaldo completo.

La calculadora rápida permite calcular, copiar y **descargar un informe PDF** sin crear un cliente. Completa las métricas, revisa las fechas y pulsa **Descargar informe PDF** junto al resultado. Puedes indicar el cliente o marca, una meta y observaciones. La descarga captura los datos actuales del formulario; no guarda un análisis en el historial. Para conservarlo en el historial, selecciona una cuenta y guarda.

## De una captura de Instagram a un informe

1. En **Calculadora → Instagram**, abre **Empieza con una captura de Instagram**.
2. Selecciona un PNG, JPG o WebP (hasta 12 MB / 24 megapíxeles). El motor lee etiquetas en español e inglés dentro del navegador.
3. Revisa los valores propuestos contra la imagen. Corrige los errores; los campos ausentes no se convierten en cero. Los valores abreviados se señalan como aproximaciones.
4. Indica el período real, si es una publicación o un resumen de cuenta, y si los datos son orgánicos, pagados o mixtos. Confirma la revisión y aplica. Se reemplazan las métricas/contexto del formulario; la cuenta elegida se conserva y debe corresponder a la captura.
5. Completa cliente, título y notas. Descarga el PDF con **Incluir gráficos y guía para gestionar la cuenta** activado, o desactívalo para un informe breve.

La descarga admite informes descriptivos con métricas parciales: la tasa se muestra como **No calculable** cuando no se puede obtener. No deduce likes a partir de interacciones totales ni intercambia vistas por alcance. Los consejos son reglas transparentes para formular experimentos, no diagnósticos causales ni benchmarks inventados.

**Límites:** una imagen por análisis; etiquetas legibles, no iconos sin texto; las fechas se confirman manualmente. Una captura recortada, borrosa o con varias columnas puede requerir correcciones. Se probaron muestras sintéticas claras y oscuras; conviene validar el formato específico de tus capturas reales. No importa automáticamente Stories/Ads Manager ni todas las variantes de Insights. La imagen y el texto OCR no se guardan en la base de datos; solo las métricas revisadas se conservan si guardas el análisis.

El OCR usa [Tesseract.js](https://github.com/naptha/tesseract.js) con motor/modelos servidos desde la misma aplicación. No requiere API, credenciales ni pago por lectura. La primera lectura descarga los recursos; el reconocimiento funciona en un worker para no bloquear la interfaz. `prebuild` y `predev` preparan `public/ocr/` desde dependencias fijadas por el lockfile; esos archivos generados no se guardan en Git.

## Datos y privacidad

Los datos se almacenan en **IndexedDB dentro del navegador**. No existe una base de datos en servidor, login, acceso compartido ni sincronización automática. Abrir la aplicación en otro navegador, dominio o dispositivo crea un espacio distinto. Usa los respaldos para trasladar tu historial. Borrar los datos del navegador lo elimina si no hay respaldo.

Los archivos exportados contienen los datos seleccionados: consérvalos de forma privada. El checksum detecta alteraciones accidentales; no es cifrado ni una firma de autenticidad. La URL pública sirve la aplicación, no los datos de los clientes. No hay claves ni credenciales que configurar.

## Desarrollo

Requiere Node.js 22 o posterior y npm. Se verificó con Node.js 24.

```sh
npm ci
npm run dev
```

La app abre en `http://localhost:3001`. No requiere variables de entorno.

```sh
npm run typecheck
npm test
npm run build
```

Next.js produce una exportación estática en `out/`. Para revisarla localmente:

```sh
python3 -m http.server 3002 --directory out
```

`next start` no se usa con exportaciones estáticas. El despliegue en Vercel se construye desde el código fuente con `npm run build`.

## Estructura

- `src/domain`: modelos, fórmulas puras, validación e importación CSV.
- `src/lib`: persistencia, respaldos y exportaciones.
- `src/components`: flujos de clientes, calculadora, reportes y espacio principal.
- `src/app`: entrada de Next.js, metadatos y sistema visual.
- `tests`: casos numéricos y reglas de integridad.
- `docs`: decisiones, diccionario y evidencia de validación.
- `PLAN_ESTRATEGICO.md`: visión y etapas del producto; consultar `docs/ENTREGA.md` para el alcance construido.

## Límites de esta entrega

No importa exportaciones nativas XLS/XLSX sin adaptar ni conecta automáticamente las redes. Usa la plantilla CSV propia. No suma alcance como audiencia única ni presenta una tasa global de redes. El método por seguidores funciona por publicación, no como suma indiscriminada de un mes.

Las calculadoras de negocio son independientes; permiten descargar su propio PDF con los datos, fórmula y contexto, o copiar sus resultados a las observaciones de otro reporte. No hay embudo atribuido automático ni simulador guardado. Logo, colores de marca por cliente, etiquetas libres, importadores nativos y sincronización quedan como evolución documentada. El piloto con datos reales de clientes todavía debe realizarlo Melany.

## Tipografías

DM Sans y Manrope, distribuidas bajo SIL Open Font License. Las licencias están en `public/fonts/`.
