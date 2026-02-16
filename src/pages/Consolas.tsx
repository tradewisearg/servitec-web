import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gamepad2, Cpu, Fan, Wrench, ArrowRight } from "lucide-react";

const services = [
  { icon: Gamepad2, title: "Reparación de Mandos", desc: "Joysticks, botones, drift de analógicos para PS4, PS5 y Xbox." },
  { icon: Cpu, title: "Fallas de Encendido", desc: "Reparación de fuentes de poder y microsoldadura en placa base para consolas que no arrancan." },
  { icon: Fan, title: "Limpieza y Pasta Térmica", desc: "Evitá sobrecalentamientos con nuestro service premium." },
  { icon: Wrench, title: "Diagnóstico General", desc: "Identificamos y solucionamos cualquier falla de tu consola." },
];

const Consolas = () => (
  <Layout>
    <section className="relative overflow-hidden py-24 text-white">

      {/* Imagen de fondo */}
      <img
        src="/banner-consola.png"
        alt="Banner Consolas"
        className="absolute inset-0 h-full w-full object-cover opacity-70"
      />

      {/* Capa oscura para legibilidad (Overlay) */}
      <div className="absolute inset-0 bg-slate-950/60" />

      {/* Contenido */}
      <div className="container relative z-10 max-w-2xl text-center">
        <h1 className="font-display text-4xl font-bold">Consolas</h1>
        <p className="mt-4 text-lg text-background/70">Especialistas en PlayStation 4, PlayStation 5 y Xbox.</p>
      </div>
    </section>
    
    <section className="py-16">
      <div className="container grid gap-6 md:grid-cols-2">
        {services.map((s) => (
          <Card key={s.title} className="transition-shadow hover:shadow-lg">
            <CardContent className="flex items-start gap-4 p-6">
              <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <s.icon size={24} className="text-primary" />
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
        <Button asChild>
          <a href="https://wa.me/5491124873190?text=Hola,%20quiero%20consultar%20por%20consolas" target="_blank" rel="noopener noreferrer">
            Consultar <ArrowRight size={18} />
          </a>
        </Button>
      </div>
    </section>
  </Layout>
);

export default Consolas;
