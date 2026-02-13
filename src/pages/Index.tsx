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
    title: "Reparaciones",
    icon: Wrench,
    color: "text-primary",
    bg: "bg-primary/10",
    items: ["Celulares (todas las marcas)", "Tablets", "TV LED / LCD"],
  },
  {
    title: "Informática",
    icon: Monitor,
    color: "text-secondary",
    bg: "bg-secondary/10",
    items: ["Notebooks", "PC de escritorio", "Netbooks"],
  },
  {
    title: "Especialidades",
    icon: Gamepad2,
    color: "text-primary",
    bg: "bg-primary/10",
    items: ["Consolas PS4 / PS5", "Monopatines eléctricos", "Pequeños electrodomésticos"],
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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.15),transparent_60%)]" />
        <div className="container relative z-10 max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-background/20 px-4 py-1.5 text-sm text-background/80">
            <Shield size={14} /> Garantía escrita en todas las reparaciones
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
            <h2 className="font-display text-3xl font-bold">Nuestros Servicios</h2>
            <p className="mt-3 text-muted-foreground">
              Cubrimos todas las categorías de dispositivos electrónicos
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

      {/* Premium Banner */}
      <section className="py-16">
        <div className="container">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary/80 p-8 text-primary-foreground md:p-12">
            <div className="absolute right-0 top-0 h-full w-1/3 bg-[radial-gradient(circle_at_center,hsl(var(--secondary)/0.3),transparent_70%)]" />
            <div className="relative z-10 max-w-xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-background/20 px-3 py-1 text-sm">
                <Sparkles size={14} /> Service Premium
              </div>
              <h2 className="font-display text-3xl font-bold">
                Limpieza y Pasta Térmica
              </h2>
              <p className="mt-3 text-lg opacity-90">
                Para PC Gamer y Consolas. Mejorá el rendimiento y prolongá la vida útil de tu equipo con nuestro service profesional.
              </p>
              <Button
                size="lg"
                variant="outline"
                className="mt-6 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                asChild
              >
                <a href="https://wa.me/5491124873190?text=Hola,%20quiero%20consultar%20por%20el%20service%20premium" target="_blank" rel="noopener noreferrer">
                  Consultar ahora <ArrowRight size={18} />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Store Preview */}
      <section className="bg-muted py-20">
        <div className="container">
          <div className="mx-auto mb-12 max-w-lg text-center">
            <h2 className="font-display text-3xl font-bold">Nuestra Tienda</h2>
            <p className="mt-3 text-muted-foreground">
              Equipos nuevos, accesorios y PCs armadas a tu medida
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {products.map((p) => (
              <Card key={p.name} className="text-center transition-shadow hover:shadow-lg">
                <CardContent className="flex flex-col items-center p-8">
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/10">
                    <p.icon size={32} className="text-secondary" />
                  </div>
                  <h3 className="font-display text-lg font-semibold">{p.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button variant="outline" size="lg" asChild>
              <Link to="/tienda">Ver tienda completa <ArrowRight size={18} /></Link>
            </Button>
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
