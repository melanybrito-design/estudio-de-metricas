# Diccionario de métodos v1

Conteos enteros, no negativos. Vacío = desconocido; cero = observado. Denominador cero = no calculable. Precisión interna sin redondeo intermedio; presentación de tasas con dos decimales.

| ID | Componentes | Denominador | Red |
| --- | --- | --- | --- |
| ig-reach | Likes + comentarios + compartidos + guardados | Alcance | Instagram |
| ig-views | Likes + comentarios + compartidos + guardados | Visualizaciones | Instagram |
| ig-followers | Likes + comentarios + compartidos | Seguidores de referencia | Instagram |
| tt-views | Likes + comentarios + compartidos | Visualizaciones | TikTok |
| tt-extended | Likes + comentarios + compartidos + guardados | Visualizaciones | TikTok |
| tt-followers | Likes + comentarios + compartidos | Seguidores de referencia | TikTok |
| li-social | Reacciones + comentarios + republicaciones | Impresiones | LinkedIn |
| li-page | Clics + reacciones + comentarios + republicaciones | Impresiones | LinkedIn, páginas |
| li-followers | Reacciones + comentarios + republicaciones | Seguidores de referencia | LinkedIn |

Tasa = suma de componentes / denominador × 100. La fecha de captura conserva la referencia temporal de las métricas. Los métodos por seguidores se limitan a publicación individual; si se usa un número de seguidores de otra fecha debe anotarse en la fuente o notas.

Para agregados se exige misma cuenta, método, versión, formato, modo, ámbito y criterio temporal. No se suman múltiples capturas identificadas del mismo contenido. Registros incompletos quedan fuera de ambos sumandos y se muestra cobertura. La comparación de dos registros además exige períodos ordenados, no superpuestos y de igual duración; para comparar meses desiguales se debe interpretar cada resultado por separado.

El modelo no mide audiencia única entre redes, causalidad ni atribución de ventas. No existe una escala universal de buen engagement.

Las fórmulas de negocio están en `src/domain/metrics.ts`, con etiquetas y aclaraciones en la interfaz. ROI usa contribución antes del costo de campaña. ROAS usa ingresos atribuidos. CLV por ingresos no representa beneficios.

Fuente primaria del método de páginas: https://www.linkedin.com/help/lms/answer/a564051. El resto de métodos sociales son definiciones analíticas explícitas del producto.
