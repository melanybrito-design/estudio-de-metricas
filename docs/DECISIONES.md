# Decisiones de implementación

- 26/09/2026: se inicia desarrollo y publicación por instrucción expresa de Melany. La restricción previa de solo planificación queda superada.
- Next.js + React + TypeScript con exportación estática: no hay necesidad de servidor para fórmulas y datos locales.
- IndexedDB almacena un estado validado en una transacción. Un fallo impide mostrar guardado exitoso. No se persiste contenido del formulario mientras no se guarde.
- Mantener metodología v1, definición explícita de componentes y denominador. Instagram y TikTok son métodos propios; LinkedIn páginas documenta clics además de interacciones sociales.
- Importador de plantilla propia: no prometer compatibilidad con exportaciones nativas sin muestras. Los duplicados se omiten; para corregir uno se edita en el historial.
- Los resúmenes de período se revisan individualmente en vez de sumarlos, porque pueden solaparse. Los seguidores producen media de tasas por publicación. Las tasas por alcance de publicaciones se etiquetan como audiencia no deduplicada.
- Reportes de entrega para un solo cliente por vez, con varias redes en secciones separadas. CSV puede cubrir el espacio interno completo.
- No agregar benchmarks de nichos sin evidencia. Los medidores reflejan metas personales.
- PDF generado localmente y fuentes de interfaz servidas desde el proyecto; no se suben métricas a terceros.
- No se implementan P3 (sincronización, portal, APIs, IA) porque el plan las define como opcionales y requieren otro alcance.
- Repositorio privado independiente; despliegue Vercel. Los datos de pruebas quedan en el perfil de navegador y en `output/`, ignorado por Git y Vercel.

## Identidad para publicar en Vercel

Vercel valida que el autor de Git pertenezca al proyecto. Se configuró el correo local de este repositorio con el correo verificado de la cuenta autenticada de Vercel, en lugar del correo automático del Mac. No se modificó la configuración global ni se reescribieron commits publicados. La integración automática con GitHub continúa pendiente de vincular las cuentas; las publicaciones actuales se realizan con la CLI autenticada.
