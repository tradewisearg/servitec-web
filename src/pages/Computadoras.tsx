import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Laptop, Cpu, HardDrive, Fan, ArrowRight } from "lucide-react";

const services = [
  { icon: Cpu, title: "Armado de PC a Medida", desc: "Configuraciones gaming, oficina y diseño con los mejores componentes." },
  { icon: Laptop, title: "Reparación de Notebooks", desc: "Pantalla, teclado, bisagras, carga y más." },
  { icon: HardDrive, title: "Upgrade de Componentes", desc: "Ampliación de RAM, SSD y optimización de rendimiento." },
  { icon: Fan, title: "Mantenimiento Preventivo", desc: "Limpieza interna, externa, limpieza de coolers y cambio de pasta térmica." },
];

const Computadoras = () => (
  <Layout>
    <section className="relative overflow-hidden py-24 text-white">

      {/* Imagen de fondo */}
      <img
        src="/banner-compu.png"
        alt="Banner Computadoras"
        className="absolute inset-0 h-full w-full object-cover opacity-70"
      />

      {/* Capa oscura para legibilidad (Overlay) */}
      <div className="absolute inset-0 bg-slate-950/60" />

      {/* Contenido */}
      <div className="container relative z-10 max-w-2xl text-center">
        <h1 className="font-display text-4xl font-bold">Computadoras</h1>
        <p className="mt-4 text-lg text-background/70">Reparaciones, armado de PC y mantenimientos completos.</p>
      </div>
    </section>

    <section className="py-16">
      <div className="container grid gap-6 md:grid-cols-2">
        {services.map((s) => (
          <Card key={s.title} className="transition-shadow hover:shadow-lg">
            <CardContent className="flex items-start gap-4 p-6">
              <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary/10">
                <s.icon size={24} className="text-secondary" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="container mt-10 text-center">
        <Button asChild variant="secondary">
          <a href="https://wa.me/5491124873190?text=Hola,%20quiero%20consultar%20por%20computadoras" target="_blank" rel="noopener noreferrer">
            Consultar <ArrowRight size={18} />
          </a>
        </Button>
      </div>
    </section>
  </Layout>
);

export default Computadoras;
