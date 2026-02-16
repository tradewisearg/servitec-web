import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Smartphone, BatteryCharging, ScreenShare, Cpu, ArrowRight } from "lucide-react";

const repairs = [
  { icon: ScreenShare, title: "Cambio de Pantalla", desc: "Reemplazo de display y táctil para todas las marcas." },
  { icon: BatteryCharging, title: "Cambio de Batería", desc: "Baterías originales y de alta calidad con garantía." },
  { icon: Cpu, title: "Reparación de Placa", desc: "Microsoldadura y diagnóstico avanzado de componentes." },
  { icon: Smartphone, title: "Equipos Nuevos", desc: "Celulares sellados de fábrica con garantía oficial." },
];

const Celulares = () => (
  <Layout>
    <section className="relative overflow-hidden py-24 text-white">
      
      {/* Imagen de fondo */}
      <img
        src="/banner-celu.png"
        alt="Banner Celulares"
        className="absolute inset-0 h-full w-full object-cover opacity-70"
      />

      {/* Capa oscura para legibilidad (Overlay) */}
      <div className="absolute inset-0 bg-slate-950/60" />

      {/* Contenido */}
      <div className="container relative z-10 max-w-2xl text-center">
        <h1 className="font-display text-4xl font-extrabold md:text-5xl">
          Celulares
        </h1>
        <p className="mt-4 text-lg text-slate-200">
          Reparamos todas las marcas y vendemos equipos sellados.
        </p>
      </div>
    </section>
    <section className="py-16">
      <div className="container grid gap-6 md:grid-cols-2">
        {repairs.map((r) => (
          <Card key={r.title} className="transition-shadow hover:shadow-lg">
            <CardContent className="flex items-start gap-4 p-6">
              <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <r.icon size={24} className="text-primary" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold">{r.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{r.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="container mt-10 text-center">
        <Button asChild>
          <a href="https://wa.me/5491124873190?text=Hola,%20quiero%20consultar%20por%20celulares" target="_blank" rel="noopener noreferrer">
            Consultar <ArrowRight size={18} />
          </a>
        </Button>
      </div>
    </section>
  </Layout>
);

export default Celulares;
