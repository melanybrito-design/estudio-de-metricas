# Validación de la entrega

Fecha: 26/09/2026. Datos utilizados: cliente ficticio QA y ejemplos didácticos; ningún cliente real.

## Verificación automatizada

- TypeScript sin errores.
- 18 pruebas del dominio aprobadas: fórmulas, campos ausentes, ceros, límites numéricos, tasas superiores a 100 %, ponderación, duplicados, incompatibilidad, CLV/ROI/CAC, porcentajes relativos, CSV y validación de respaldos.
- Build estático de producción correcto.
- Auditoría de dependencias de producción: 0 vulnerabilidades en la comprobación de esta fecha.

## Recorridos en navegador

- Crear cliente y cuentas Instagram/TikTok/LinkedIn; registrar campaña.
- Instagram: 320 interacciones / 8.000 de alcance = 4,00 %, meta personal 5 %.
- TikTok: 300 / 8.000 visualizaciones = 3,75 %. Con denominador cero, resultado no calculable.
- LinkedIn página: 400 / 10.000 impresiones = 4,00 % incluyendo clics.
- Guardar los tres análisis, navegar y recargar: los datos permanecen.
- Crear versión de reporte; descargar PDF de dos páginas y CSV.
- Revisar PDF renderizado: texto legible, fórmulas y fuentes presentes, registros agrupados después de ajustar paginación.
- Descargar plantilla CSV, revisar vista previa, importar, volver a cargarla: duplicado omitido y botón de importar cero registros deshabilitado.
- Descargar respaldo, verificar checksum y estructura, restaurar: recuperación de tres análisis y un reporte.
- Vistas de 320, 390, 768 y 1440 px sin desbordamiento horizontal del documento tras corregir el contenedor de tabla.
- Abrir navegación móvil y entrar a calculadora correctamente.
- Navegación por teclado, etiquetas de formularios, foco visible y diálogo modal nativo. La revisión no equivale a una certificación integral WCAG.

Las capturas y archivos de prueba se conservan localmente en `output/playwright/`, ignorados por Git y Vercel.

## Limitaciones de la validación

No se ha hecho un piloto con métricas reales ni se ha medido reducción de tiempo frente a la rutina de Melany. No se promete compatibilidad con archivos nativos de las plataformas. La disponibilidad real de métricas depende de la cuenta y el formato.

## Publicación

Vercel: https://estudio-de-metricas.vercel.app. Despliegue de producción en estado READY y URL abierta en navegador con interfaz cargada. La aplicación pública comienza vacía en un origen nuevo.

## Mejora: PDF directo desde la calculadora (26 de septiembre de 2026)

- 22 pruebas de dominio aprobadas, incluida creación de un reporte sin cliente guardado, copia independiente del formulario, resolución del cliente seleccionado y bloqueo de cálculos incompletos/fechas/metas inválidas.
- Compilación estática de producción y TypeScript aprobados.
- Navegador real: descargar cálculo TikTok de 300 interacciones / 8.000 vistas = 3,75 %, sin crear cuenta ni guardar análisis. Meta 5 %: diferencia -1,25 puntos porcentuales. PDF de una página con notas.
- Navegador real: ROI (966 - 500) / 500 = 93,20 %, PDF independiente con fórmula y contexto.
- Renderizado de los PDF revisado; exportación extensa conserva las 45 observaciones y distribuye el contenido en tres páginas con numeración.
- Vista móvil de 390 px sin desbordamiento horizontal; botón de descarga visible y utilizable.
- Los PDF breves aprovechan una página; informes extensos crean las páginas necesarias. La descarga no sustituye guardar un análisis ni crear un respaldo.
