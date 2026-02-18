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

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const extractLatestRate = (
  data: BanxicoResponse
): { rate: string; fecha: string } | null => {
  const datos = data.bmx?.series?.[0]?.datos;

  if (!datos?.length) {
    return null;
  }

  const latestData = datos[datos.length - 1];
  const parsedRate = Number.parseFloat(latestData.dato);

  if (Number.isNaN(parsedRate)) {
    return null;
  }

  return {
    rate: parsedRate.toFixed(4),
    fecha: latestData.fecha,
  };
};

const fetchBanxicoRate = async (
  startDate: Date,
  endDate: Date,
  token: string
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
    return extractLatestRate(payload);
  } finally {
    globalThis.clearTimeout(timeoutId);
  }
};

export const GET: APIRoute = async (context) => {
  const token = (
    context.locals.runtime?.env?.BANXICO_TOKEN ?? import.meta.env.BANXICO_TOKEN
  )?.trim();

  if (!token) {
    return new Response(JSON.stringify({ error: "Token no configurado", hasToken: false }), {
      status: 500,
      headers: JSON_HEADERS,
    });
  }

  const today = new Date();
  const threeDaysAgo = new Date(today);
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  try {
    const recentRate = await fetchBanxicoRate(threeDaysAgo, today, token);
    if (recentRate) {
      return new Response(JSON.stringify(recentRate), {
        status: 200,
        headers: SUCCESS_HEADERS,
      });
    }

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const fallbackRate = await fetchBanxicoRate(weekAgo, today, token);

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
