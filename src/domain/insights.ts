import { fieldLabels, type Analysis } from "./model.ts";
import { calculate, fmt, methodById } from "./metrics.ts";
export function analysisInsights(a: Analysis) {
  const m = methodById(a.method)!;
  const r = calculate(a.method, a.metrics);
  const missing = [...m.fields, m.denominator].filter(
    (f) => a.metrics[f] === null,
  );
  const distribution = m.fields.map((field) => ({
    label: fieldLabels[field],
    value: a.metrics[field],
  }));
  const facts: string[] = [];
  if (r.value !== null) {
    facts.push(
      `Se registraron ${fmt(r.interactions, 0)} interacciones incluidas por ${fmt(r.denominator, 0)} ${{ reach: "cuentas alcanzadas", views: "visualizaciones", followers: "seguidores de referencia", impressions: "impresiones", likes: "likes", comments: "comentarios", shares: "compartidos", saves: "guardados", clicks: "clics" }[m.denominator]}: ${fmt(r.value)} %. Son acciones, no necesariamente personas distintas.`,
    );
    if (a.goal !== null)
      facts.push(
        `La diferencia frente a tu meta de ${fmt(a.goal)} % es ${fmt(r.value - a.goal)} puntos porcentuales. La meta la defines tú; no es un promedio del sector.`,
      );
    if (r.interactions! > 0) {
      const max = Math.max(...distribution.map((d) => d.value!));
      const leaders = distribution.filter((d) => d.value === max);
      facts.push(
        `El mayor conteo corresponde a ${leaders.map((d) => d.label.toLowerCase()).join(" y ")}: ${fmt(max, 0)}. Esto describe el tipo de respuesta, sin demostrar su causa.`,
      );
    }
  } else
    facts.push(
      `La tasa no es calculable: ${missing.length ? "faltan " + missing.map((f) => fieldLabels[f]).join(", ") : r.error}. Se conservan las métricas disponibles sin sustituir ausencias por ceros.`,
    );
  facts.push(
    "Este cálculo aislado no permite afirmar crecimiento ni atribuir ventas. Para evaluar evolución, compara la misma cuenta, fórmula, formato y períodos equivalentes.",
  );
  const actions = [
    {
      title: "Antes de publicar",
      text: "Define un objetivo: alcance, conversación o acciones de interés. Elige una sola variable para probar (gancho, formato o llamada a la acción) y anota tu hipótesis.",
    },
    {
      title: "Durante los próximos 7 días",
      text:
        (a.metrics.comments !== null && a.metrics.comments > 0
          ? "Responde los comentarios y registra preguntas recurrentes para convertirlas en nuevos contenidos. "
          : "Revisa si la publicación invita a una respuesta concreta; prueba una pregunta relacionada con el contenido. ") +
        "Es una propuesta de prueba, no una explicación confirmada del resultado.",
    },
    {
      title: "En la próxima revisión",
      text:
        (missing.length
          ? "Completa " +
            missing.map((f) => fieldLabels[f]).join(", ") +
            " desde Insights. "
          : "Captura nuevamente las métricas con la misma ventana de observación. ") +
        "Compara resultados, documenta el cambio y decide qué repetir. Si el objetivo son ventas, registra leads y conversiones por separado.",
    },
  ];
  return { facts, actions, distribution, missing };
}
export const metricGuide = [
  [
    "Alcance",
    "Cuentas alcanzadas. No lo sumes entre publicaciones como si fueran personas únicas del mes.",
  ],
  [
    "Visualizaciones",
    "Veces que se vio el contenido; una misma persona puede generar varias. No equivalen a alcance.",
  ],
  [
    "Engagement",
    "Interacciones incluidas divididas por la base elegida, por 100. Compara siempre la misma fórmula.",
  ],
  [
    "Guardados y compartidos",
    "Acciones para conservar o distribuir el contenido. No equivalen automáticamente a intención de compra.",
  ],
];
