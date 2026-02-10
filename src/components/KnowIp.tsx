"use client";

import { useEffect, useState } from "react";

interface KnowIpProps {
  variant?: "page" | "compact";
  className?: string;
}

export default function KnowIp({ variant = "page", className = "" }: KnowIpProps) {
  const [ip, setIp] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const fetchIP = async () => {
      try {
        const res = await fetch("https://api.ipify.org?format=json", { signal: controller.signal });
        const data = await res.json();
        setIp(data.ip);
        setError(null);
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          setError("No se pudo obtener la IP");
        }
      }
    };
    fetchIP();
    return () => controller.abort();
  }, []);

  const handleRetry = () => {
    setIp(null);
    setError(null);
    // Re-fetch by triggering useEffect
    const fetchIP = async () => {
      try {
        const res = await fetch("https://api.ipify.org?format=json");
        const data = await res.json();
        setIp(data.ip);
        setError(null);
      } catch {
        setError("No se pudo obtener la IP");
      }
    };
    fetchIP();
  };

  const copyToClipboard = () => {
    if (!ip) return;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(ip).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = ip;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Copy failed silently
      }
      document.body.removeChild(textArea);
    }
  };

  if (variant === "page") {
    return (
      <div
        style={{
          backgroundImage: "url(/images/bg_qr.webp)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
          minHeight: "100vh",
          minWidth: "100vw",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className={`mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 ${className}`}>
          <div className="rounded-2xl border border-gray-200 bg-white/95 p-8 shadow-2xl backdrop-blur-sm md:p-12">
            <h1 className="mb-6 text-center text-3xl font-bold text-gray-900 md:text-4xl">
              Tu Dirección IP Pública
            </h1>
            <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-8 text-center">
              <h2 className="mb-4 text-lg font-semibold text-gray-700 md:text-xl">
                La IP Pública de esta conexión es:
              </h2>
              <p
                aria-live="polite"
                onClick={copyToClipboard}
                className="mb-4 cursor-pointer select-all font-mono text-4xl font-bold tracking-wider text-blue-600 transition-colors hover:text-blue-700 md:text-5xl"
                title="Clic para copiar"
              >
                {error ? error : ip ?? "Cargando..."}
              </p>
              {ip && !error && (
                <button
                  onClick={copyToClipboard}
                  className="mt-4 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors duration-200 hover:bg-blue-700"
                >
                  {copied ? "✓ Copiada" : "Copiar al portapapeles"}
                </button>
              )}
              {error && (
                <button
                  onClick={handleRetry}
                  className="mt-4 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors duration-200 hover:bg-blue-700"
                >
                  Reintentar
                </button>
              )}
            </div>
            <div className="mt-6 text-center text-sm text-gray-600">
              <p>Esta es la dirección IP desde la cual tu dispositivo se conecta a Internet.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded bg-gradient-to-br from-blue-50 to-indigo-50 p-8 ${className}`}
      style={{ backgroundImage: "url(/images/bg_qr.webp)" }}
    >
      <h2 className="text-lg font-bold text-gray-800">La IP pública de esta conexión es:</h2>
      <p
        aria-live="polite"
        onClick={copyToClipboard}
        className="cursor-pointer text-2xl font-bold text-blue-600 hover:text-blue-700"
        title="Clic para copiar"
      >
        {error ? error : ip ?? "Cargando..."}
      </p>
      {ip && !error && (
        <button
          onClick={copyToClipboard}
          className="mt-2 rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          {copied ? "✓ Copiada" : "Copiar"}
        </button>
      )}
      {error && (
        <button
          onClick={handleRetry}
          className="mt-2 rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          Reintentar
        </button>
      )}
    </div>
  );
}
