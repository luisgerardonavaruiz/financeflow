import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface GastoParaAnalisis {
  description: string;
  amount: number;
  category: string;
  type: string;
  date: string;
}

export interface AnalisisFinanciero {
  resumenGeneral: string;
  gastosNecesarios: string;
  gastosInnecesarios: string;
  gastosRiesgo: string;
  consejosPersonalizados: string[];
  puntuacionSalud: number;
}

export async function analizarGastos(
  gastos: GastoParaAnalisis[],
  ingreso: number,
  mes: string
): Promise<AnalisisFinanciero> {
  const totalGastado = gastos.reduce((sum, g) => sum + g.amount, 0);
  const gastosNecesarios = gastos.filter((g) => g.type === "NECESSARY");
  const gastosInnecesarios = gastos.filter((g) => g.type === "UNNECESSARY");
  const gastosRiesgo = gastos.filter((g) => g.type === "RISK");

  const prompt = `Eres un experto asesor financiero personal. Analiza los siguientes datos financieros del mes de ${mes} y proporciona un análisis detallado en español.

DATOS FINANCIEROS:
- Ingreso disponible: $${ingreso.toFixed(2)} MXN
- Total gastado: $${totalGastado.toFixed(2)} MXN
- Porcentaje gastado: ${((totalGastado / ingreso) * 100).toFixed(1)}%
- Dinero disponible: $${(ingreso - totalGastado).toFixed(2)} MXN

GASTOS NECESARIOS (${gastosNecesarios.length} gastos):
${gastosNecesarios.map((g) => `- ${g.description}: $${g.amount.toFixed(2)} (${g.category})`).join("\n")}

GASTOS INNECESARIOS (${gastosInnecesarios.length} gastos):
${gastosInnecesarios.map((g) => `- ${g.description}: $${g.amount.toFixed(2)} (${g.category})`).join("\n")}

GASTOS DE RIESGO FINANCIERO (${gastosRiesgo.length} gastos):
${gastosRiesgo.map((g) => `- ${g.description}: $${g.amount.toFixed(2)} (${g.category})`).join("\n")}

Responde ÚNICAMENTE con un objeto JSON válido con esta estructura exacta, sin texto adicional antes o después:
{
  "resumenGeneral": "párrafo de 2-3 oraciones con el resumen general de la situación financiera",
  "gastosNecesarios": "análisis breve de los gastos necesarios",
  "gastosInnecesarios": "análisis de gastos innecesarios y su impacto",
  "gastosRiesgo": "análisis de gastos de riesgo y consecuencias a largo plazo",
  "consejosPersonalizados": [
    "consejo 1 específico y accionable",
    "consejo 2 específico y accionable",
    "consejo 3 específico y accionable",
    "consejo 4 específico y accionable",
    "consejo 5 específico y accionable"
  ],
  "puntuacionSalud": número entre 0 y 100 que representa la salud financiera
}`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1500,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("Respuesta inesperada de la IA");
  }

  const jsonText = content.text.trim();
  const analisis = JSON.parse(jsonText) as AnalisisFinanciero;
  return analisis;
}

export async function generarConsejos(
  gastos: GastoParaAnalisis[],
  ingreso: number
): Promise<string[]> {
  const totalGastado = gastos.reduce((sum, g) => sum + g.amount, 0);

  const prompt = `Eres un experto asesor financiero personal. Basándote en estos datos financieros, genera 5 consejos financieros prácticos y personalizados en español.

DATOS:
- Ingreso: $${ingreso.toFixed(2)} MXN
- Total gastado: $${totalGastado.toFixed(2)} MXN
- Gastos de riesgo: $${gastos.filter((g) => g.type === "RISK").reduce((s, g) => s + g.amount, 0).toFixed(2)} MXN
- Gastos innecesarios: $${gastos.filter((g) => g.type === "UNNECESSARY").reduce((s, g) => s + g.amount, 0).toFixed(2)} MXN

Responde ÚNICAMENTE con un array JSON de 5 strings, sin texto adicional:
["consejo 1", "consejo 2", "consejo 3", "consejo 4", "consejo 5"]`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 800,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Respuesta inesperada");

  return JSON.parse(content.text.trim()) as string[];
}
