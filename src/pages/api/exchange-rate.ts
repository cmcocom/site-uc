export const prerender = false;

import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  const token = import.meta.env.BANXICO_TOKEN;

  console.log("BANXICO_TOKEN exists:", !!token);
  console.log("BANXI_TOKEN value:", token ? "***" + token.slice(-4) : "undefined");

  if (!token) {
    return new Response(JSON.stringify({ error: "Token no configurado", hasToken: false }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const today = new Date();
  const threeDaysAgo = new Date(today);
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  try {
    const url = `https://www.banxico.org.mx/SieAPIRest/service/v1/series/SF43718/datos/${formatDate(threeDaysAgo)}/${formatDate(today)}?token=${token}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Banxico API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.bmx?.series?.[0]?.datos?.length > 0) {
      const datos = data.bmx.series[0].datos;
      const latestData = datos[datos.length - 1];
      return new Response(
        JSON.stringify({
          rate: parseFloat(latestData.dato).toFixed(4),
          fecha: latestData.fecha,
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=1800",
          },
        }
      );
    }

    // Fallback: try last 7 days
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekUrl = `https://www.banxico.org.mx/SieAPIRest/service/v1/series/SF43718/datos/${formatDate(weekAgo)}/${formatDate(today)}?token=${token}`;
    const weekResponse = await fetch(weekUrl);

    if (weekResponse.ok) {
      const weekData = await weekResponse.json();
      if (weekData.bmx?.series?.[0]?.datos?.length > 0) {
        const datos = weekData.bmx.series[0].datos;
        const latestData = datos[datos.length - 1];
        return new Response(
          JSON.stringify({
            rate: parseFloat(latestData.dato).toFixed(4),
            fecha: latestData.fecha,
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "public, max-age=1800",
            },
          }
        );
      }
    }

    return new Response(JSON.stringify({ error: "Sin datos disponibles" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Error al consultar Banxico" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
