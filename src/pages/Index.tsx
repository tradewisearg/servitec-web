import Layout from "@/components/Layout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Smartphone, Monitor, Gamepad2, Tv, Tablet, Laptop,
  Cpu, Wrench, Zap, ShoppingBag, MessageCircle,
  ArrowRight, Sparkles, Shield,
} from "lucide-react";

const categories = [
  {
    title: "Móviles y TV",
    icon: Smartphone,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    items: ["Smartphones (iOS y Android)", "Tablets y iPads", "Smart TV y monitores"],
  },
  {
    title: "Computación",
    icon: Laptop,
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
    items: ["Laptops (PC y Mac)", "Equipos de Oficina", "PC Gaming de Alto Rendimiento"],
  },
  {
    title: "Tech & Hobby",
    icon: Gamepad2,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    items: ["Consolas de Videojuegos", "Pequeños electrodomésticos", "Hogar Inteligente"],
  },
];

const products = [
  { name: "Celulares Nuevos Sellados", icon: Smartphone, desc: "Las mejores marcas con garantía oficial" },
  { name: "Accesorios", icon: ShoppingBag, desc: "Cables, teclados, mouse y más" },
  { name: "PC Armadas a Medida", icon: Cpu, desc: "Configuraciones gaming y oficina" },
];

const Index = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-foreground via-foreground to-secondary/30 py-24 text-background md:py-32">
        <img
          src="/banner-main.png"
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
            Servicio técnico especializado en Saavedra con garantía escrita. Reparamos celulares, notebooks, consolas y más.
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
              <a href="https://wa.me/5491124873190" target="_blank" rel="noopener noreferrer">
                <MessageCircle size={18} /> WhatsApp Directo
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="servicios" className="py-20">
        <div className="container">
          <div className="mx-auto mb-12 max-w-lg text-center">
            <h2 className="font-display text-3xl font-bold">Nuestros Servicios Profesionales</h2>
            <p className="mt-3 text-muted-foreground">
              Cubrimos todas las categorías en reparación de dispositivos
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {categories.map((cat) => (
              <Card key={cat.title} className="group overflow-hidden transition-shadow hover:shadow-lg">
                <CardContent className="p-6">
                  <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${cat.bg}`}>
                    <cat.icon size={24} className={cat.color} />
                  </div>
                  <h3 className="font-display text-xl font-semibold">{cat.title}</h3>
                  <ul className="mt-3 space-y-2">
                    {cat.items.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
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

   <section className="py-14 md:py-20">

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
            No esperes a que sea tarde. Nuestra <strong>Mantenimiento & Limpieza Premium</strong> recupera la vida útil de tus dispositivos.
          </p>

          <div className="mt-2 flex flex-wrap gap-2 sm:gap-3">
            {['Notebooks', 'MacBooks', 'PC Gamer', 'Consolas', 'All-in-One'].map((item) => (
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
            src="/mantenimientops4.png"
            alt="Mantenimiento PS3/PS4 XBOX"
            className="h-full w-full object-cover hover:scale-105 transition duration-500"
          />
        </div>

        {/* Imagen cuadrada */}
        <div className="overflow-hidden rounded-2xl aspect-square">
          <img
            src="/mantenimientops5.png"
            alt="Mantenimiento PS5/XBOX"
            className="h-full w-full object-cover hover:scale-105 transition duration-500"
          />
        </div>

        {/* Imagen horizontal */}
        <div className="overflow-hidden rounded-2xl col-span-2 aspect-video">
          <img
            src="/mantenimientopc.png"
            alt="Mantenimiento PC"
            className="h-full w-full object-cover hover:scale-105 transition duration-500"
          />
        </div>

      </div>

    </div>

  </div>

</section>



      {/* Store Preview */}
      <section className="bg-slate-50 py-24 dark:bg-slate-900/50">
        <div className="container">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="font-display text-4xl font-extrabold tracking-tight md:text-5xl">
              Equipate con <span className="text-primary">lo mejor</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Desde accesorios esenciales hasta <strong>Workstations y PCs Gaming</strong> armadas por expertos con componentes de última generación.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {products.map((p) => (
              <Card
                key={p.name}
                className="group relative border-none bg-background shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
              >
                {/* Badge sutil de disponibilidad */}
                <div className="absolute right-4 top-4">
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Stock Disponible
                  </span>
                </div>

                <CardContent className="flex flex-col items-center p-10">
                  {/* Icono con efecto de brillo al hacer hover */}
                  <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/5 transition-colors group-hover:bg-primary/10">
                    <p.icon size={40} className="text-primary transition-transform group-hover:scale-110" />
                  </div>

                  <h3 className="font-display text-xl font-bold">{p.name}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {p.desc}
                  </p>

                  {/* Link falso o indicador de acción para mejorar el CTR */}
                  <div className="mt-6 text-sm font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    Explorar categoría →
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-16 flex flex-col items-center justify-center gap-4 text-center">
            <Button size="lg" className="rounded-full px-10 shadow-lg shadow-primary/25 transition-transform hover:scale-105" asChild>
              <Link to="/tienda" className="flex items-center gap-2">
                Ver catálogo completo <ArrowRight size={18} />
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground">
              💳 3 y 6 cuotas fijas • 🚚 Retiros por local físico
            </p>
          </div>
        </div>
      </section>
      {/* Contact Form */}
      <section className="py-20">
        <div className="container max-w-lg">
          <div className="mb-10 text-center">
            <h2 className="font-display text-3xl font-bold">Pedí tu Presupuesto</h2>
            <p className="mt-3 text-muted-foreground">
              Contanos sobre tu dispositivo y te respondemos a la brevedad
            </p>
          </div>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const msg = `Hola, soy ${fd.get("nombre")}. Tengo un problema con mi ${fd.get("dispositivo")}: ${fd.get("problema")}`;
              window.open(`https://wa.me/5491124873190?text=${encodeURIComponent(msg)}`, "_blank");
            }}
          >
            <Input name="nombre" placeholder="Tu nombre" required />
            <Input name="dispositivo" placeholder="Dispositivo (ej: iPhone 14, PS5, Notebook HP)" required />
            <Textarea name="problema" placeholder="Describí brevemente el problema" rows={4} required />
            <Button type="submit" size="lg" className="w-full">
              Enviar por WhatsApp <MessageCircle size={18} />
            </Button>
          </form>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
