"use client";

import { useState, useEffect } from "react";

export default function GenPass() {
  // Estados de las opciones
  const [length, setLength] = useState<number>(19);
  const [includeLowercase, setIncludeLowercase] = useState<boolean>(true);
  const [includeUppercase, setIncludeUppercase] = useState<boolean>(true);
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(true);
  const [includeSymbols, setIncludeSymbols] = useState<boolean>(true);
  const [autoSecure, setAutoSecure] = useState<boolean>(true);
  const [password, setPassword] = useState<string>("");
  const [customPattern, setCustomPattern] = useState<string>("");
  const [patternPosition, setPatternPosition] = useState<"start" | "middle" | "end">("start");
  const [patternMode, setPatternMode] = useState<"included" | "additional">("additional");
  const [copied, setCopied] = useState(false);

  // Grupos de caracteres
  const LOWER = "abcdefghijklmnopqrstuvwxyz";
  const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const NUMBERS = "0123456789";
  const SYMBOLS = "!@#$%^*()_+-=[]{};:,.?";

  const generatePassword = () => {
    let forcedChars: string[] = [];
    let charsPool = "";
    const patternLength = customPattern.length;
    const effectiveLength = autoSecure ? Math.max(length, 19) : length;

    // Calcular longitud de la parte aleatoria según el modo
    let randomPartLength: number;
    if (customPattern && patternMode === "additional") {
      // Modo adicional: la longitud NO incluye el patrón
      randomPartLength = effectiveLength;
    } else {
      // Modo incluido: la longitud SÍ incluye el patrón
      randomPartLength = Math.max(effectiveLength - patternLength, 0);
    }

    if (autoSecure) {
      charsPool = LOWER + UPPER + NUMBERS + SYMBOLS;
      forcedChars.push(LOWER[Math.floor(Math.random() * LOWER.length)]);
      forcedChars.push(UPPER[Math.floor(Math.random() * UPPER.length)]);
      forcedChars.push(NUMBERS[Math.floor(Math.random() * NUMBERS.length)]);
      forcedChars.push(SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
    } else {
      if (includeLowercase) {
        charsPool += LOWER;
        forcedChars.push(LOWER[Math.floor(Math.random() * LOWER.length)]);
      }
      if (includeUppercase) {
        charsPool += UPPER;
        forcedChars.push(UPPER[Math.floor(Math.random() * UPPER.length)]);
      }
      if (includeNumbers) {
        charsPool += NUMBERS;
        forcedChars.push(NUMBERS[Math.floor(Math.random() * NUMBERS.length)]);
      }
      if (includeSymbols) {
        charsPool += SYMBOLS;
        forcedChars.push(SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
      }
    }

    if (charsPool.length === 0) {
      setPassword("Seleccione al menos una opción");
      return;
    }

    if (randomPartLength < forcedChars.length) {
      setPassword(
        `La longitud mínima debe ser al menos ${forcedChars.length + (patternMode === "included" ? patternLength : 0)} para incluir ${patternMode === "included" ? "el patrón y " : ""}todas las categorías seleccionadas.`
      );
      return;
    }

    let passwordArray = [...forcedChars];

    for (let i = forcedChars.length; i < randomPartLength; i++) {
      const index = Math.floor(Math.random() * charsPool.length);
      passwordArray.push(charsPool[index]);
    }

    for (let i = passwordArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
    }

    let randomPart = passwordArray.join("");

    // Insertar el patrón según la posición elegida
    let finalPassword = "";
    if (customPattern) {
      if (patternPosition === "start") {
        finalPassword = customPattern + randomPart;
      } else if (patternPosition === "end") {
        finalPassword = randomPart + customPattern;
      } else if (patternPosition === "middle") {
        const midPoint = Math.floor(randomPart.length / 2);
        finalPassword = randomPart.slice(0, midPoint) + customPattern + randomPart.slice(midPoint);
      }
    } else {
      finalPassword = randomPart;
    }

    setPassword(finalPassword);
  };

  useEffect(() => {
    generatePassword();
  }, [
    autoSecure,
    length,
    includeLowercase,
    includeUppercase,
    includeNumbers,
    includeSymbols,
    customPattern,
    patternPosition,
    patternMode,
  ]);

  const handleLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = Number(e.target.value);
    if (autoSecure) {
      setLength(Math.max(newVal, 19));
    } else {
      setLength(newVal);
    }
  };

  const handleAutoSecureChange = () => {
    const newAutoSecure = !autoSecure;
    setAutoSecure(newAutoSecure);
    if (newAutoSecure) {
      setIncludeLowercase(true);
      setIncludeUppercase(true);
      setIncludeNumbers(true);
      setIncludeSymbols(true);
      setLength(19);
      setCustomPattern(""); // Limpiar patrón cuando se activa modo seguro
    }
  };

  const copyToClipboard = () => {
    if (!password) return;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(password).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = password;
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
        color: "white",
      }}
    >
      <div className="mx-auto mt-28 flex w-full max-w-6xl flex-col gap-6 px-4 lg:flex-row">
        {/* Columna izquierda: Opciones */}
        <div className="flex w-full flex-col space-y-4 rounded-xl border bg-white p-6 text-black shadow-md lg:w-1/2">
          {/* Auto Secure Option */}
          <div className="mb-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={autoSecure}
                onChange={handleAutoSecureChange}
                className="mr-3 h-6 w-6 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-lg font-semibold">Contraseña segura automática</span>
            </div>
            <p className="ml-9 mt-2 text-sm text-gray-600">
              Genera una contraseña de 19 caracteres con todos los tipos de caracteres activados.
            </p>
          </div>

          {/* Manual Options */}
          <label className="mb-4 block text-lg">
            Longitud:
            <input
              type="number"
              min={autoSecure ? 19 : 8}
              max={32}
              value={length}
              onChange={handleLengthChange}
              className="ml-2 w-24 rounded border px-4 py-2 text-xl"
            />
          </label>

          {/* Checkbox Options */}
          <div className="mb-4">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeLowercase}
                  onChange={() => setIncludeLowercase(!includeLowercase)}
                  disabled={autoSecure}
                  className="mr-2 h-5 w-5 text-blue-600 focus:ring-blue-500"
                />
                <span>Incluir minúsculas</span>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeUppercase}
                  onChange={() => setIncludeUppercase(!includeUppercase)}
                  disabled={autoSecure}
                  className="mr-2 h-5 w-5 text-blue-600 focus:ring-blue-500"
                />
                <span>Incluir mayúsculas</span>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeNumbers}
                  onChange={() => setIncludeNumbers(!includeNumbers)}
                  disabled={autoSecure}
                  className="mr-2 h-5 w-5 text-blue-600 focus:ring-blue-500"
                />
                <span>Incluir números</span>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeSymbols}
                  onChange={() => setIncludeSymbols(!includeSymbols)}
                  disabled={autoSecure}
                  className="mr-2 h-5 w-5 text-blue-600 focus:ring-blue-500"
                />
                <span>Incluir símbolos</span>
              </div>
            </div>
          </div>

          {/* Custom Pattern Section */}
          <div className="mt-4 border-t border-gray-300 pt-4">
            <label className="mb-3 block text-lg font-semibold">
              Patrón personalizado (opcional)
            </label>

            <input
              type="text"
              value={customPattern}
              onChange={(e) => setCustomPattern(e.target.value)}
              placeholder="Ej: UC2024, MiEmpresa, etc."
              disabled={autoSecure}
              className="mb-3 w-full rounded border px-4 py-2 text-lg disabled:cursor-not-allowed disabled:bg-gray-200"
            />

            {customPattern && !autoSecure && (
              <div className="mt-3">
                <label className="mb-2 block text-sm font-semibold">Modo de longitud:</label>
                <div className="mb-4 flex flex-col space-y-2">
                  <label className="flex items-start">
                    <input
                      type="radio"
                      name="patternMode"
                      value="additional"
                      checked={patternMode === "additional"}
                      onChange={(e) => setPatternMode(e.target.value as "included" | "additional")}
                      className="mr-2 mt-1 h-4 w-4 text-blue-600"
                    />
                    <span>
                      <strong>Adicional al patrón</strong>
                      <span className="ml-0 block text-sm text-gray-600">
                        (Longitud: {length} + {customPattern.length} ={" "}
                        {length + customPattern.length} caracteres)
                      </span>
                    </span>
                  </label>
                  <label className="flex items-start">
                    <input
                      type="radio"
                      name="patternMode"
                      value="included"
                      checked={patternMode === "included"}
                      onChange={(e) => setPatternMode(e.target.value as "included" | "additional")}
                      className="mr-2 mt-1 h-4 w-4 text-blue-600"
                    />
                    <span>
                      <strong>Incluye el patrón</strong>
                      <span className="ml-0 block text-sm text-gray-600">
                        (Longitud total: {length} caracteres)
                      </span>
                    </span>
                  </label>
                </div>

                <label className="mb-2 block text-sm font-semibold">Posición del patrón:</label>
                <div className="flex flex-col space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="patternPosition"
                      value="start"
                      checked={patternPosition === "start"}
                      onChange={(e) =>
                        setPatternPosition(e.target.value as "start" | "middle" | "end")
                      }
                      className="mr-2 h-4 w-4 text-blue-600"
                    />
                    <span>Al inicio (Ej: {customPattern}Abc123!@)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="patternPosition"
                      value="middle"
                      checked={patternPosition === "middle"}
                      onChange={(e) =>
                        setPatternPosition(e.target.value as "start" | "middle" | "end")
                      }
                      className="mr-2 h-4 w-4 text-blue-600"
                    />
                    <span>Al centro (Ej: Abc{customPattern}123!@)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="patternPosition"
                      value="end"
                      checked={patternPosition === "end"}
                      onChange={(e) =>
                        setPatternPosition(e.target.value as "start" | "middle" | "end")
                      }
                      className="mr-2 h-4 w-4 text-blue-600"
                    />
                    <span>Al final (Ej: Abc123!@{customPattern})</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Columna derecha: Resultado */}
        <div className="flex w-full flex-col items-center justify-center space-y-4 rounded-xl border bg-white p-6 text-black shadow-md lg:w-1/2">
          {/* Generate Button */}
          <button
            onClick={generatePassword}
            className="w-full rounded-xl bg-blue-600 px-6 py-3 text-lg font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Generar
          </button>

          {/* Generated Password Display */}
          {password ? (
            <div className="w-full">
              <div
                className="cursor-pointer select-all break-all rounded-xl bg-gray-700 p-6 text-center font-mono text-xl text-white transition-colors hover:bg-gray-600"
                onClick={copyToClipboard}
                title="Clic para copiar"
              >
                {password}
              </div>
              <button
                onClick={copyToClipboard}
                className="mt-4 w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors duration-200 hover:bg-blue-700"
              >
                {copied ? "✓ Copiada" : "Copiar al portapapeles"}
              </button>
            </div>
          ) : (
            <div className="py-12 text-center text-gray-400">
              <p className="text-lg">La contraseña generada aparecerá aquí</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
