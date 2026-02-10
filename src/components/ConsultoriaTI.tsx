import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  CheckCircle,
  Download,
  BarChart3,
  Shield,
  Users,
  Settings,
  Zap,
  FileText,
  Building,
  ChevronDown,
  ChevronRight,
  Server,
  Trash2,
  Plus,
  HelpCircle,
} from "lucide-react";

interface ClienteInfo {
  empresa: string;
  contacto: string;
  email: string;
  telefono: string;
  encuestado: string;
}

interface Sistema {
  id: number;
  nombre: string;
  proceso: string;
  ubicacion: string;
  tipo: string;
  criticidad?: string;
  score?: number;
  rto?: string;
  rpo?: string;
  evaluacion?: Evaluacion;
}

interface Evaluacion {
  operativo: number;
  financiero: number;
  reputacional: number;
  continuidad: number;
  rto: string;
  rpo: string;
}

interface Ponderacion {
  operativo: number;
  financiero: number;
  reputacional: number;
  continuidad: number;
}

interface ChecklistStat {
  total: number;
  completadas: number;
  isComplete: boolean;
  percentage: number;
}

interface QuestionType {
  type: string;
  options?: string[];
}

interface CategoryData {
  title: string;
  icon: React.ReactElement;
  color: string;
  questions: string[];
  questionTypes?: QuestionType[];
}

const ConsultoriaTecnologica = () => {
  // Estados principales
  const [clienteInfo, setClienteInfo] = useState<ClienteInfo>({
    empresa: "",
    contacto: "",
    email: "",
    telefono: "",
    encuestado: "",
  });

  const [responses, setResponses] = useState<Record<string, string>>({});
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string | string[]>>({});
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [clienteInfoExpanded, setClienteInfoExpanded] = useState(true);
  const [clienteInfoCompleted, setClienteInfoCompleted] = useState(false);
  const [showWelcomePopup, setShowWelcomePopup] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Estados para inventario de sistemas
  const [sistemas, setSistemas] = useState<Sistema[]>([]);
  const [nuevoSistema, setNuevoSistema] = useState<Omit<Sistema, "id">>({
    nombre: "",
    proceso: "",
    ubicacion: "",
    tipo: "",
  });
  const [showSistemaForm, setShowSistemaForm] = useState(false);

  // Estados para evaluación de criticidad
  const [ponderacion, setPonderacion] = useState<Ponderacion>({
    operativo: 40,
    financiero: 30,
    reputacional: 20,
    continuidad: 10,
  });
  const [sistemaEvaluar, setSistemaEvaluar] = useState<number | null>(null);
  const [evaluacion, setEvaluacion] = useState<Evaluacion>({
    operativo: 1,
    financiero: 1,
    reputacional: 1,
    continuidad: 1,
    rto: "",
    rpo: "",
  });
  const [showModalCriticidad, setShowModalCriticidad] = useState(false);

  // Envolver categories en useMemo
  const categories = useMemo(
    () => ({
      diagnostico: {
        title: "Diagnóstico Inicial",
        icon: <BarChart3 className="h-6 w-6" />,
        color: "bg-blue-500",
        questions: [
          "¿Qué quieren lograr con la tecnología en su empresa? (ej: crecer, automatizar, reducir costos, mejorar atención al cliente)",
          "¿Sus computadoras, internet y sistemas actuales son suficientes para cuando su negocio crezca?",
          "¿Sus diferentes sistemas se comunican entre sí o cada uno funciona por separado? (ej: las ventas pasan automáticamente a contabilidad)",
          "¿Qué tan seguido tienen problemas técnicos? (computadoras lentas, internet que se cae, programas que fallan)",
        ],
        questionTypes: [
          {
            type: "checkboxes",
            options: [
              "Crecer y expandirse",
              "Automatizar procesos",
              "Reducir costos",
              "Mejorar atención al cliente",
              "Trabajar más rápido",
              "Ser más seguros",
            ],
          },
          {
            type: "radio",
            options: [
              "Sí, es suficiente",
              "Más o menos, necesitamos mejoras",
              "No, necesitamos actualizaciones urgentes",
              "No lo sé",
            ],
          },
          {
            type: "radio",
            options: [
              "Todos están conectados",
              "La mayoría están conectados",
              "Algunos están conectados",
              "Cada uno funciona por separado",
              "No lo sé",
            ],
          },
          {
            type: "radio",
            options: [
              "Nunca o casi nunca",
              "Ocasionalmente (1-2 veces al mes)",
              "Regular (1 vez por semana)",
              "Frecuente (varias veces por semana)",
              "Constantemente (diario)",
            ],
          },
        ],
      },
      seguridad: {
        title: "Seguridad Informática",
        icon: <Shield className="h-6 w-6" />,
        color: "bg-red-500",
        questions: [
          "¿Cómo protegen la información importante de su empresa? (contraseñas, copias de seguridad, quién puede ver qué)",
          "¿Qué les preocupa más sobre seguridad? (que les roben información, virus, hackeos, que se pierdan datos)",
          "¿Qué antivirus o protección tienen instalada en las computadoras?",
          "¿Tienen un sistema de protección de red (firewall) y controles de acceso seguro?",
          "¿Tienen un plan documentado de qué hacer si fallan todos los sistemas o hay una emergencia?",
        ],
        questionTypes: [
          {
            type: "checkboxes",
            options: [
              "Contraseñas seguras",
              "Control de accesos por persona",
              "Copias de seguridad",
              "Revisiones periódicas",
              "No hacemos nada especial",
            ],
          },
          {
            type: "checkboxes",
            options: [
              "Virus y malware",
              "Robo de información",
              "Hackeos o ataques",
              "Pérdida de datos",
              "Acceso no autorizado",
              "Ninguna preocupación",
            ],
          },
          { type: "textarea" },
          { type: "radio", options: ["Sí", "No", "No estoy seguro"] },
          {
            type: "radio",
            options: ["Sí, está documentado", "Tenemos algo básico", "No tenemos plan", "No lo sé"],
          },
        ],
      },
      capacitacion: {
        title: "Capacitación y Gestión de Recursos",
        icon: <Users className="h-6 w-6" />,
        color: "bg-green-500",
        questions: [
          "¿Sus empleados saben usar bien los programas y sistemas que tienen? ¿Les dan cursos o capacitación?",
          "¿Quién les ayuda cuando tienen problemas técnicos? (alguien de la empresa, un proveedor externo, o ambos)",
          "¿Qué tipo de ayuda técnica reciben cuando algo no funciona? (por teléfono, alguien que viene, acceso remoto)",
          "¿Cada cuánto actualizan los programas y renuevan las computadoras?",
          "¿Qué programas de oficina usan? (Microsoft Word/Excel, Google Docs, etc.)",
          "¿Usan programas para trabajar en equipo? (videollamadas, chat, compartir documentos)",
        ],
        questionTypes: [
          {
            type: "radio",
            options: [
              "Sí, están bien capacitados",
              "La mayoría sabe lo básico",
              "Les falta capacitación",
              "No han recibido capacitación",
            ],
          },
          {
            type: "radio",
            options: [
              "Alguien de la empresa",
              "Un proveedor externo",
              "Ambos (interno y externo)",
              "Nadie / Cada quien se las arregla",
            ],
          },
          {
            type: "checkboxes",
            options: [
              "Ayuda por teléfono",
              "Acceso remoto",
              "Técnico que viene",
              "Correo electrónico",
              "Chat en línea",
              "No hay soporte formal",
            ],
          },
          { type: "textarea" },
          {
            type: "radio",
            options: ["Microsoft 365", "Google Workspace", "LibreOffice", "Otro"],
          },
          {
            type: "checkboxes",
            options: [
              "Microsoft Teams",
              "Zoom",
              "Google Meet",
              "Slack",
              "WhatsApp Business",
              "No usamos nada",
            ],
          },
        ],
      },
      implementacion: {
        title: "Implementación y Seguimiento",
        icon: <Settings className="h-6 w-6" />,
        color: "bg-purple-500",
        questions: [
          "¿Cuánto dinero gastan al año en tecnología? (computadoras, programas, internet, mantenimiento)",
          "¿Qué esperan conseguir con esta consultoría? (ahorrar dinero, vender más, trabajar mejor)",
          "¿Cómo deciden si compran o actualizan tecnología? (¿quién decide, cada cuándo revisan?)",
          "¿Hay algún sistema o tecnología que quieran comprar o implementar pronto?",
          "¿Cómo saben si sus programas y sistemas están funcionando bien?",
          "¿Qué tan rápido esperan que les resuelvan los problemas técnicos?",
        ],
        questionTypes: [
          {
            type: "radio",
            options: [
              "Menos de $20,000",
              "$20,000 - $100,000",
              "$100,000 - $500,000",
              "$500,000 - $1,000,000",
              "Más de $1,000,000",
              "No lo sé",
            ],
          },
          {
            type: "checkboxes",
            options: [
              "Ahorrar costos",
              "Vender más",
              "Trabajar más rápido",
              "Mejorar seguridad",
              "Crecer el negocio",
              "Modernizarnos",
            ],
          },
          { type: "textarea" },
          { type: "textarea" },
          {
            type: "radio",
            options: [
              "Llevamos estadísticas y mediciones",
              "Solo vemos si funciona o no",
              "Los empleados nos dicen",
              "No sabemos realmente",
            ],
          },
          {
            type: "radio",
            options: [
              "Inmediato (menos de 2 horas)",
              "El mismo día (menos de 8 horas)",
              "En 24 horas",
              "Puede esperar 2-3 días",
            ],
          },
        ],
      },
      procesos: {
        title: "Procesos y Automatización",
        icon: <Zap className="h-6 w-6" />,
        color: "bg-orange-500",
        questions: [
          "¿Qué tareas repetitivas podrían hacerse automáticamente con software? (facturar, hacer reportes, controlar inventario)",
          "¿Ya hacen algo automático sin intervención humana? ¿Qué y con qué programa?",
          "¿La gente trabaja con programas en internet (nube) o todo está en las computadoras de la oficina?",
          "¿Usan servicios de internet para guardar archivos o trabajar desde casa?",
          "¿Usan datos y estadísticas para tomar decisiones de negocio? (reportes de ventas, gráficas, análisis)",
        ],
        questionTypes: [
          {
            type: "checkboxes",
            options: [
              "Facturación",
              "Control de inventario",
              "Reportes automáticos",
              "Aprobaciones",
              "Notificaciones",
              "Nada aún",
            ],
          },
          { type: "textarea" },
          {
            type: "radio",
            options: [
              "Todo en la nube (internet)",
              "Mayormente en la nube",
              "Mitad y mitad",
              "Mayormente local (oficina)",
              "Todo local (oficina)",
            ],
          },
          {
            type: "checkboxes",
            options: [
              "Guardar archivos en la nube",
              "Trabajo remoto/desde casa",
              "Acceso desde celular",
              "Colaboración en línea",
              "No usamos nada de esto",
            ],
          },
          {
            type: "radio",
            options: [
              "Sí, regularmente usamos datos",
              "A veces revisamos reportes",
              "Solo lo básico",
              "No usamos datos para decidir",
            ],
          },
        ],
      },
    }),
    []
  );

  // Calcular estadísticas con useCallback para usar como dependencia
  const getChecklistStats = useCallback((): Record<string, ChecklistStat> => {
    const stats: Record<string, ChecklistStat> = {};
    Object.entries(categories).forEach(([catKey, catData]) => {
      const total = catData.questions.length;
      let completadas = 0;

      // Una pregunta está completa si tiene respuesta O checkbox marcado
      catData.questions.forEach((_, idx) => {
        const responseKey = `${catKey}_${idx}`;
        const hasResponse = responses[responseKey] || selectedOptions[responseKey];
        if (hasResponse) {
          completadas++;
        }
      });

      stats[catKey] = {
        total,
        completadas,
        isComplete: completadas === total,
        percentage: Math.round((completadas / total) * 100),
      };
    });
    return stats;
  }, [responses, selectedOptions, categories]);

  // Cargar datos desde localStorage
  useEffect(() => {
    try {
      const savedData = localStorage.getItem("consultoriaTI_integrada");
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.clienteInfo) setClienteInfo(parsed.clienteInfo);
        if (parsed.responses) setResponses(parsed.responses);
        if (parsed.selectedOptions) setSelectedOptions(parsed.selectedOptions);
        if (parsed.completed) setCompleted(parsed.completed);
        if (parsed.clienteInfoCompleted !== undefined)
          setClienteInfoCompleted(parsed.clienteInfoCompleted);
        if (parsed.expandedCategories) setExpandedCategories(parsed.expandedCategories);
        if (parsed.sistemas) setSistemas(parsed.sistemas);
        if (parsed.ponderacion) setPonderacion(parsed.ponderacion);
      }
    } catch (error) {
      console.error("Error al cargar datos guardados:", error);
    }
  }, []);

  // Auto-contraer secciones cuando estén completas
  useEffect(() => {
    const stats = getChecklistStats();
    const updatedExpanded = { ...expandedCategories };

    Object.entries(stats).forEach(([catKey, stat]) => {
      if (stat.isComplete && expandedCategories[catKey]) {
        updatedExpanded[catKey] = false;
      }
    });

    if (JSON.stringify(updatedExpanded) !== JSON.stringify(expandedCategories)) {
      setExpandedCategories(updatedExpanded);
    }
  }, [responses, selectedOptions, expandedCategories, getChecklistStats]);

  // Auto-contraer sección de datos del cliente cuando esté completa
  useEffect(() => {
    const isClienteComplete =
      clienteInfo.empresa?.trim() &&
      clienteInfo.contacto?.trim() &&
      clienteInfo.email?.trim() &&
      clienteInfo.telefono?.trim() &&
      clienteInfo.encuestado?.trim();

    if (isClienteComplete && clienteInfoExpanded) {
      setClienteInfoExpanded(false);
      setClienteInfoCompleted(true);
    }
  }, [clienteInfo, clienteInfoExpanded]);

  // Guardar datos en localStorage
  useEffect(() => {
    try {
      const dataToSave = {
        clienteInfo,
        responses,
        selectedOptions,
        completed,
        clienteInfoCompleted,
        expandedCategories,
        sistemas,
        ponderacion,
        lastSaved: new Date().toISOString(),
      };
      localStorage.setItem("consultoriaTI_integrada", JSON.stringify(dataToSave));
      setLastSaved(new Date());
    } catch (error) {
      console.error("Error al guardar datos:", error);
    }
  }, [
    clienteInfo,
    responses,
    selectedOptions,
    completed,
    clienteInfoCompleted,
    expandedCategories,
    sistemas,
    ponderacion,
  ]);

  // Funciones para sistemas
  const agregarSistema = () => {
    if (!nuevoSistema.nombre.trim()) {
      alert("El nombre del sistema es requerido");
      return;
    }
    setSistemas([...sistemas, { ...nuevoSistema, id: Date.now() }]);
    setNuevoSistema({ nombre: "", proceso: "", ubicacion: "", tipo: "" });
    setShowSistemaForm(false);
  };

  const eliminarSistema = (id: number) => {
    if (confirm("¿Eliminar este sistema?")) {
      setSistemas(sistemas.filter((s) => s.id !== id));
    }
  };

  const calcularCriticidad = () => {
    if (sistemaEvaluar === null) return;

    const score =
      evaluacion.operativo * ponderacion.operativo +
      evaluacion.financiero * ponderacion.financiero +
      evaluacion.reputacional * ponderacion.reputacional +
      evaluacion.continuidad * ponderacion.continuidad;

    let criticidad = "No crítico";
    if (score >= 250) criticidad = "Crítico";
    else if (score >= 150) criticidad = "Importante";

    const sistemasActualizados = [...sistemas];
    sistemasActualizados[sistemaEvaluar] = {
      ...sistemasActualizados[sistemaEvaluar],
      criticidad,
      score,
      rto: evaluacion.rto,
      rpo: evaluacion.rpo,
      evaluacion: { ...evaluacion },
    };
    setSistemas(sistemasActualizados);
    setSistemaEvaluar(null);
    setEvaluacion({
      operativo: 1,
      financiero: 1,
      reputacional: 1,
      continuidad: 1,
      rto: "",
      rpo: "",
    });
  };

  const handleClearAllData = () => {
    if (
      confirm(
        "⚠️ ¿Seguro que deseas borrar TODA la información?\n\nEsto incluye:\n• Información del cliente\n• Respuestas del cuestionario\n• Inventario de sistemas\n• Evaluaciones de criticidad\n\nEsta acción NO se puede deshacer."
      )
    ) {
      localStorage.removeItem("consultoriaTI_integrada");
      window.location.reload();
    }
  };

  const generatePDFReport = () => {
    // Verificar que todo esté completo
    if (completedSections !== totalSections || !clienteInfoCompleted || sistemasEvaluados === 0) {
      alert("Por favor, complete todas las secciones antes de generar el reporte.");
      return;
    }

    try {
      // Crear documento HTML para el PDF
      let htmlContent = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reporte Consultoría TI</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 20px;
            }
            h1, h2, h3 {
              color: #1f2937;
              margin-top: 20px;
              margin-bottom: 10px;
              border-bottom: 2px solid #3b82f6;
              padding-bottom: 5px;
            }
            h1 {
              text-align: center;
              font-size: 24px;
            }
            h2 {
              font-size: 18px;
              margin-top: 25px;
            }
            h3 {
              font-size: 16px;
              border: none;
              color: #374151;
            }
            .section {
              margin-bottom: 30px;
              page-break-inside: avoid;
            }
            .client-info {
              background-color: #f3f4f6;
              padding: 15px;
              border-left: 4px solid #3b82f6;
              margin-bottom: 20px;
              border-radius: 4px;
            }
            .info-row {
              margin-bottom: 8px;
              display: grid;
              grid-template-columns: 150px 1fr;
            }
            .info-label {
              font-weight: bold;
              color: #1f2937;
            }
            .question {
              margin-bottom: 15px;
              padding: 10px;
              border-left: 3px solid #d1d5db;
              background-color: #f9fafb;
            }
            .question-text {
              font-weight: 600;
              color: #374151;
              margin-bottom: 5px;
            }
            .answer {
              color: #666;
              margin-left: 15px;
              white-space: pre-wrap;
            }
            .sistemas-table {
              width: 100%;
              border-collapse: collapse;
              margin: 15px 0;
            }
            .sistemas-table th {
              background-color: #3b82f6;
              color: white;
              padding: 10px;
              text-align: left;
              border: 1px solid #ddd;
            }
            .sistemas-table td {
              padding: 10px;
              border: 1px solid #ddd;
            }
            .sistemas-table tr:nth-child(even) {
              background-color: #f3f4f6;
            }
            .criticidad-critico {
              background-color: #fee2e2;
              color: #991b1b;
              font-weight: bold;
              padding: 4px 8px;
              border-radius: 4px;
            }
            .criticidad-importante {
              background-color: #fef3c7;
              color: #92400e;
              font-weight: bold;
              padding: 4px 8px;
              border-radius: 4px;
            }
            .criticidad-normal {
              background-color: #dcfce7;
              color: #15803d;
              font-weight: bold;
              padding: 4px 8px;
              border-radius: 4px;
            }
            .stats {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 15px;
              margin: 20px 0;
            }
            .stat-box {
              background-color: #f3f4f6;
              padding: 15px;
              border-radius: 4px;
              border-left: 4px solid #3b82f6;
            }
            .stat-value {
              font-size: 24px;
              font-weight: bold;
              color: #3b82f6;
            }
            .stat-label {
              color: #666;
              font-size: 12px;
            }
            .page-break {
              page-break-after: always;
            }
            .timestamp {
              text-align: right;
              color: #999;
              font-size: 11px;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <h1>Reporte de Consultoría Tecnológica</h1>

          <div class="client-info">
            <h2 style="border: none; margin-top: 0; color: #3b82f6;">Información del Cliente</h2>
            <div class="info-row"><span class="info-label">Empresa:</span> <span>${clienteInfo.empresa}</span></div>
            <div class="info-row"><span class="info-label">Contacto:</span> <span>${clienteInfo.contacto}</span></div>
            <div class="info-row"><span class="info-label">Email:</span> <span>${clienteInfo.email}</span></div>
            <div class="info-row"><span class="info-label">Teléfono:</span> <span>${clienteInfo.telefono}</span></div>
            <div class="info-row"><span class="info-label">Encuestado:</span> <span>${clienteInfo.encuestado}</span></div>
          </div>

          <div class="stats">
            <div class="stat-box">
              <div class="stat-label">Cuestionario Completado</div>
              <div class="stat-value">${completedSections}/${totalSections}</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">Sistemas Inventariados</div>
              <div class="stat-value">${sistemas.length}</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">Sistemas Críticos</div>
              <div class="stat-value" style="color: #dc2626;">${sistemasCriticos}</div>
            </div>
          </div>

          <div class="page-break"></div>

          <h2>Respuestas del Cuestionario Cualitativo</h2>
      `;

      // Agregar respuestas por categoría
      Object.entries(categories).forEach(([catKey, catData]) => {
        htmlContent += `
          <div class="section">
            <h3>${catData.title}</h3>
        `;

        catData.questions.forEach((question, idx) => {
          const responseKey = `${catKey}_${idx}`;
          const response = responses[responseKey] || "";
          const selectedOpts = selectedOptions[responseKey] || [];

          let answerText = "";
          if (Array.isArray(selectedOpts) && selectedOpts.length > 0) {
            answerText = selectedOpts.join(", ");
            if (response) answerText += "\n\nDetalles: " + response;
          } else if (typeof selectedOpts === "string" && selectedOpts) {
            answerText = selectedOpts;
            if (response) answerText += "\n\nDetalles: " + response;
          } else if (response) {
            answerText = response;
          }

          htmlContent += `
            <div class="question">
              <div class="question-text">${idx + 1}. ${question}</div>
              <div class="answer">${answerText || "(Sin respuesta)"}</div>
            </div>
          `;
        });

        htmlContent += `</div>`;
      });

      htmlContent += `<div class="page-break"></div>`;

      // Agregar inventario de sistemas
      htmlContent += `
        <h2>Inventario de Sistemas y Criticidad</h2>
        <table class="sistemas-table">
          <thead>
            <tr>
              <th>Sistema</th>
              <th>Proceso</th>
              <th>Ubicación</th>
              <th>Criticidad</th>
              <th>Score</th>
              <th>RTO / RPO</th>
            </tr>
          </thead>
          <tbody>
      `;

      sistemas.forEach((sistema) => {
        const criticidadClass =
          sistema.criticidad === "Crítico"
            ? "criticidad-critico"
            : sistema.criticidad === "Importante"
              ? "criticidad-importante"
              : "criticidad-normal";

        htmlContent += `
          <tr>
            <td><strong>${sistema.nombre}</strong></td>
            <td>${sistema.proceso || "-"}</td>
            <td>${sistema.ubicacion || "-"}</td>
            <td><span class="${criticidadClass}">${sistema.criticidad || "No evaluado"}</span></td>
            <td>${sistema.score || "-"}</td>
            <td>${sistema.rto || "-"} / ${sistema.rpo || "-"}</td>
          </tr>
        `;
      });

      htmlContent += `
          </tbody>
        </table>
      `;

      // Agregar evaluación de criticidad
      if (sistemasEvaluados > 0) {
        htmlContent += `
          <div class="page-break"></div>
          <h2>Ponderación de Criticidad</h2>
          <div class="stats">
            <div class="stat-box">
              <div class="stat-label">Impacto Operativo</div>
              <div class="stat-value">${ponderacion.operativo}%</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">Impacto Financiero</div>
              <div class="stat-value">${ponderacion.financiero}%</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">Impacto Reputacional</div>
              <div class="stat-value">${ponderacion.reputacional}%</div>
            </div>
          </div>
          <div class="stats">
            <div class="stat-box">
              <div class="stat-label">Impacto Continuidad</div>
              <div class="stat-value">${ponderacion.continuidad}%</div>
            </div>
          </div>
        `;
      }

      htmlContent += `
        <div class="timestamp">
          Reporte generado el: ${new Date().toLocaleString("es-MX")}
        </div>
      `;

      htmlContent += `
        </body>
        </html>
      `;

      // Crear blob y descargar
      const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `Reporte_ConsultoriaTI_${clienteInfo.empresa?.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.html`;
      link.click();
      URL.revokeObjectURL(link.href);

      // Para imprimir como PDF, abrimos en nueva ventana con print
      const printWindow = window.open("", "", "width=800,height=600");
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 250);
      }
    } catch (error) {
      console.error("Error al generar el reporte:", error);
      alert("Error al generar el reporte. Por favor, intente de nuevo.");
    }
  };

  const checklistStats = getChecklistStats();
  const totalSections = Object.keys(categories).length;
  const completedSections = Object.values(checklistStats).filter((stat) => stat.isComplete).length;
  const overallProgress = Math.round((completedSections / totalSections) * 100);

  const sistemasEvaluados = sistemas.filter((s) => s.criticidad).length;
  const sistemasCriticos = sistemas.filter((s) => s.criticidad === "Crítico").length;

  // Renderizar inputs de preguntas
  const renderQuestionInput = (
    catKey: string,
    catData: CategoryData,
    idx: number,
    responseKey: string
  ) => {
    const questionType = catData.questionTypes?.[idx];

    if (!questionType || questionType.type === "textarea") {
      return (
        <textarea
          className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          value={responses[responseKey] || ""}
          onChange={(e) => setResponses((prev) => ({ ...prev, [responseKey]: e.target.value }))}
          placeholder="Escriba su respuesta aquí..."
          rows={4}
        />
      );
    }

    const selectedOpts = selectedOptions[responseKey];

    if (questionType.type === "checkboxes" && questionType.options) {
      return (
        <div className="space-y-2">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {questionType.options.map((option: string, optIdx: number) => (
              <label
                key={optIdx}
                className="flex cursor-pointer items-center rounded border border-gray-200 p-2 hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={Array.isArray(selectedOpts) && selectedOpts.includes(option)}
                  onChange={() => {
                    const current = Array.isArray(selectedOpts) ? selectedOpts : [];
                    const updated = current.includes(option)
                      ? current.filter((o: string) => o !== option)
                      : [...current, option];
                    setSelectedOptions((prev) => ({ ...prev, [responseKey]: updated }));
                  }}
                  className="mr-2 h-4 w-4 text-blue-600"
                />
                <span className="text-sm text-gray-900">{option}</span>
              </label>
            ))}
          </div>
          <textarea
            className="mt-3 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            value={responses[responseKey] || ""}
            onChange={(e) => setResponses((prev) => ({ ...prev, [responseKey]: e.target.value }))}
            placeholder="Detalles adicionales..."
            rows={2}
          />
        </div>
      );
    }

    if (questionType.type === "radio" && questionType.options) {
      return (
        <div className="space-y-2">
          {questionType.options.map((option: string, optIdx: number) => (
            <label
              key={optIdx}
              className="flex cursor-pointer items-center rounded border border-gray-200 p-2 hover:bg-gray-50"
            >
              <input
                type="radio"
                name={responseKey}
                checked={selectedOpts === option}
                onChange={() => setSelectedOptions((prev) => ({ ...prev, [responseKey]: option }))}
                className="mr-2 h-4 w-4 text-blue-600"
              />
              <span className="text-sm text-gray-900">{option}</span>
            </label>
          ))}
          <textarea
            className="mt-3 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            value={responses[responseKey] || ""}
            onChange={(e) => setResponses((prev) => ({ ...prev, [responseKey]: e.target.value }))}
            placeholder="Detalles adicionales..."
            rows={2}
          />
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      {/* Popup de bienvenida */}
      {showWelcomePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl">
            <div className="p-6">
              <div className="mb-4 flex items-center">
                <div className="mr-4 rounded-full bg-blue-500 p-3 text-white">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Consultoría TI - Sistema Integrado
                  </h2>
                  <p className="text-gray-600">Evaluación completa con análisis de criticidad</p>
                </div>
              </div>

              <div className="mb-6 space-y-3">
                <div className="rounded border-l-4 border-blue-400 bg-blue-50 p-3">
                  <h3 className="mb-1 flex items-center text-sm font-semibold text-blue-800">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Sistema integrado mejorado
                  </h3>
                  <p className="text-xs text-blue-700">
                    Combina cuestionario cualitativo + inventario de sistemas + evaluación
                    cuantitativa de criticidad en una sola herramienta.
                  </p>
                </div>

                <div className="rounded border-l-4 border-green-400 bg-green-50 p-3">
                  <h3 className="mb-1 flex items-center text-sm font-semibold text-green-800">
                    <Server className="mr-2 h-4 w-4" />
                    Inventario de sistemas críticos
                  </h3>
                  <p className="text-xs text-green-700">
                    Identifica sistemas, evalúa su criticidad con ponderación personalizada, y
                    define RTO/RPO para planes de continuidad.
                  </p>
                </div>

                <div className="rounded border-l-4 border-purple-400 bg-purple-50 p-3">
                  <h3 className="mb-1 flex items-center text-sm font-semibold text-purple-800">
                    <Shield className="mr-2 h-4 w-4" />
                    🔒 Privacidad total
                  </h3>
                  <p className="text-xs text-purple-700">
                    Todos los datos se guardan solo en tu navegador. No se envían a ningún servidor.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowWelcomePopup(false)}
                className="w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
              >
                Comenzar evaluación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal explicativo de criticidad */}
      {showModalCriticidad && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-xl font-bold text-gray-800">
              ¿Cómo se calcula la criticidad?
            </h3>
            <div className="space-y-3 text-sm text-gray-700">
              <p>
                <strong>1.</strong> La empresa define una ponderación (%), indicando qué tipo de
                impacto es más relevante para el negocio.
              </p>
              <p>
                <strong>2.</strong> Cada sistema se evalúa con niveles: Bajo (1), Medio (2) o Alto
                (3) para cada tipo de impacto.
              </p>
              <p>
                <strong>3.</strong> Cada impacto se multiplica por su ponderación y se suman todos.
              </p>
              <p>
                <strong>4.</strong> El score total define la criticidad:
              </p>
              <ul className="ml-6 list-disc space-y-1">
                <li>≥ 250 → Crítico (prioridad máxima)</li>
                <li>≥ 150 → Importante (atención requerida)</li>
                <li>&lt; 150 → No crítico (monitoreo regular)</li>
              </ul>
            </div>
            <button
              onClick={() => setShowModalCriticidad(false)}
              className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header principal */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-gray-800">
                Consultoría Tecnológica Integrada
              </h1>
              <p className="text-gray-600">
                Evaluación completa: cuestionario + inventario de sistemas + análisis de criticidad
              </p>
            </div>
            <div className="flex items-center gap-3">
              {lastSaved && (
                <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>
                    {new Date(lastSaved).toLocaleTimeString("es-MX", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              )}
              <button
                onClick={handleClearAllData}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4" />
                Borrar todo
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard de estadísticas */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-white p-4 shadow">
            <div className="text-sm text-gray-600">Progreso General</div>
            <div className="text-2xl font-bold text-blue-600">{overallProgress}%</div>
            <div className="mt-2 h-2 rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-blue-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
          <div className="rounded-lg bg-white p-4 shadow">
            <div className="text-sm text-gray-600">Sistemas Registrados</div>
            <div className="text-2xl font-bold text-green-600">{sistemas.length}</div>
            <div className="text-xs text-gray-500 mt-1">{sistemasEvaluados} evaluados</div>
          </div>
          <div className="rounded-lg bg-white p-4 shadow">
            <div className="text-sm text-gray-600">Sistemas Críticos</div>
            <div className="text-2xl font-bold text-red-600">{sistemasCriticos}</div>
            <div className="text-xs text-gray-500 mt-1">Requieren atención prioritaria</div>
          </div>
          <div className="rounded-lg bg-white p-4 shadow">
            <div className="text-sm text-gray-600">Secciones Completadas</div>
            <div className="text-2xl font-bold text-purple-600">
              {completedSections}/{totalSections}
            </div>
            <div className="text-xs text-gray-500 mt-1">Cuestionario cualitativo</div>
          </div>
        </div>

        {/* Información del Cliente */}
        <div className="mb-8 overflow-hidden rounded-lg bg-white shadow-lg">
          <div
            className="cursor-pointer bg-white p-6 transition-all hover:bg-gray-50"
            onClick={() => setClienteInfoExpanded(!clienteInfoExpanded)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Building className="mr-3 h-8 w-8 text-gray-700" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Información del Cliente</h2>
                  <p className="text-sm text-gray-600">
                    {clienteInfo.empresa || "Complete los datos básicos"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {clienteInfoCompleted && <CheckCircle className="h-8 w-8 text-green-500" />}
                {clienteInfoExpanded ? (
                  <ChevronDown className="h-6 w-6 text-gray-400" />
                ) : (
                  <ChevronRight className="h-6 w-6 text-gray-400" />
                )}
              </div>
            </div>
          </div>

          {clienteInfoExpanded && (
            <div className="border-t border-gray-100 p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Empresa *</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2"
                    value={clienteInfo.empresa}
                    onChange={(e) =>
                      setClienteInfo((prev) => ({ ...prev, empresa: e.target.value }))
                    }
                    placeholder="Nombre de la empresa"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Contacto *</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2"
                    value={clienteInfo.contacto}
                    onChange={(e) =>
                      setClienteInfo((prev) => ({ ...prev, contacto: e.target.value }))
                    }
                    placeholder="Nombre del contacto"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Email *</label>
                  <input
                    type="email"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2"
                    value={clienteInfo.email}
                    onChange={(e) => setClienteInfo((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="correo@empresa.com"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Teléfono *</label>
                  <input
                    type="tel"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2"
                    value={clienteInfo.telefono}
                    onChange={(e) =>
                      setClienteInfo((prev) => ({ ...prev, telefono: e.target.value }))
                    }
                    placeholder="+52 999 123 4567"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Encuestado(s) *
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2"
                    value={clienteInfo.encuestado}
                    onChange={(e) =>
                      setClienteInfo((prev) => ({ ...prev, encuestado: e.target.value }))
                    }
                    placeholder="Nombres de quien respondió"
                  />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-end">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={clienteInfoCompleted}
                    onChange={(e) => setClienteInfoCompleted(e.target.checked)}
                    className="mr-2 h-5 w-5 text-green-600"
                  />
                  <span className="text-sm text-gray-700">Información completada</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* NUEVA SECCIÓN: Inventario de Sistemas */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center">
              <Server className="mr-3 h-8 w-8 text-blue-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Inventario de Sistemas</h2>
                <p className="text-sm text-gray-600">
                  Registre todos los sistemas que usa la empresa
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowSistemaForm(!showSistemaForm)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Agregar sistema
            </button>
          </div>

          {showSistemaForm && (
            <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="mb-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Nombre del sistema *
                  </label>
                  <input
                    type="text"
                    className="w-full rounded border border-gray-300 px-3 py-2"
                    value={nuevoSistema.nombre}
                    onChange={(e) =>
                      setNuevoSistema((prev) => ({ ...prev, nombre: e.target.value }))
                    }
                    placeholder="Ej: Excel inventarios, SAP, Salesforce"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Proceso que soporta
                  </label>
                  <input
                    type="text"
                    className="w-full rounded border border-gray-300 px-3 py-2"
                    value={nuevoSistema.proceso}
                    onChange={(e) =>
                      setNuevoSistema((prev) => ({ ...prev, proceso: e.target.value }))
                    }
                    placeholder="Ej: Control de inventarios, Ventas"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Ubicación</label>
                  <input
                    type="text"
                    className="w-full rounded border border-gray-300 px-3 py-2"
                    value={nuevoSistema.ubicacion}
                    onChange={(e) =>
                      setNuevoSistema((prev) => ({ ...prev, ubicacion: e.target.value }))
                    }
                    placeholder="Ej: PC, Nube, Servidor local"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Tipo de sistema
                  </label>
                  <select
                    className="w-full rounded border border-gray-300 px-3 py-2"
                    value={nuevoSistema.tipo}
                    onChange={(e) => setNuevoSistema((prev) => ({ ...prev, tipo: e.target.value }))}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="ERP">ERP</option>
                    <option value="CRM">CRM</option>
                    <option value="Financiero">Financiero</option>
                    <option value="Inventario">Inventario</option>
                    <option value="RRHH">Recursos Humanos</option>
                    <option value="Productividad">Productividad</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={agregarSistema}
                  className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Guardar sistema
                </button>
                <button
                  onClick={() => setShowSistemaForm(false)}
                  className="rounded bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {sistemas.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center text-gray-500">
              No hay sistemas registrados. Haga clic en &quot;Agregar sistema&quot; para comenzar.
            </div>
          ) : (
            <div className="space-y-2">
              {sistemas.map((sistema) => (
                <div
                  key={sistema.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-3 hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-800">{sistema.nombre}</h3>
                      {sistema.criticidad && (
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            sistema.criticidad === "Crítico"
                              ? "bg-red-100 text-red-800"
                              : sistema.criticidad === "Importante"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                          }`}
                        >
                          {sistema.criticidad}
                          {sistema.score && ` (${sistema.score})`}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-sm text-gray-600">
                      {sistema.proceso && <span>• {sistema.proceso}</span>}
                      {sistema.ubicacion && <span className="ml-3">📍 {sistema.ubicacion}</span>}
                      {sistema.tipo && <span className="ml-3">🏷️ {sistema.tipo}</span>}
                    </div>
                    {sistema.rto && sistema.rpo && (
                      <div className="mt-1 text-xs text-gray-500">
                        RTO: {sistema.rto} | RPO: {sistema.rpo}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!sistema.criticidad && (
                      <button
                        onClick={() => setSistemaEvaluar(sistemas.indexOf(sistema))}
                        className="rounded bg-purple-600 px-3 py-1 text-sm text-white hover:bg-purple-700"
                      >
                        Evaluar
                      </button>
                    )}
                    <button
                      onClick={() => eliminarSistema(sistema.id)}
                      className="rounded p-2 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* NUEVA SECCIÓN: Evaluación de Criticidad */}
        {sistemaEvaluar !== null && (
          <div className="mb-8 rounded-lg border-2 border-purple-500 bg-purple-50 p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Evaluando: {sistemas[sistemaEvaluar].nombre}
                </h2>
                <p className="text-sm text-gray-600">
                  Defina el impacto en caso de falla de este sistema
                </p>
              </div>
              <button
                onClick={() => setShowModalCriticidad(true)}
                className="flex items-center gap-2 text-purple-600 hover:text-purple-800"
              >
                <HelpCircle className="h-5 w-5" />
                <span className="text-sm">¿Cómo funciona?</span>
              </button>
            </div>

            {/* Ponderación empresarial */}
            <div className="mb-6 rounded-lg border border-purple-200 bg-white p-4">
              <h3 className="mb-3 font-semibold text-gray-800">
                Ponderación de la empresa (aplica a todos los sistemas)
              </h3>
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <label className="text-sm text-gray-700">Impacto Operativo (%)</label>
                  <input
                    type="number"
                    className="w-full rounded border border-gray-300 px-3 py-2"
                    value={ponderacion.operativo}
                    onChange={(e) =>
                      setPonderacion((prev) => ({ ...prev, operativo: +e.target.value }))
                    }
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-700">Impacto Financiero (%)</label>
                  <input
                    type="number"
                    className="w-full rounded border border-gray-300 px-3 py-2"
                    value={ponderacion.financiero}
                    onChange={(e) =>
                      setPonderacion((prev) => ({ ...prev, financiero: +e.target.value }))
                    }
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-700">Impacto Reputacional (%)</label>
                  <input
                    type="number"
                    className="w-full rounded border border-gray-300 px-3 py-2"
                    value={ponderacion.reputacional}
                    onChange={(e) =>
                      setPonderacion((prev) => ({ ...prev, reputacional: +e.target.value }))
                    }
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-700">Impacto Continuidad (%)</label>
                  <input
                    type="number"
                    className="w-full rounded border border-gray-300 px-3 py-2"
                    value={ponderacion.continuidad}
                    onChange={(e) =>
                      setPonderacion((prev) => ({ ...prev, continuidad: +e.target.value }))
                    }
                    min="0"
                    max="100"
                  />
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                Total:{" "}
                {ponderacion.operativo +
                  ponderacion.financiero +
                  ponderacion.reputacional +
                  ponderacion.continuidad}
                %
                {ponderacion.operativo +
                  ponderacion.financiero +
                  ponderacion.reputacional +
                  ponderacion.continuidad !==
                  100 && <span className="ml-2 text-red-600">(Debe sumar 100%)</span>}
              </div>
            </div>

            {/* Evaluación del sistema */}
            <div className="mb-6 grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Impacto Operativo
                </label>
                <select
                  className="w-full rounded border border-gray-300 px-3 py-2"
                  value={evaluacion.operativo}
                  onChange={(e) =>
                    setEvaluacion((prev) => ({ ...prev, operativo: +e.target.value }))
                  }
                >
                  <option value="1">Bajo (1)</option>
                  <option value="2">Medio (2)</option>
                  <option value="3">Alto (3)</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Impacto Financiero
                </label>
                <select
                  className="w-full rounded border border-gray-300 px-3 py-2"
                  value={evaluacion.financiero}
                  onChange={(e) =>
                    setEvaluacion((prev) => ({ ...prev, financiero: +e.target.value }))
                  }
                >
                  <option value="1">Bajo (1)</option>
                  <option value="2">Medio (2)</option>
                  <option value="3">Alto (3)</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Impacto Reputacional
                </label>
                <select
                  className="w-full rounded border border-gray-300 px-3 py-2"
                  value={evaluacion.reputacional}
                  onChange={(e) =>
                    setEvaluacion((prev) => ({ ...prev, reputacional: +e.target.value }))
                  }
                >
                  <option value="1">Bajo (1)</option>
                  <option value="2">Medio (2)</option>
                  <option value="3">Alto (3)</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Impacto Continuidad
                </label>
                <select
                  className="w-full rounded border border-gray-300 px-3 py-2"
                  value={evaluacion.continuidad}
                  onChange={(e) =>
                    setEvaluacion((prev) => ({ ...prev, continuidad: +e.target.value }))
                  }
                >
                  <option value="1">Bajo (1)</option>
                  <option value="2">Medio (2)</option>
                  <option value="3">Alto (3)</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  RTO (Recovery Time Objective)
                </label>
                <input
                  type="text"
                  className="w-full rounded border border-gray-300 px-3 py-2"
                  value={evaluacion.rto}
                  onChange={(e) => setEvaluacion((prev) => ({ ...prev, rto: e.target.value }))}
                  placeholder="Ej: 4 horas, 1 día"
                />
                <p className="mt-1 text-xs text-gray-500">Tiempo máximo sin el sistema</p>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  RPO (Recovery Point Objective)
                </label>
                <input
                  type="text"
                  className="w-full rounded border border-gray-300 px-3 py-2"
                  value={evaluacion.rpo}
                  onChange={(e) => setEvaluacion((prev) => ({ ...prev, rpo: e.target.value }))}
                  placeholder="Ej: 1 día, 1 semana"
                />
                <p className="mt-1 text-xs text-gray-500">Pérdida máxima de datos aceptable</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={calcularCriticidad}
                className="rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700"
              >
                Calcular criticidad
              </button>
              <button
                onClick={() => setSistemaEvaluar(null)}
                className="rounded-lg bg-gray-300 px-6 py-3 text-gray-700 hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Cuestionario Cualitativo */}
        <div className="space-y-6">
          {Object.entries(categories).map(([catKey, catData]) => {
            const stats = checklistStats[catKey];
            const isExpanded = expandedCategories[catKey];

            return (
              <div key={catKey} className="overflow-hidden rounded-lg bg-white shadow-lg">
                <div
                  className={`cursor-pointer p-6 transition-all ${
                    stats.isComplete
                      ? "border-l-4 border-green-500 bg-green-50"
                      : "bg-white hover:bg-gray-50"
                  }`}
                  onClick={() =>
                    setExpandedCategories((prev) => ({ ...prev, [catKey]: !prev[catKey] }))
                  }
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`${catData.color} mr-4 rounded-full p-3 text-white`}>
                        {catData.icon}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-800">{catData.title}</h2>
                        <p className="text-sm text-gray-600">
                          {stats.completadas}/{stats.total} completadas ({stats.percentage}%)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {stats.isComplete && <CheckCircle className="h-8 w-8 text-green-500" />}
                      {isExpanded ? (
                        <ChevronDown className="h-6 w-6 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-100 p-6">
                    <div className="space-y-6">
                      {catData.questions.map((question, idx) => {
                        const responseKey = `${catKey}_${idx}`;
                        const selectedOpts = selectedOptions[responseKey];
                        const hasResponse =
                          responses[responseKey] ||
                          selectedOpts ||
                          (Array.isArray(selectedOpts) && selectedOpts.length > 0);

                        return (
                          <div
                            key={idx}
                            className={`border-l-4 pl-6 transition-all ${
                              hasResponse ? "border-green-500 bg-green-50" : "border-gray-200"
                            }`}
                          >
                            <div className="mb-3 flex items-start justify-between">
                              <label className="block flex-1 pr-4 text-sm font-medium text-gray-700">
                                {idx + 1}. {question}
                              </label>
                              {hasResponse && (
                                <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-500" />
                              )}
                            </div>
                            {renderQuestionInput(catKey, catData, idx, responseKey)}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer con resumen */}
        <div className="mt-8 rounded-lg bg-white p-6 shadow-lg">
          <h3 className="mb-4 text-xl font-bold text-gray-800">Resumen de la Evaluación</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-blue-50 p-4">
              <div className="text-sm text-gray-600">Cuestionario</div>
              <div className="text-2xl font-bold text-blue-600">
                {completedSections}/{totalSections}
              </div>
              <div className="text-sm text-gray-600">secciones completadas</div>
            </div>
            <div className="rounded-lg bg-green-50 p-4">
              <div className="text-sm text-gray-600">Inventario</div>
              <div className="text-2xl font-bold text-green-600">{sistemas.length}</div>
              <div className="text-sm text-gray-600">sistemas ({sistemasEvaluados} evaluados)</div>
            </div>
            <div className="rounded-lg bg-red-50 p-4">
              <div className="text-sm text-gray-600">Criticidad</div>
              <div className="text-2xl font-bold text-red-600">{sistemasCriticos}</div>
              <div className="text-sm text-gray-600">sistemas críticos</div>
            </div>
          </div>

          <div className="mt-6 rounded-lg border-2 border-gray-200 bg-gray-50 p-4">
            <p className="mb-4 text-center text-sm text-gray-700">
              {completedSections === totalSections && clienteInfoCompleted && sistemasEvaluados > 0
                ? "✅ Evaluación completa. Puede generar el reporte."
                : "⚠️ Complete todas las secciones para generar un reporte integral."}
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={generatePDFReport}
                disabled={
                  completedSections !== totalSections ||
                  !clienteInfoCompleted ||
                  sistemasEvaluados === 0
                }
                className={`flex items-center gap-2 rounded-lg px-6 py-3 font-semibold text-white transition-all ${
                  completedSections === totalSections &&
                  clienteInfoCompleted &&
                  sistemasEvaluados > 0
                    ? "cursor-pointer bg-green-600 hover:bg-green-700"
                    : "cursor-not-allowed bg-gray-400"
                }`}
              >
                <Download className="h-5 w-5" />
                Generar Reporte PDF/HTML
              </button>
              <button
                onClick={() =>
                  localStorage.getItem("consultoriaTI_integrada") &&
                  lastSaved &&
                  alert(
                    "Datos guardados automáticamente en tu navegador.\n\nÚltima actualización: " +
                      new Date(lastSaved).toLocaleString("es-MX")
                  )
                }
                className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
              >
                <FileText className="h-5 w-5" />
                Ver estado de guardado
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultoriaTecnologica;
