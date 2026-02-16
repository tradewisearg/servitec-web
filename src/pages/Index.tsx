import Layout from "@/components/Layout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ReviewsSection from "@/components/ReviewsSection";
import {
  Smartphone,
  Gamepad2,
  Laptop,
  Cpu,
  ShoppingBag,
  MessageCircle,
  ArrowRight,
  Sparkles,
  Shield,
} from "lucide-react";

const categories = [
  {
    title: "Móviles y TV",
    icon: Smartphone,
    color: "text-red-500",
    bg: "bg-red-500/10",
    items: [
      "Smartphones (iOS y Android)",
      "Tablets y iPads",
      "Smart TV y monitores",
    ],
  },
  {
    title: "Computación",
    icon: Laptop,
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
    items: [
      "Laptops (PC y Mac)",
      "Equipos de Oficina",
      "PC Gaming de Alto Rendimiento",
    ],
  },
  {
    title: "Tech & Hobby",
    icon: Gamepad2,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    items: [
      "Consolas de Videojuegos",
      "Pequeños electrodomésticos",
      "Hogar Inteligente",
    ],
  },
];

const products = [
  {
    name: "Celulares Nuevos Sellados",
    icon: Smartphone,
    desc: "Las mejores marcas con garantía oficial",
  },
  {
    name: "Accesorios",
    icon: ShoppingBag,
    desc: "Cables, teclados, mouse y más",
  },
  {
    name: "PC Armadas a Medida",
    icon: Cpu,
    desc: "Configuraciones gaming y oficina",
  },
];

const Index = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-foreground via-foreground to-secondary/30 py-24 text-background md:py-32">
        <img
          src="/BAN-IN.png"
          alt="Descripción"
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="container relative z-10 max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-background/20 px-4 py-1.5 text-sm text-background/80">
            <Shield size={14} /> Garantía de 2 meses en todas las reparaciones
          </div>
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            Expertos en darle vida a tus{" "}
            <span className="text-primary">dispositivos</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-background/70">
            Servicio técnico especializado en Saavedra con garantía escrita.
            Reparamos celulares, notebooks, consolas y más.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" variant="secondary" asChild>
              <a href="#servicios">
                Ver Servicios <ArrowRight size={18} />
              </a>
            </Button>
            <Button
              size="lg"
              className="bg-whatsapp text-whatsapp-foreground hover:bg-whatsapp/90"
              asChild
            >
              <a
                href="https://wa.me/5491124873190"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle size={18} /> WhatsApp Directo
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* ================= INSTITUCIONAL ================= */}
<section className="bg-slate-50 dark:bg-slate-900/50 py-20 md:py-28">
  <div className="container px-4 mx-auto">

    {/* Título */}
    <div className="max-w-3xl mx-auto text-center mb-16 md:mb-20">
      <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
        Conocé <span className="text-primary">ServiTec</span>
      </h2>
      <p className="mt-4 text-base sm:text-lg text-muted-foreground">
        Transparencia, profesionalismo y atención personalizada en cada servicio.
      </p>
    </div>

    {/* Contenido */}
    <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

      {/* Texto */}
      <div className="space-y-6 text-sm sm:text-base">
        <div>
          <h3 className="font-display text-xl sm:text-2xl font-bold mb-3">
            ¿Quiénes somos?
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            Somos un servicio técnico especializado en reparación de celulares,
            consolas y computadoras. Trabajamos con herramientas profesionales,
            repuestos de calidad y personal capacitado para garantizar resultados confiables.
          </p>
        </div>

        <div>
          <h3 className="font-display text-xl sm:text-2xl font-bold mb-3">
            ¿Qué hacemos?
          </h3>

          <p className="text-muted-foreground leading-relaxed">
            En ServiTec trabajamos para que sus dispositivos recuperen plenamente su funcionalidad,
            extendiendo su vida útil y devolviéndolos al servicio de sus necesidades diarias.
          </p>

          <p className="text-muted-foreground leading-relaxed">
            Muchas veces creemos que la inversión no justifica reparar un equipo,
            pero en la mayoría de los casos existen soluciones técnicas viables.
          </p>

          <p className="text-muted-foreground leading-relaxed">
            Contamos con capacitación profesional, herramientas adecuadas y experiencia
            para ofrecer diagnósticos precisos y reparaciones confiables.
          </p>
        </div>
      </div>

      {/* Galería Responsive */}
      <div className="grid grid-cols-2 gap-4">
        <img
          src="/Local1.png"
          className="rounded-2xl object-cover w-full h-32 sm:h-40 md:h-48 hover:scale-105 transition"
        />
        <img
          src="/Local2.png"
          className="rounded-2xl object-cover w-full h-32 sm:h-40 md:h-48 hover:scale-105 transition"
        />
        <img
          src="/Local3.png"
          className="rounded-2xl object-cover w-full h-32 sm:h-40 md:h-48 hover:scale-105 transition"
        />
        <img
          src="/Local4.png"
          className="rounded-2xl object-cover w-full h-32 sm:h-40 md:h-48 hover:scale-105 transition"
        />
      </div>

    </div>
  </div>
</section>

{/* ================= UBICACIÓN ================= */}
<section className="bg-slate-50 dark:bg-zinc-900 py-16 md:py-24">
  <div className="container mx-auto px-4">

    <div className="grid gap-12 lg:gap-16 lg:grid-cols-2 items-start">

      {/* ===== UBICACIÓN ===== */}
      <div className="space-y-6">
        <div>
          <h3 className="font-display text-2xl md:text-3xl font-bold">
            ¿Dónde nos ubicamos?
          </h3>
        </div>

        <div className="overflow-hidden rounded-2xl shadow-xl w-full h-[320px] sm:h-[380px] md:h-[420px]">
          <iframe
            src="https://www.google.com/maps?q=Av.+García+del+Río+4001,+Saavedra,+CABA&output=embed"
            className="w-full h-full"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
          />
        </div>
      </div>

      {/* ===== HORARIOS ===== */}
      <div className="space-y-6">
        <h3 className="font-display text-2xl md:text-3xl font-bold">
          Horarios de Atención
        </h3>

        <div className="bg-white dark:bg-zinc-800 p-6 md:p-8 rounded-2xl shadow-xl">

          <div className="space-y-6 text-sm sm:text-base font-medium">

            <div className="flex justify-between">
              <span>Lunes a Viernes</span>
              <span className="text-green-500 font-semibold">
                10:00 - 19:00
              </span>
            </div>

            <div className="flex justify-between">
              <span>Sábados</span>
              <span className="text-green-500 font-semibold">
                10:00 - 14:00
              </span>
            </div>

            <div className="flex justify-between">
              <span>Domingos</span>
              <span className="text-red-500 font-semibold">
                Cerrado
              </span>
            </div>

            <div className="flex justify-between">
              <span>Feriados</span>
              <span className="text-orange-500 font-semibold">
                Consultar
              </span>
            </div>

          </div>

        </div>
      </div>

    </div>

  </div>
</section>

      {/* Categories */}
      <section id="servicios" className="py-20 bg-slate-50">
        <div className="container">
          <div className="mx-auto mb-12 max-w-lg text-center">
            <h2 className="font-display text-3xl font-bold">
              Nuestros Servicios Profesionales
            </h2>
            <p className="mt-3 text-muted-foreground">
              Cubrimos todas las categorías en reparación de dispositivos
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {categories.map((cat) => (
              <Card
                key={cat.title}
                className="group overflow-hidden transition-shadow hover:shadow-lg"
              >
                <CardContent className="p-6">
                  <div
                    className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${cat.bg}`}
                  >
                    <cat.icon size={24} className={cat.color} />
                  </div>
                  <h3 className="font-display text-xl font-semibold">
                    {cat.title}
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {cat.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20 bg-slate-50">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 items-stretch">
            {/* ================= IZQUIERDA ================= */}
            <div className="relative overflow-hidden rounded-3xl bg-slate-950 p-8 sm:p-12 md:p-16 text-white">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />

              <div className="relative z-10 flex flex-col gap-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-sm font-medium text-primary shadow-sm w-fit">
                  <Sparkles size={16} className="animate-pulse" />
                  Soporte Técnico de Alta Gama
                </div>

                <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight tracking-tight">
                  ¿Tu equipo calienta o <br className="hidden sm:block" />
                  <span className="text-primary">funciona lento?</span>
                </h2>

                <p className="max-w-lg text-base sm:text-lg text-slate-300">
                  No esperes a que sea tarde. Nuestra{" "}
                  <strong>Mantenimiento & Limpieza Premium</strong> recupera la
                  vida útil de tus dispositivos.
                </p>

                <div className="mt-2 flex flex-wrap gap-2 sm:gap-3">
                  {[
                    "Notebooks",
                    "MacBooks",
                    "PC Gamer",
                    "Consolas",
                    "All-in-One",
                  ].map((item) => (
                    <span
                      key={item}
                      className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-medium text-slate-400"
                    >
                      • {item}
                    </span>
                  ))}
                </div>

                <div className="mt-6 w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto rounded-full px-8 py-6 text-base sm:text-lg font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                    asChild
                  >
                    <a
                      href="https://wa.me/5491124873190?text=Hola,%20necesito%20un%20Service%20Premium"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2"
                    >
                      ¡Quiero mi service ahora! <ArrowRight size={20} />
                    </a>
                  </Button>
                </div>

                <p className="text-xs text-slate-500 mt-2">
                  ✅ Presupuesto sin cargo • ⚡ Entrega en 24/48hs
                </p>
              </div>
            </div>

            {/* ================= DERECHA ================= */}
            <div className="grid grid-cols-2 gap-4">
              {/* Imagen cuadrada */}
              <div className="overflow-hidden rounded-2xl aspect-square">
                <img
                  src="/PIC-GRID1.png"
                  alt="Mantenimiento PS3/PS4 XBOX"
                  className="h-full w-full object-cover hover:scale-105 transition duration-500"
                />
              </div>

              {/* Imagen cuadrada */}
              <div className="overflow-hidden rounded-2xl aspect-square">
                <img
                  src="/PIC-GRID2.png"
                  alt="Mantenimiento PS5/XBOX"
                  className="h-full w-full object-cover hover:scale-105 transition duration-500"
                />
              </div>

              {/* Imagen horizontal */}
              <div className="overflow-hidden rounded-2xl col-span-2 aspect-video">
                <img
                  src="/PIC-GRID3.png"
                  alt="Mantenimiento PC"
                  className="h-full w-full object-cover hover:scale-105 transition duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <ReviewsSection />

      {/* Contact Form */}
      <section className="py-16 sm:py-20 bg-slate-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-2xl bg-black/5 backdrop-blur-sm p-6 sm:p-8 md:p-10 rounded-2xl shadow-lg">
            {/* Header */}
            <div className="mb-8 sm:mb-10 text-center">
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold">
                Pedí tu Presupuesto
              </h2>
              <p className="mt-3 text-sm sm:text-base text-muted-foreground">
                Contanos sobre tu dispositivo y te respondemos a la brevedad
              </p>
            </div>

            {/* Form */}
            <form
              className="space-y-4 sm:space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const msg = `Hola, soy ${fd.get("nombre")}. Tengo un problema con mi ${fd.get("dispositivo")}: ${fd.get("problema")}`;
                window.open(
                  `https://wa.me/5491124873190?text=${encodeURIComponent(msg)}`,
                  "_blank",
                );
              }}
            >
              <Input
                name="nombre"
                placeholder="Tu nombre"
                required
                className="w-full"
              />

              <Input
                name="dispositivo"
                placeholder="Dispositivo (ej: iPhone 14, PS5, Notebook HP)"
                required
                className="w-full"
              />

              <Textarea
                name="problema"
                placeholder="Describí brevemente el problema"
                rows={4}
                required
                className="w-full resize-none"
              />

              <Button
                type="submit"
                size="lg"
                className="w-full flex items-center justify-center gap-2"
              >
                Enviar por WhatsApp
                <MessageCircle size={18} />
              </Button>
            </form>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
