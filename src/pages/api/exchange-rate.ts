export const prerender = false;

import type { APIRoute } from "astro";

interface BanxicoDatum {
  dato: string;
  fecha: string;
}

interface BanxicoResponse {
  bmx?: {
    series?: Array<{
      datos?: BanxicoDatum[];
    }>;
  };
}

const JSON_HEADERS = {
  "Content-Type": "application/json",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "DENY",
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'; base-uri 'none'",
};
const SUCCESS_HEADERS = {
  ...JSON_HEADERS,
  "Cache-Control": "public, max-age=1800, stale-while-revalidate=600",
};

/**
 * Devuelve la fecha "de hoy" en la zona horaria de Ciudad de México,
 * en formato YYYY-MM-DD. Es indispensable calcularla en esta zona (y no
 * en UTC, que es la del Worker de Cloudflare) porque Banxico determina y
 * publica el FIX usando el calendario de México.
 */
const getMexicoCityTodayISO = (): string =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/Mexico_City" }).format(
    new Date()
  );

const formatDate = (date: Date): string => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/** Convierte "DD/MM/YYYY" (formato de Banxico) a "YYYY-MM-DD" comparable. */
const toISO = (fechaBanxico: string): string => {
  const [day, month, year] = fechaBanxico.split("/");
  return `${year}-${month}-${day}`;
};

/**
 * Convierte la fecha de determinación de Banxico ("DD/MM/YYYY", día D)
 * a la fecha de publicación y vigencia en el DOF (siguiente día hábil, día D+1).
 */
const toDOFPublicationDate = (fechaBanxico: string): string => {
  const [day, month, year] = fechaBanxico.split("/").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  do {
    date.setUTCDate(date.getUTCDate() + 1);
  } while (date.getUTCDay() === 0 || date.getUTCDay() === 6);

  const d = String(date.getUTCDate()).padStart(2, "0");
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const y = date.getUTCFullYear();
  return `${d}/${m}/${y}`;
};

/**
 * La serie SF43718 es el "Tipo de cambio FIX - Fecha de determinación".
 * Banxico DETERMINA el FIX del día D durante la tarde de ese mismo día D,
 * pero ese valor entra en vigor y se publica en el DOF hasta el día hábil
 * D+1. Por lo tanto, el dato vigente "hoy" nunca es el último de la serie
 * (que suele ser el recién determinado hoy, para vigencia de mañana), sino
 * el más reciente cuya fecha sea estrictamente anterior a hoy.
 */
const extractLatestRate = (
  data: BanxicoResponse,
  todayISO: string
): { rate: string; fecha: string } | null => {
  const datos = data.bmx?.series?.[0]?.datos;

  if (!datos?.length) {
    return null;
  }

  const vigente = [...datos].reverse().find((d) => toISO(d.fecha) < todayISO);
  const latestData = vigente ?? datos[datos.length - 1];
  const parsedRate = Number.parseFloat(latestData.dato);

  if (Number.isNaN(parsedRate)) {
    return null;
  }

  return {
    rate: parsedRate.toFixed(4),
    fecha: toDOFPublicationDate(latestData.fecha),
  };
};

const fetchBanxicoRate = async (
  startDate: Date,
  endDate: Date,
  token: string,
  todayISO: string
): Promise<{ rate: string; fecha: string } | null> => {
  const path = `${formatDate(startDate)}/${formatDate(endDate)}`;
  const url = new URL(
    `https://www.banxico.org.mx/SieAPIRest/service/v1/series/SF43718/datos/${path}`
  );
  url.searchParams.set("token", token);

  const controller = new AbortController();
  const timeoutId = globalThis.setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) {
      throw new Error(`Banxico API error: ${response.status}`);
    }

    const payload = (await response.json()) as BanxicoResponse;
    return extractLatestRate(payload, todayISO);
  } finally {
    globalThis.clearTimeout(timeoutId);
  }
};

export const GET: APIRoute = async (context) => {
  const token = context.locals.runtime?.env?.BANXICO_TOKEN?.trim();

  if (!token) {
    return new Response(JSON.stringify({ error: "Token no configurado", hasToken: false }), {
      status: 500,
      headers: JSON_HEADERS,
    });
  }

  const todayISO = getMexicoCityTodayISO();
  const today = new Date(`${todayISO}T00:00:00Z`);
  const threeDaysAgo = new Date(today);
  threeDaysAgo.setUTCDate(today.getUTCDate() - 3);

  try {
    const recentRate = await fetchBanxicoRate(threeDaysAgo, today, token, todayISO);
    if (recentRate) {
      return new Response(JSON.stringify(recentRate), {
        status: 200,
        headers: SUCCESS_HEADERS,
      });
    }

    const weekAgo = new Date(today);
    weekAgo.setUTCDate(today.getUTCDate() - 7);
    const fallbackRate = await fetchBanxicoRate(weekAgo, today, token, todayISO);

    if (fallbackRate) {
      return new Response(JSON.stringify(fallbackRate), {
        status: 200,
        headers: SUCCESS_HEADERS,
      });
    }

    return new Response(JSON.stringify({ error: "Sin datos disponibles" }), {
      status: 404,
      headers: JSON_HEADERS,
    });
  } catch (error) {
    console.error("Error al consultar Banxico", error);
    return new Response(JSON.stringify({ error: "Error al consultar Banxico" }), {
      status: 500,
      headers: JSON_HEADERS,
    });
  }
};
