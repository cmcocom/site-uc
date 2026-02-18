"use client";

import React, { useState } from "react";
import { Linkedin } from "lucide-react";

interface SocialLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
}

interface InfoItemProps {
  label: string;
  value: React.ReactNode;
}

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const SectionCard: React.FC<SectionCardProps> = ({ title, children, className = "" }) => (
  <div className={`rounded-xl bg-white p-8 shadow-lg ${className}`}>
    <h2 className="mb-6 border-b border-blue-200 pb-2 text-2xl font-bold text-blue-900">
      {title}
    </h2>
    {children}
  </div>
);

export default function CmCocom() {
  const [activeTab, setActiveTab] = useState(0);

  const enfoques = [
    {
      titulo: "Consultoría Estratégica de TI",
      descripcion:
        "Realizo diagnósticos tecnológicos profundos que van más allá del inventario de equipos. Analizo la infraestructura completa, identifico vulnerabilidades de seguridad, evalúo procesos y diseño roadmaps tecnológicos alineados a objetivos de negocio. He desarrollado metodologías propias basadas en ITIL v4 para la gestión de servicios empresariales.",
      items: [
        "Auditorías de infraestructura IT completas",
        "Evaluación de madurez tecnológica organizacional",
        "Diseño de arquitecturas empresariales escalables",
        "Planes de contingencia y recuperación ante desastres",
        "Optimización de costos operativos tecnológicos",
      ],
    },
    {
      titulo: "Desarrollo de Software Empresarial",
      descripcion:
        "Creo aplicaciones web robustas y sistemas a medida utilizando el stack tecnológico más moderno y probado. Desde sistemas de gestión médica hasta plataformas de consultoría interactivas, cada proyecto está diseñado con arquitectura limpia, escalabilidad y experiencia de usuario en mente.",
      stack: {
        Frontend: "Next.js 15, React 19, TypeScript, Tailwind CSS 4",
        Backend: "Node.js, API REST, Prisma ORM",
        "Bases de Datos": "PostgreSQL, MySQL, SQL Server",
        Autenticación: "NextAuth, Auth0, OAuth 2.0",
        DevOps: "Git, GitHub, Cloudflare Pages, Vercel",
      },
      items: [
        "Sistemas de inventarios y gestión de activos",
        "Plataformas de ticketing y helpdesk (ITIL compliant)",
        "Sistemas de usuarios con roles y permisos granulares",
        "Herramientas de diagnóstico y auditoría automatizada",
        "Generadores de reportes y documentación en PDF",
        "Dashboards ejecutivos con métricas en tiempo real",
      ],
    },
    {
      titulo: "Ciberseguridad y Análisis Forense",
      descripcion:
        "La seguridad no es una característica opcional, es un requisito fundamental. Realizo auditorías de seguridad exhaustivas, análisis de red con herramientas especializadas como Wireshark, y diagnósticos de equipos potencialmente comprometidos.",
      items: [
        "Auditorías de seguridad perimetral e interna",
        "Análisis de tráfico de red y detección de anomalías",
        "Evaluación de vulnerabilidades en aplicaciones web",
        "Diagnóstico de dispositivos móviles comprometidos",
        "Implementación de protocolos de seguridad empresarial",
        "Capacitación en ciberseguridad para equipos",
      ],
    },
    {
      titulo: "Cloud Computing y Modernización",
      descripcion:
        "Ayudo a empresas a migrar y optimizar su infraestructura en la nube, evaluando las mejores opciones según sus necesidades específicas: AWS, Azure, Google Cloud o soluciones híbridas.",
      items: [
        "Evaluación y diseño de arquitecturas cloud",
        "Migración de sistemas legacy a plataformas modernas",
        "Implementación de soluciones SaaS personalizadas",
        "Optimización de costos en infraestructura cloud",
        "Estrategias de backup y recuperación en la nube",
      ],
    },
    {
      titulo: "Gestión de Servicios IT (ITSM)",
      descripcion:
        "Implemento sistemas de gestión de activos y servicios IT siguiendo las mejores prácticas de ITIL. Desde la implementación de GLPI (open source) hasta soluciones empresariales completas, estructuro departamentos de IT de manera profesional y escalable.",
      items: [
        "Gestión de activos hardware y software (CMDB)",
        "Sistemas de ticketing y seguimiento de incidentes",
        "Control de contratos, garantías y proveedores",
        "Automatización de procesos y workflows",
        "Reportes ejecutivos y KPIs de IT",
      ],
    },
  ];

  const metodologia = [
    { paso: "1", titulo: "Diagnóstico Profundo", icono: "🔍", desc: "Análisis exhaustivo de la situación actual, identificación de pain points y oportunidades de mejora." },
    { paso: "2", titulo: "Diseño Estratégico", icono: "📐", desc: "Propuesta de soluciones basadas en mejores prácticas internacionales, adaptadas a la realidad del cliente." },
    { paso: "3", titulo: "Implementación Ágil", icono: "⚡", desc: "Desarrollo iterativo con entregables frecuentes y ajustes basados en feedback continuo." },
    { paso: "4", titulo: "Documentación Completa", icono: "📚", desc: "Manuales técnicos, guías de usuario y transferencia de conocimiento al equipo del cliente." },
    { paso: "5", titulo: "Soporte y Evolución", icono: "🔄", desc: "Acompañamiento continuo, actualizaciones y optimización basada en métricas reales." },
  ];

  const proyectos = [
    { sector: "Sector Salud", desc: "Sistemas de gestión de insumos médicos con control de solicitudes por turnos y generación automatizada de reportes." },
    { sector: "Consultoría", desc: "Plataformas interactivas para diagnósticos empresariales con generación dinámica de PDFs y evaluaciones multi-categoría." },
    { sector: "Empresas", desc: "Sistemas CRUD completos con gestión multi-tenant, roles jerárquicos y auditoría de cambios." },
    { sector: "Infraestructura", desc: "Auditorías técnicas de infraestructura IT, levantamiento de inventarios y diseño de mejoras estructurales." },
    { sector: "Seguridad", desc: "Análisis forenses de equipos comprometidos, auditorías de red y protocolos de protección de datos." },
  ];

  const expertise = [
    "Consultoría TI Estratégica",
    "Desarrollo Web Full-Stack",
    "Ciberseguridad y Auditoría",
    "Cloud Computing y Modernización",
    "Gestión de Servicios IT (ITIL)",
    "Soluciones Empresariales a Medida",
    "Transformación Digital",
    "Análisis Forense y Diagnóstico",
  ];

  const porqueYo = [
    { label: "Experiencia Comprobada", desc: "27+ años resolviendo desafíos tecnológicos reales" },
    { label: "Enfoque Integral", desc: "No solo código, estrategia de negocio con tecnología" },
    { label: "Metodologías Probadas", desc: "ITIL, desarrollo ágil y mejores prácticas internacionales" },
    { label: "Stack Moderno", desc: "Tecnologías actuales y preparadas para el futuro" },
    { label: "Compromiso Local", desc: "Basado en Mérida, con alcance global" },
    { label: "Visión Práctica", desc: "Soluciones que funcionan en el mundo real, no solo en teoría" },
  ];

  const hobbies = [
    { icono: "🏀", nombre: "Basquetbol", desc: "La estrategia de equipo aplicada a proyectos tecnológicos" },
    { icono: "🔨", nombre: "Carpintería", desc: "La precisión y el detalle que llevo a cada línea de código" },
    { icono: "📚", nombre: "Lectura", desc: "Aprendizaje continuo sobre tecnología, negocios y desarrollo personal" },
    { icono: "🎵", nombre: "Música", desc: "El ritmo y la armonía que busco en cada solución diseñada" },
    { icono: "💻", nombre: "Tecnología", desc: "Mi pasión de toda la vida que se renueva cada día" },
  ];

  const necesidades = [
    "Un diagnóstico profesional de su infraestructura tecnológica",
    "Modernizar sistemas legacy que frenan el crecimiento",
    "Fortalecer su ciberseguridad y protección de datos",
    "Desarrollar un sistema a medida que se adapte a procesos específicos",
    "Migrar a la nube de manera segura y eficiente",
    "Implementar gestión profesional de servicios IT",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero */}
      <section className="relative flex h-[36vh] items-center justify-center bg-[#003087] text-center text-white shadow-lg md:h-[28vh]">
        <div className="absolute inset-0 mx-auto max-w-7xl px-4 pt-28 md:pt-28">
          <div className="relative z-10">
            <h1 className="mb-3 text-3xl font-bold text-white md:mb-4 md:text-4xl">
              Cristian Miguel
            </h1>
            <p className="mx-auto max-w-2xl px-4 text-lg text-gray-200 md:text-xl">
              Ingeniero en Sistemas Computacionales
            </p>
          </div>
        </div>
      </section>

      <main className="relative z-10 mx-auto -mt-20 max-w-7xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Profile Card */}
          <div className="md:col-span-1">
            <div className="sticky top-28 overflow-hidden rounded-xl bg-white shadow-lg">
              <div className="relative aspect-[4/3] w-full">
                <img
                  src="/images/cmcocom.webp"
                  alt="Cristian Miguel"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-6">
                <div className="mb-6 flex justify-center space-x-4">
                  <SocialLink
                    href="https://www.linkedin.com/in/cmcocomti"
                    icon={<Linkedin className="h-5 w-5" />}
                    label="LinkedIn"
                  />
                </div>
                <div className="space-y-2">
                  <InfoItem label="Ubicación" value="Mérida, Yucatán, México" />
                  <InfoItem label="Cargo" value="Fundador de Unidad C" />
                  <InfoItem label="Especialidad" value="Consultoría TI Integral" />
                  <InfoItem label="Experiencia" value="27+ años" />
                  <InfoItem
                    label="Correo"
                    value={
                      <a
                        href="mailto:cmcocom@unidadc.com"
                        aria-label="cmcocom@unidadc.com"
                        className="text-blue-600 hover:underline"
                      >
                        cmcocom@unidadc.com
                      </a>
                    }
                  />
                  <div className="mt-2 rounded-full bg-gray-100 px-3 py-1 text-center text-sm text-gray-500">
                    Actualizado: Junio 2025
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="space-y-8 md:col-span-2">
            {/* Mi Historia */}
            <div className="relative flex flex-col overflow-hidden rounded-xl bg-white p-8 text-left shadow-lg md:p-12">
              <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-blue-50 to-white opacity-50" />
              <div className="relative z-10">
                <h2 className="mb-6 border-b border-blue-200 pb-2 text-3xl font-bold text-blue-900">
                  Mi Historia
                </h2>
                <p className="mb-6 text-lg leading-relaxed text-gray-800">
                  Soy <strong className="text-blue-800">Cristian Miguel</strong>, Ingeniero en
                  Sistemas Computacionales y la persona detrás de <strong>Unidad C</strong>, donde
                  transformamos la tecnología en soluciones reales que impulsan negocios. Con más de{" "}
                  <strong>27 años</strong> en el ecosistema de TI, he tenido el privilegio de
                  acompañar a empresas en su evolución digital, desde PyMEs locales hasta
                  organizaciones con operaciones complejas.
                </p>
                <p className="text-lg leading-relaxed text-gray-800">
                  Mi filosofía es simple pero poderosa: fusionar{" "}
                  <span className="font-semibold text-blue-700">innovación tecnológica</span> con{" "}
                  <span className="font-semibold text-blue-700">practicidad empresarial</span>. No
                  se trata solo de implementar la última tecnología, sino de encontrar la solución
                  correcta que genere valor medible y sostenible para cada cliente.
                </p>
              </div>
            </div>

            {/* Mi Enfoque Profesional - Tabs */}
            <SectionCard title="Mi Enfoque Profesional">
              <div className="mb-6 flex flex-wrap gap-2">
                {enfoques.map((e, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTab(i)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      activeTab === i
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {e.titulo}
                  </button>
                ))}
              </div>
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-6">
                <h3 className="mb-3 text-xl font-bold text-gray-900">
                  {enfoques[activeTab].titulo}
                </h3>
                <p className="mb-4 leading-relaxed text-gray-700">
                  {enfoques[activeTab].descripcion}
                </p>
                {enfoques[activeTab].stack && (
                  <div className="mb-4">
                    <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-700">
                      Stack tecnológico principal
                    </h4>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {Object.entries(enfoques[activeTab].stack!).map(([key, val]) => (
                        <div key={key} className="rounded-md bg-white p-2 text-sm">
                          <span className="font-semibold text-gray-700">{key}:</span>{" "}
                          <span className="text-gray-600">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-700">
                  {enfoques[activeTab].stack ? "Tipos de sistemas desarrollados" : "Áreas de especialización"}
                </h4>
                <ul className="grid gap-1 sm:grid-cols-2">
                  {enfoques[activeTab].items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </SectionCard>

            {/* Metodología */}
            <SectionCard title="Mi Metodología de Trabajo">
              <p className="mb-6 text-gray-700">
                Cada proyecto sigue un proceso estructurado que garantiza resultados medibles:
              </p>
              <div className="space-y-4">
                {metodologia.map((m) => (
                  <div
                    key={m.paso}
                    className="flex items-start gap-4 rounded-lg border border-gray-100 bg-gray-50 p-4"
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
                      {m.paso}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {m.titulo} {m.icono}
                      </h3>
                      <p className="text-sm text-gray-600">{m.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Proyectos Destacados */}
            <SectionCard title="Proyectos Destacados">
              <p className="mb-6 text-gray-700">
                He desarrollado e implementado soluciones en diversos sectores:
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {proyectos.map((p, i) => (
                  <div
                    key={i}
                    className="rounded-lg border-l-4 border-blue-500 bg-gray-50 p-4"
                  >
                    <h3 className="mb-1 font-bold text-blue-800">{p.sector}</h3>
                    <p className="text-sm text-gray-600">{p.desc}</p>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Más Allá del Código */}
            <SectionCard title="Más Allá del Código">
              <p className="mb-6 leading-relaxed text-gray-800">
                La tecnología es mi pasión, pero la vida es más que pantallas y teclados. Soy padre
                orgulloso de dos jóvenes extraordinarios que me recuerdan constantemente la
                importancia de crear soluciones que impacten positivamente en las personas.
              </p>
              <p className="mb-4 font-medium text-gray-700">
                Encuentro equilibrio y creatividad en:
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {hobbies.map((h, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-lg bg-gray-50 p-3">
                    <span className="text-2xl">{h.icono}</span>
                    <div>
                      <p className="font-semibold text-gray-800">{h.nombre}</p>
                      <p className="text-sm text-gray-600">{h.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-6 rounded-lg bg-blue-50 p-4 text-sm italic text-gray-700">
                Estos pasatiempos me recuerdan que la mejor tecnología es aquella que se construye
                con equilibrio entre precisión técnica y creatividad humana, cualidades que procuro
                imprimir en cada proyecto que desarrollo.
              </p>
            </SectionCard>

            {/* ¿Por Qué Trabajar Conmigo? */}
            <SectionCard title="¿Por Qué Trabajar Conmigo?">
              <div className="grid gap-3 sm:grid-cols-2">
                {porqueYo.map((p, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-lg bg-green-50 p-4">
                    <span className="mt-0.5 text-green-600">✅</span>
                    <div>
                      <p className="font-semibold text-gray-800">{p.label}</p>
                      <p className="text-sm text-gray-600">{p.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Áreas de Expertise */}
            <div className="rounded-xl bg-white p-8 shadow-lg">
              <h2 className="mb-6 border-b border-blue-200 pb-2 text-2xl font-bold text-blue-900">
                Áreas de Expertise
              </h2>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {expertise.map((skill, i) => (
                  <div
                    key={i}
                    className="rounded-lg bg-blue-50 px-4 py-3 text-center text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
                  >
                    {skill}
                  </div>
                ))}
              </div>
            </div>

            {/* CTA - ¿Listo para Transformar tu TI? */}
            <div className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-white shadow-lg">
              <h2 className="mb-4 text-2xl font-bold">¿Listo para Transformar tu TI?</h2>
              <p className="mb-4 text-gray-200">Si tu empresa necesita:</p>
              <ul className="mb-6 space-y-2">
                {necesidades.map((n, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-100">
                    <span className="mt-1 text-sm">▸</span>
                    {n}
                  </li>
                ))}
              </ul>
              <p className="mb-6 text-gray-200">
                Estaré encantado de conocer tu proyecto y diseñar juntos la solución tecnológica que
                necesitas.
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="https://wa.me/525660000199?text=Hola,%20me%20interesa%20informaci%C3%B3n%20sobre%20sus%20servicios."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-lg bg-green-600 px-6 py-3 font-medium text-white transition-colors hover:bg-green-700"
                >
                  <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.787" />
                  </svg>
                  Contactar por WhatsApp
                </a>
                <a
                  href="mailto:cmcocom@unidadc.com"
                  className="inline-flex items-center rounded-lg border border-white/30 px-6 py-3 font-medium text-white transition-colors hover:bg-white/10"
                >
                  cmcocom@unidadc.com
                </a>
              </div>
            </div>

            {/* Quote */}
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-lg">
              <blockquote className="text-lg italic text-gray-700">
                "La mejor tecnología es aquella que resuelve problemas reales y se adapta a las
                personas, no al revés."
              </blockquote>
              <p className="mt-4 font-semibold text-blue-800">— Cristian Miguel</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Utility Components
const SocialLink: React.FC<SocialLinkProps> = ({ href, icon, label }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={`Perfil en ${label}`}
    title={`Ir a ${label}`}
    className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors duration-100 hover:bg-blue-50 hover:text-blue-600"
  >
    {icon}
  </a>
);

const InfoItem: React.FC<InfoItemProps> = ({ label, value }) => (
  <div className="flex items-center justify-between border-b border-gray-100 py-2">
    <span className="font-medium text-gray-600">{label}:</span>
    <span className="text-right text-gray-900">{value}</span>
  </div>
);
