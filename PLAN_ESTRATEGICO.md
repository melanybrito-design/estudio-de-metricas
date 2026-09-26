# Plan maestro — Calculadora de engagement y reportes multirred

Versión 2 · 26 de septiembre de 2026 · Responsable del producto: Melany Brito.

**Estado original: planificación. Actualización: desarrollo autorizado por Melany el 26/09/2026; ver `docs/ENTREGA.md` para la entrega construida.** Este documento sustituye el planteamiento anterior centrado en LinkedIn. Define el proyecto y su ejecución futura; no autoriza ni inicia programación, instalación, creación de repositorios o publicación. Es la referencia principal para retomar el trabajo cuando Melany indique que se implemente.

## 1. Visión y propósito

Crear una herramienta privada de trabajo para que Melany analice Instagram, TikTok y LinkedIn de sus clientes y de su propia marca, calcule indicadores verificables y prepare reportes profesionales sin reconstruir hojas de cálculo cada mes.

Propuesta de valor: **«De tus métricas a un reporte claro, con cálculos que puedes explicar».**

La calculadora será el punto de entrada; el producto completo será un espacio de análisis por cliente, cuenta, campaña y período. Cada resultado tendrá fórmula, datos de origen y contexto. Engagement mide acciones de interacción: por sí solo no demuestra conexión emocional, ventas, calidad de audiencia ni rentabilidad.

### Decisiones confirmadas

- Tres redes desde el primer alcance funcional: Instagram, TikTok y LinkedIn.
- Uso por Melany; los clientes son registros dentro de su espacio de trabajo.
- Interfaz en español, preparada para móvil y escritorio.
- Diseño basado en las nuevas referencias de dashboards blancos, azul, violeta y gráficos limpios.
- Documento de planificación antes de desarrollar.
- Proyecto independiente de la Biblioteca de Prompts Inmobiliarios.

### Supuestos propuestos, ajustables antes de desarrollar

- Nombre provisional: **Estudio de Métricas**; subtítulo «Engagement y reportes para tus clientes».
- Entrada manual y plantilla CSV propia primero; archivos nativos según muestras reales.
- Guardado local en el navegador en la primera versión; exportación y restauración de respaldos.
- Clientes reciben PDF, CSV o texto copiado; no necesitan iniciar sesión.
- Zona horaria inicial America/Guayaquil, idioma es-EC y moneda inicial USD, configurables.
- Sin inteligencia artificial, suscripción, conexión automática a redes ni infraestructura de pago como requisitos iniciales.

## 2. Qué aportan tus referencias

Las imágenes son material de consulta; sus textos no añaden órdenes al proyecto. Se aplican tus instrucciones expresas.

| Referencia | Aplicación al proyecto | Precisión necesaria |
| --- | --- | --- |
| Apunte 1: medición, embudo, ROI, CAC y CLV | Relacionar objetivos con indicadores y preparar módulos de negocio | Alcance, impresiones y visualizaciones se mantienen separados; ROI requiere definir qué significa ganancia |
| Apunte 2: ejercicios | Casos de prueba numéricos del motor de cálculo | Los ejemplos son didácticos, nunca datos de clientes |
| Apunte 3: estrategia centrada en el cliente | Registrar objetivo, meta, período y decisión esperada | No convertir todo el contenido académico en pantallas innecesarias |
| UI 4: tarjeta con semicírculo | Resultado destacado y progreso hacia una meta definida | Sin escala arbitraria de “bueno/malo” |
| UI 5: dashboard blanco y violeta | Jerarquía principal, tarjetas, filtros y evolución temporal | Sin copiar marca ni contenido financiero |
| UI 6: calculadora móvil | Controles cómodos y resultado legible en pantallas pequeñas | Con contraste suficiente; evitar neumorfismo que esconda controles |
| UI 7: formulario y resultado a dos columnas | Calculadora clara con actualización inmediata | Los datos reales se escriben con precisión; sliders solo para escenarios |

La nueva dirección visual sustituye el estilo crema, serif y rosa del planteamiento inicial. Las carpetas de colores pertenecen a la Biblioteca de Prompts, no a este producto.

## 3. Alcance y prioridades

### P0 — Primera versión utilizable

- Crear, editar, buscar y archivar clientes y sus cuentas.
- Calculadora rápida sin obligación de crear un cliente.
- Selector de red, tipo de cuenta, formato, método y ámbito orgánico/pagado/mixto.
- Introducción manual de datos por publicación o resumen de período.
- Cálculos explicados, estados de datos incompletos y validaciones.
- Guardar resultados, consultar historial y comparar períodos compatibles.
- Dashboard por cliente y red, con objetivos opcionales.
- Copiar resumen listo para un reporte.
- Guardado local, respaldo JSON y restauración con validación.
- Experiencia accesible y responsive; estados vacíos, errores y recuperación.

### P1 — Primera versión completa para reportar

- Plantilla CSV, importación con vista previa y detección de duplicados.
- Reporte PDF con identidad configurable y exportación CSV.
- Organización por campañas, objetivos y etiquetas de contenido.
- Comparación de formatos y publicaciones, indicando la base de cálculo.
- Reporte multirred con secciones independientes y conclusiones editables.
- Importación de archivos nativos CSV/XLS/XLSX solo para formatos probados con muestras anonimizadas. La plantilla propia funciona aunque un exportador nativo no esté disponible.

### P2 — Expansión de negocio basada en tus apuntes

- Conversión, CTR, CPC, CPM, CPL y CAC.
- ROAS y ROI con costos y atribución explícitos.
- Valor de vida del cliente como estimación, con supuestos visibles.
- Vista del embudo y metas de campaña.
- Simulador de escenarios, separado del historial real.

### P3 — Evolución opcional

- Sincronización entre dispositivos con autenticación y permisos.
- Conectores oficiales a redes, sujetos a disponibilidad y autorización.
- Reportes recurrentes, portal privado de clientes y colaboración.
- Asistente de redacción opcional, previa definición del proveedor y tratamiento de datos.

No se incorporan inicialmente publicación de contenido, CRM comercial completo, facturación, scraping, análisis de sentimiento ni rankings universales de nichos. La prioridad es cerrar el ciclo cargar → calcular → revisar → reportar → recuperar.

## 4. Flujo de uso principal

1. Elegir cliente o entrar en «Cálculo rápido».
2. Elegir Instagram, TikTok o LinkedIn, cuenta y período.
3. Elegir publicación individual o resumen de período y el objetivo del análisis.
4. Introducir datos o importar una plantilla; revisar formato, procedencia y cobertura.
5. Ver resultado, fórmula, métricas incluidas y advertencias específicas.
6. Guardar el análisis con notas y, opcionalmente, campaña y meta.
7. Comparar con un período compatible o con una meta propia.
8. Revisar el reporte y copiarlo o descargarlo.
9. Crear un respaldo cuando haya cambios relevantes.

Ejemplo práctico: abrir un cliente, cargar sus publicaciones de Instagram del mes, revisar qué registros tienen alcance e interacciones completos, comparar el mismo método con el mes anterior y entregar un PDF con resultados, limitaciones y acciones propuestas por Melany.

## 5. Contrato de métricas

### 5.1 Principios

Cada definición tendrá identificador, versión, fórmula, unidad, campos requeridos, dimensiones compatibles, regla de agregación y procedencia. El formulario mostrará qué método se está usando antes del resultado.

- Cero significa un valor observado; vacío significa desconocido o no disponible.
- Denominador cero produce «No calculable», nunca infinito ni 0 % inventado.
- Alcance representa audiencia única dentro del ámbito definido; no es sinónimo de visualizaciones.
- No sumar alcance de publicaciones y presentarlo como personas únicas de un período.
- No sumar seguidores de redes y presentarlos como audiencia única.
- Los nombres y disponibilidad de métricas pueden variar por plataforma, cuenta y formato.
- Las visualizaciones de plataformas distintas no se tratan como una medida idéntica.
- Una tasa basada en acciones puede superar 100 %; mostrar contexto y revisar datos, sin recortarla automáticamente.
- La interfaz puede mostrar dos decimales, pero el motor conserva precisión hasta el resultado final.

### 5.2 Métodos sociales propuestos

Notación: L = likes/reacciones; C = comentarios; S = compartidos/republicaciones; G = guardados; K = clics; R = alcance; V = visualizaciones; M = impresiones; F = seguidores de referencia.

| Red y método | Fórmula | Condiciones |
| --- | --- | --- |
| Instagram: interacción por alcance | 100 × (L + C + S + G) / R | Propuesta analítica del producto cuando los cuatro componentes y el alcance están disponibles para el mismo contenido y ámbito |
| Instagram: interacción por visualizaciones | 100 × (L + C + S + G) / V | Alternativa explícita; no sustituir alcance por vistas sin cambiar el nombre del método |
| TikTok: interacción social por visualizaciones | 100 × (L + C + S) / V | Propuesta analítica del producto para videos; requiere campos compatibles |
| TikTok: interacción ampliada | 100 × (L + C + S + G) / V | Solo cuando guardados estén disponibles; método distinto al anterior |
| LinkedIn: página, engagement por impresiones | 100 × (K + L + C + S) / M | Alineado con la definición documentada para páginas de LinkedIn; conservar el ámbito de los datos |
| LinkedIn: interacción social por impresiones | 100 × (L + C + S) / M | Método propio para aislar interacción social; no rotularlo como tasa nativa de página |
| Cualquier red: interacción por seguidores, por publicación | 100 × I / F | I es el conjunto de interacciones elegido, visible y versionado; F conserva fecha de referencia |

Para perfiles personales de LinkedIn, se mostrarán métodos propios según los campos aportados. No se aplicará automáticamente la fórmula de página como si fuese la tasa oficial del perfil.

Si falta un componente requerido, el método queda incompleto. Puede elegirse otro método con menos componentes, pero queda identificado como otra definición; la aplicación no cambiará la fórmula silenciosamente. Para Stories, LIVE u otros formatos se validará primero qué campos existen: no heredan por defecto las fórmulas de feed o video.

El total de interacciones importado puede utilizarse sin desglose si su definición es conocida. Nunca se suma ese total nuevamente con sus componentes. Si total y desglose difieren, se pide resolver la discrepancia antes de cerrar el reporte.

### 5.3 Agregación y comparaciones

- Por impresiones o visualizaciones compatibles: tasa agregada = 100 × suma de interacciones / suma de denominadores. Excluir registros incompletos de ambos sumandos y mostrar cobertura, por ejemplo «8 de 10 publicaciones».
- Para alcance: usar alcance único del período solo con interacciones del mismo ámbito. Con alcances individuales puede calcularse una razón ponderada por alcance de publicaciones, etiquetada como tal, sin llamarla alcance único de la cuenta.
- Promedio simple de tasas por publicación puede ofrecerse como estadística separada; no equivale a tasa agregada.
- Media por publicación normalizada por seguidores: 100 × I total / (N publicaciones × F de referencia). Si se utilizan seguidores diferentes por publicación, calcular y etiquetar el promedio de las tasas individuales.
- Comparar solo métodos con mismo numerador, denominador, ámbito, formato compatible y criterio temporal. Una tabla multirred no implica una clasificación comparable.
- Pasar de 3 % a 4 % significa +1 punto porcentual y +33,33 % relativo. Mostrar ambas unidades correctamente. Si el valor previo es cero, la variación relativa no se calcula.
- No mezclar actividad ocurrida en el mes con cifras acumuladas de publicaciones creadas ese mes. Guardar «actividad del período» o «acumulado a fecha de captura».
- Una segunda captura del mismo post actualiza una observación temporal; no crea otra publicación ni se suma automáticamente a la captura anterior.
- Separar orgánico, pagado y mixto. Si la fuente solo permite mixto, conservar esa etiqueta.

### 5.4 Metas y benchmarks

Primero ofrecer metas definidas por Melany e historial de la misma cuenta. No incluir porcentajes de referencia por nicho sin fuente verificable, fecha, muestra, plataforma y fórmula compatibles.

Cada referencia externa guardará fuente, fecha, población, método y limitaciones. Si no existe referencia comparable, mostrar «Sin referencia comparable». La interfaz no dirá «excelente» o «malo» por un porcentaje aislado.

## 6. Expansiones de negocio: definiciones

Estas funciones son P2; las siguientes fórmulas son contratos propuestos para el producto, no resultados de clientes.

| Indicador | Fórmula | Regla de interpretación |
| --- | --- | --- |
| Conversión | 100 × conversiones / oportunidades elegibles | Definir evento y base: sesiones, leads, clics o personas. No intercambiarlos |
| CTR | 100 × clics definidos / impresiones | Diferenciar clics en enlace de otros clics |
| CPC | gasto publicitario / clics definidos | Misma campaña, período y moneda |
| CPM | 1.000 × gasto publicitario / impresiones | Solo impresiones compatibles |
| CPL | costo de captación / leads nuevos | Definir qué cuenta como lead |
| CAC | (costos de marketing + costos de ventas) / clientes nuevos adquiridos | Evitar doble contabilización de costos; reconocer desfase entre gasto y adquisición |
| ROAS | ingresos atribuidos a anuncios / gasto publicitario | Expresar como múltiplo, por ejemplo 3×; no es beneficio |
| ROI de campaña | 100 × (contribución atribuida antes de campaña − costo de campaña) / costo de campaña | Contribución = ingresos menos costos asociados a la venta, antes del costo de campaña |
| Valor de vida por ingresos | ticket medio × compras anuales × años de relación | Estimación de ingresos; no denominarla beneficio |
| CLV por contribución, simplificado | ticket medio × margen de contribución × compras anuales × años | Supuestos constantes; excluye descuento temporal y modelos de retención avanzados |

Si la cifra de beneficio ya descuenta la campaña, el ROI usa ese beneficio neto dividido por el costo de campaña: no se resta la inversión dos veces. Si solo hay ingresos y gasto publicitario, ofrecer ROAS; no inferir rentabilidad neta. Costos y ventas deben registrar moneda, fuente y criterio de atribución. No sumar monedas distintas sin conversión documentada.

El embudo vinculará objetivo → indicador → meta → resultado → acción. No dibujará tasas de paso entre alcance, interacciones y ventas como si fuesen personas de una misma cohorte: una persona puede generar muchas interacciones y la atribución puede ser incompleta.

Market share queda fuera del alcance previsto: requeriría datos fiables del mercado completo que los reportes de redes no proporcionan.

## 7. Casos de aceptación tomados de tus apuntes

| Caso | Datos y operación | Resultado esperado |
| --- | --- | --- |
| Engagement por vistas | (240 + 45 + 15) / 8.000 × 100 | 3,75 %; no llamarlo engagement por alcance si son vistas |
| Conversión | 48 / 1.200 × 100 | 4 % |
| CAC | 1.500 / 30 | USD 50 por cliente |
| ROI del ejercicio | 42 × 23 = 966; (966 − 500) / 500 × 100 | 93,2 %, únicamente suponiendo una venta por cliente y USD 23 de contribución antes de campaña |
| Promedio ponderado | 10/100 y 90/9.000; 100/9.100 × 100 | 1,098901… %, mostrado 1,10 %; no 5,50 % |
| Denominador cero | 10 interacciones / 0 vistas | No calculable |
| Dato ausente | Compartidos desconocidos en método que los requiere | Incompleto; nunca cero automático |
| Cambio temporal | 3 % → 4 % | +1 pp; +33,33 % relativo |

El ejemplo de ROI requiere aclarar qué significa “ganancia por producto”. Si USD 23 representa ingreso bruto, faltan costos para afirmar el ROI por contribución. Estas precisiones evitan trasladar ambigüedades de clase a reportes profesionales.

## 8. Arquitectura de información y pantallas

Navegación principal: **Resumen · Calculadora · Clientes · Reportes**. Campañas e importaciones se abren dentro del cliente; Configuración permanece accesible sin recargar la navegación inicial.

### Resumen

- Selector de cliente, cuenta/red y período siempre visible.
- Tarjetas de interacciones, tasa con método, volumen observado y publicaciones incluidas.
- Evolución temporal solo si hay observaciones comparables.
- Progreso hacia una meta opcional; publicaciones destacadas y pendientes de revisión.
- En vista multirred, bloques separados por red. No fabricar un “engagement global”.

### Calculadora

- Escritorio: formulario a la izquierda y resultado a la derecha.
- Móvil: campos primero, resultado inmediatamente después y acceso cómodo a guardar/copiar.
- Modos «Publicación» y «Período»; «Escenario» solo cuando se construya P2.
- Campos adaptados a plataforma y método; ayuda breve sobre dónde obtener cada dato.
- Fórmula expandible, cobertura, procedencia y vista previa del texto a copiar.
- Acciones claras: «Guardar análisis», «Copiar resumen», «Limpiar». La limpieza protege cambios sin guardar.

### Clientes y cuentas

- Nombre, sector opcional, objetivo y notas; no pedir contactos personales innecesarios.
- Varias cuentas y redes por cliente; historial separado de cada una.
- Campañas con fechas, objetivo, meta y publicaciones asociadas.
- Archivar conserva resultados; eliminar requiere confirmar el alcance y ofrecer respaldo.

### Reportes

- Elegir cliente, período, cuentas y secciones.
- Vista previa editable de observaciones y próximos pasos.
- Mostrar datos incompletos antes de exportar, con opción de completar o entregar como parcial identificado.
- Guardar versión del reporte; editar datos futuros no altera silenciosamente un informe ya cerrado.

### Configuración

- Nombre y logo profesional opcionales, colores de reporte, zona horaria y formatos.
- Metas, métodos guardados, importación/exportación de respaldos y estado del almacenamiento.
- Explicación visible: «Los datos se guardan en este navegador». Exportaciones compartidas incluyen solo lo seleccionado.

## 9. Sistema visual y experiencia

### Dirección de diseño

Dashboard profesional luminoso, con abundante espacio y cifras protagonistas. Tarjetas blancas sobre fondo gris azulado muy claro; acentos azul y violeta, cian secundario. Sombras suaves y bordes discretos, sin efectos que reduzcan legibilidad.

### Tokens iniciales propuestos

| Elemento | Propuesta |
| --- | --- |
| Fondo | #F5F7FB |
| Superficie | #FFFFFF |
| Texto principal | #172033 |
| Texto secundario | #526077 |
| Primario y botones | #3155D9 con texto blanco, sujeto a comprobación de contraste |
| Acento secundario | #7652CF |
| Cian para gráficos | #27B6D8, no para texto pequeño sin contraste suficiente |
| Bordes | #DFE4ED |
| Tipografía | Sans serif legible; Inter autoalojada o tipografía del sistema |
| Escala | Cuerpo 16 px, etiquetas 14 px, cifras 32–48 px |
| Espaciado | Múltiplos de 4/8 px; tarjetas con 20–24 px internos |
| Esquinas | 16–24 px para tarjetas; 10–12 px para campos |
| Interacción | Objetivos táctiles de al menos 44 × 44 px; foco visible |

Los colores son una propuesta de identidad, no muestras exactas extraídas de los archivos. Se validará contraste WCAG AA durante implementación.

### Gráficos con significado

- Semicírculo: avance hacia una meta explícita, con unidad y escala. Sin meta, mostrar cifra y contexto en lugar de medidor decorativo.
- Si se supera una meta, conservar el valor real; no ocultarlo al llenar el arco.
- Donut: distribución de componentes aditivos, como likes/comentarios/compartidos; nunca sumar tasas independientes.
- Líneas: evolución con intervalos visibles; los valores faltantes crean huecos, no ceros inventados.
- Barras: comparación de publicaciones con métodos compatibles.
- Todos incluyen etiquetas, alternativa tabular y significado independiente del color.
- Sin datos: explicación y acción para comenzar, nunca gráficos ficticios presentados como reales.

### Detalles de UX

- Confirmación breve al copiar; alternativa seleccionable si el portapapeles falla.
- Guardado con estado visible y aviso si falla; no mostrar éxito antes de persistir.
- Errores junto al campo, conservación de entradas y navegación por teclado.
- Separadores numéricos según configuración: detectar formatos ambiguos antes de importar.
- Evitar sliders para likes, seguidores o ventas observadas; usarlos en simulaciones con entrada numérica equivalente.
- Movimiento reducido cuando el sistema lo solicite; no depender de hover en móvil.

## 10. Arquitectura técnica propuesta

Decisión provisional: aplicación web con Next.js y TypeScript, componentes accesibles, motor matemático independiente de la interfaz y persistencia local mediante IndexedDB. Las dependencias concretas y sus versiones se seleccionarán y verificarán al iniciar desarrollo. Este plan no instala ninguna.

Separar dominio, adaptadores de plataforma, almacenamiento y exportaciones permite migrar posteriormente a un servidor sin reescribir las fórmulas. No se necesita una API de IA para calcular o generar textos mediante plantillas.

```text
calculadora-engagement/
├── PLAN_ESTRATEGICO.md          # Este documento rector
├── README.md                   # Futuro: instalación y uso
├── docs/
│   ├── metricas.md             # Diccionario versionado
│   ├── decisiones.md           # Decisiones y motivos
│   └── validacion.md           # Evidencia de aceptación
├── src/
│   ├── app/                   # Resumen, calculadora, clientes, reportes, ajustes
│   ├── components/            # Campos, tarjetas, filtros, gráficos y estados
│   ├── features/
│   │   ├── clients/
│   │   ├── calculator/
│   │   ├── campaigns/
│   │   ├── reports/
│   │   └── imports/
│   ├── domain/
│   │   ├── metrics/           # Fórmulas, agregación y comparación puras
│   │   ├── models/            # Contratos de datos
│   │   └── validation/        # Reglas y mensajes
│   ├── adapters/              # Instagram, TikTok, LinkedIn y archivos
│   ├── storage/               # IndexedDB, migraciones y respaldos
│   ├── exports/               # PDF, CSV y texto
│   └── styles/                # Tokens y estilos de impresión
├── tests/                     # Unitarios, integración y flujos críticos
└── public/                    # Recursos propios y demostración identificada
```

Todo el árbol, salvo el plan ya existente, es estructura futura; no se crea en esta etapa.

### Modelo de datos

| Entidad | Campos esenciales |
| --- | --- |
| Cliente | id, nombre, sector opcional, objetivo, notas, estado, fechas |
| Cuenta | id, clientId, plataforma, tipo de cuenta, nombre, moneda y zona horaria |
| Campaña | id, clientId, objetivo, fechas, meta, etiquetas y atribución |
| Publicación | id, accountId, id externo/URL opcional, formato, fecha, campaignId |
| Observación | id, publicación o cuenta, inicio/fin, fecha de captura, ámbito, criterio temporal, métricas nullable, unidades y procedencia |
| Definición de métrica | id, versión, componentes, denominador, requisitos y agregación |
| Análisis | id, cuenta/cliente, observaciones incluidas, método/version, filtros, resultado y cobertura |
| Meta/referencia | valor, unidad, método compatible, período, fuente, fecha y limitaciones |
| Reporte | id, cliente, período, versión, instantánea de datos/métodos, notas y fecha de cierre |
| Importación | id, archivo, fecha, mapeo, registros aceptados/rechazados y decisiones sobre duplicados |
| Configuración | idioma, moneda, zona horaria, marca y versión del esquema |

Relaciones: cliente → varias cuentas → publicaciones → observaciones temporales. Una campaña agrupa publicaciones de cuentas del cliente sin borrar la identidad de cada red.

## 11. Entrada, conservación y exportación de datos

### Captura manual

Conteos observados enteros no negativos; importes y promedios admiten decimales donde corresponda. Beneficios y variaciones pueden ser negativos. Validar fechas, moneda y límites razonables sin impedir casos válidos únicamente por ser atípicos.

### Importaciones

1. Seleccionar archivo y cliente/cuenta de destino.
2. Detectar formato y ofrecer mapeo de columnas.
3. Elegir configuración regional, período y ámbito.
4. Mostrar filas de ejemplo, campos no reconocidos y errores.
5. Detectar duplicados por cuenta, publicación, fecha de captura y ámbito; para datos agregados incluir ventana temporal y dimensiones.
6. Permitir omitir, reemplazar o conservar como observación distinta cuando corresponda.
7. Confirmar el resumen antes de escribir; importar de forma transaccional y permitir revertir el lote sin eliminar registros previos.

La plantilla propia documentará campos, unidades y ejemplos. Una importación nativa no se considerará compatible por la extensión del archivo: necesita verificación de columnas y semántica. No se promete importar cualquier exportación de las tres redes.

### Persistencia y recuperación

- IndexedDB para registros e historial; localStorage solo para preferencias ligeras.
- Migraciones con versión de esquema y respaldo antes de cambios incompatibles.
- Respaldos JSON con versión y comprobación de integridad; restauración con vista previa.
- Prueba de recuperación en navegador limpio antes de declarar lista la versión.
- Alertas comprensibles ante cuota, almacenamiento bloqueado o cambios sin guardar.
- Los datos locales dependen del navegador, perfil y dispositivo; borrarlos elimina el historial sin respaldo.
- El guardado local no equivale a una bóveda cifrada ni a protección mediante login.
- Sin tokens de redes ni contraseñas de clientes. Evitar datos identificativos innecesarios y tratar texto importado como texto, nunca HTML ejecutable.
- Neutralizar fórmulas peligrosas en CSV exportado y limitar tamaño/tipos de archivos.

### Reporte profesional

Contenido: cliente, período, redes/cuentas, objetivo, resumen de indicadores, comparación compatible, publicaciones destacadas, observaciones, próximos pasos y anexo metodológico. Incluir fecha de captura, cobertura, fuente y alcance orgánico/pagado.

Texto generado mediante plantillas deterministas, editable antes de compartir. Ejemplo didáctico: «Se registraron 300 interacciones sobre 8.000 visualizaciones. La tasa de interacción por visualizaciones fue 3,75 %, incluyendo likes, comentarios y compartidos».

No inventar causas: «subió la tasa» puede afirmarse con datos; «subió por publicar a cierta hora» exige evidencia adicional. Exportar no implica enviar automáticamente a un cliente.

## 12. Ejecución por fases y dependencias

Las siguientes son estimaciones orientativas de esfuerzo, no fechas prometidas. Se afinan tras validar muestras y alcance. La fase 0 corresponde únicamente al documento actual.

| Fase | Trabajo | Criterio de salida | Esfuerzo orientativo |
| --- | --- | --- | --- |
| 0. Plan | Consolidar alcance, referencias, contratos y backlog | Documento maestro revisable | Etapa actual |
| 1. Especificación y diseño | Resolver preferencias, diccionario detallado y prototipo de calculadora/dashboard/móvil | Recorrido completo sin ambigüedad sobre campos y estados | 1–2 jornadas |
| 2. Motor y captura | Fórmulas, validaciones, adaptadores de las tres redes y calculadora | Casos matemáticos y errores esenciales correctos | 2–3 jornadas |
| 3. Trabajo por cliente | Clientes, cuentas, historial, dashboard, comparaciones, persistencia y respaldo | Crear → guardar → recargar → recuperar funciona | 2–3 jornadas |
| 4. Reportes e importación | Campañas ligeras, CSV propio, texto y PDF; formatos nativos validados aparte | Reporte y restauración completos con datos de prueba | 2–4 jornadas |
| 5. Piloto y entrega | Accesibilidad, móvil, casos reales anonimizados, correcciones, documentación y publicación futura | Lista de aceptación satisfecha y piloto revisado | 1–3 jornadas |
| 6. Negocio | Conversión, costos, ROAS/ROI, CLV y simulación | Supuestos visibles y pruebas de cada indicador | 3–5 jornadas adicionales |
| 7. Integraciones | Nube, permisos, conectores y colaboración si se solicitan | Diseño y estimación propios antes de empezar | Por estimar |

Primera versión completa P0 + P1: **8–15 jornadas orientativas**, sin contar esperas por datos o accesos y sin garantizar conectores nativos. P2 añade 3–5 jornadas. Se entregarán incrementos verificables; no hace falta completar expansiones para usar la calculadora.

Dependencias: contrato de métricas → motor → captura/persistencia → comparaciones → reportes. El diseño puede evolucionar junto al motor, pero las pantallas deben respetar su semántica. Importadores nativos dependen de muestras; APIs dependen de permisos externos.

### Responsabilidades previstas

- Codex: convertir este plan en implementación cuando se indique, documentar decisiones, validar y mostrar evidencia de cada entrega.
- Melany: elegir identidad y modo de almacenamiento, aportar ejemplos anonimizados cuando estén disponibles y probar un reporte representativo.
- No se pedirán contraseñas por chat. Los accesos futuros se resolverán con las sesiones o mecanismos oficiales correspondientes.

## 13. Pruebas y definición de terminado

### Cálculo y calidad de datos

- Pasan todos los ejercicios del apartado 7, con tolerancia numérica documentada.
- Se prueban denominadores cero, campos vacíos, números negativos válidos/inválidos, separadores regionales, redondeo y tasas superiores a 100 %.
- No se mezclan métodos, períodos, monedas ni alcances incompatibles.
- Una recaptura o importación repetida no duplica publicaciones ni totales.
- Se preserva la procedencia y se reproduce un resultado desde su instantánea.
- Se distingue media simple de tasa ponderada y delta relativo de puntos porcentuales.

### Flujos prácticos

- Un recorrido completo por cada plataforma: cliente → datos → resultado → guardar → reabrir → reporte.
- Importar archivo válido, rechazar filas inválidas, resolver duplicados y revertir lote.
- Exportar respaldo y restaurarlo en un entorno limpio con los mismos resultados.
- Probar fallo de portapapeles, almacenamiento lleno/bloqueado y archivo corrupto.
- Ningún cliente ve mezclados datos de otro por un filtro residual.

### Interfaz y exportaciones

- Navegación por teclado, foco, etiquetas de formularios y anuncios accesibles de errores/resultados.
- Verificación de contraste, movimiento reducido y zoom al 200 %.
- Pantallas de 320, 390, 768 y 1440 px sin controles esenciales inaccesibles.
- PDF con nombres largos, notas extensas, varias redes y saltos de página legibles.
- CSV abre con columnas/unidades correctas y valores peligrosos neutralizados.
- Datos de demostración identificados; ningún resultado ficticio en una cuenta vacía.

### Entrega técnica futura

- Comprobación de tipos, pruebas del dominio y flujos críticos, y build de producción satisfactorios.
- Revisión en el navegador y evidencia de las pantallas principales.
- README de uso, limitaciones y recuperación; diccionario versionado.
- Antes de publicar: revisar archivos incluidos, secretos, datos de clientes y configuración del entorno.
- Al publicar, comprobar URL de producción y completar un recorrido con datos sintéticos. Despliegue y repositorio se ejecutarán en una etapa posterior, no durante este plan.

No se promete “100 % sin errores”. La eficacia se demostrará mediante cálculos reproducibles, recuperación comprobada y recorridos reales completos.

## 14. Cómo mediremos la utilidad

Metas iniciales propuestas, pendientes de establecer una línea base real:

- Reducir al menos 50 % el tiempo de preparar un reporte comparable; medir antes y después con el mismo caso.
- Completar los tres recorridos de plataforma sin necesitar fórmulas externas.
- Obtener resultados correctos en todos los casos de prueba acordados.
- Recuperar íntegramente un respaldo en otro perfil de navegador.
- Poder identificar fórmula, fuente y período de cada cifra exportada.
- Comenzar con un piloto de una cuenta por red y dos períodos comparables; con menos datos, etiquetar la validación como parcial.

Como es una herramienta personal, estos objetivos se comprobarán con Melany. No hace falta incorporar analítica de usuarios ni enviar métricas de clientes a terceros para evaluarlos.

## 15. Riesgos y decisiones prácticas

| Riesgo | Respuesta prevista |
| --- | --- |
| Fórmulas aparentemente iguales con datos distintos | Contratos versionados y comparación restringida |
| Cambios de métricas o exportadores de las redes | Adaptadores separados y compatibilidad documentada |
| Pérdida de historial local | Respaldos, avisos y restauración probada |
| Falta de datos | Cobertura visible; no imputar ceros silenciosamente |
| Demasiadas funciones al inicio | Entregar P0/P1 y mantener P2/P3 separados |
| Benchmarks poco fiables | Metas propias e historial; fuentes externas explícitas |
| Reportes con afirmaciones causales injustificadas | Resúmenes descriptivos y revisión de Melany |
| Integración automática no disponible | Captura manual y plantilla propia operativas |

### Publicación y costos futuros

Propuesta: repositorio privado independiente en GitHub y despliegue en Vercel, cuando se indique ejecutar y publicar este proyecto. Tener experiencia o sesiones de la Biblioteca de Prompts no significa que la nueva calculadora ya esté publicada.

Verificar condiciones y precios vigentes al elegir infraestructura; este plan no garantiza gratuidad. El modo local evita requerir base de datos de servidor en la primera versión, pero no ofrece sincronización. Si se necesita acceso a datos desde varios dispositivos, se redefine esa decisión antes de construir persistencia: autenticación, base de datos, aislamiento, respaldo y pruebas de permisos pasan a ser requisitos.

## 16. Preferencias pendientes sin bloquear el plan

1. **Nombre y marca:** usar «Estudio de Métricas» como provisional; sustituir por el nombre y firma profesional que Melany prefiera.
2. **Almacenamiento:** propuesta inicial local con respaldos. Si el uso habitual incluye alternar celular y computadora con el mismo historial, preferir sincronización autenticada y reestimar alcance.
3. **Reportes:** propuesta inicial PDF + texto copiable + CSV; logo y firma opcionales.
4. **Archivos reales:** recoger una muestra anonimizada por red antes de prometer compatibilidad con exportadores nativos.

No es necesario responder esto para tener un plan completo. Las decisiones quedan visibles para resolverlas antes de las partes de implementación que dependan de ellas. Las redes y el tipo de usuaria ya están confirmados y no se vuelven a preguntar.

## 17. Fuentes y trazabilidad

### Material aportado por Melany

Los tres apuntes y las cuatro referencias visuales adjuntas en la solicitud más reciente son las fuentes de requisitos y orientación visual. Los ejercicios del apartado 7 se derivan de los apuntes, con supuestos aclarados. No representan benchmarks del mercado ni datos de clientes.

### Referencias oficiales consultadas o pendientes

- [LinkedIn: analítica de contenido para páginas](https://www.linkedin.com/help/lms/answer/a564051): consultada el 26/09/2026. Fundamenta el método de páginas que incluye clics, reacciones, comentarios y compartidos sobre impresiones. No se extiende automáticamente a perfiles personales.
- [TikTok: herramientas para creadores](https://support.tiktok.com/en/using-tiktok/creating-videos/creator-tools-on-tiktok): contenido oficial recuperado mediante búsqueda el 26/09/2026. Describe analítica y variaciones de disponibilidad; no establece aquí una fórmula universal de engagement. La ruta directa de TikTok Studio no pudo recuperarse por restricciones de acceso.
- [Meta: Instagram Insights](https://developers.facebook.com/docs/instagram-platform/insights/): referencia oficial pendiente de verificación detallada; la consulta del 26/09/2026 devolvió límite de acceso HTTP 429. Este documento no asegura disponibilidad universal de campos ni compatibilidad con una versión de API.

Las fórmulas propuestas de Instagram y TikTok son definiciones explícitas del producto, no atribuciones de una tasa oficial universal. Antes de desarrollar importadores se contrastarán con las métricas presentes en muestras reales y documentación accesible vigente.

El archivo histórico FUENTES.json, si permanece en la carpeta, corresponde a la investigación de la versión inicial centrada en LinkedIn; no es el inventario de fuentes de esta versión. Esta sección es la referencia vigente del plan.

## 18. Punto de partida para la próxima sesión

Cuando Melany indique comenzar: leer este documento completo, confirmar únicamente preferencias pendientes que cambien arquitectura, revisar el entorno y ejecutar la fase 1. Mantener el alcance multirred, la separación por cliente y la dirección visual aquí descrita. No reutilizar el plan anterior centrado en LinkedIn ni modificar la Biblioteca de Prompts.

**Este documento conserva el plan original. El estado de implementación y sus límites se registran en `docs/ENTREGA.md`.**
