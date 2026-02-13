import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Smartphone, Headphones, Keyboard, Mouse, Cable, Speaker,
  Battery, MonitorSpeaker, MessageCircle,
} from "lucide-react";

const productos = [
  { icon: Smartphone, name: "Celulares Nuevos", cat: "Equipos" },
  { icon: Headphones, name: "Auriculares", cat: "Accesorios" },
  { icon: Keyboard, name: "Teclados", cat: "Periféricos" },
  { icon: Mouse, name: "Mouse", cat: "Periféricos" },
  { icon: Cable, name: "Cables y Cargadores", cat: "Accesorios" },
  { icon: Speaker, name: "Parlantes", cat: "Audio" },
  { icon: Battery, name: "Baterías", cat: "Repuestos" },
  { icon: MonitorSpeaker, name: "Monitores", cat: "Equipos" },
];

const Tienda = () => (
  <Layout>
    <section className="bg-gradient-to-br from-foreground to-foreground/95 py-20 text-background">
      <div className="container max-w-2xl text-center">
        <h1 className="font-display text-4xl font-bold">Tienda de Accesorios</h1>
        <p className="mt-4 text-lg text-background/70">Encontrá todo lo que necesitás para tus dispositivos.</p>
      </div>
    </section>
    <section className="py-16">
      <div className="container grid grid-cols-2 gap-4 md:grid-cols-4">
        {productos.map((p) => (
          <Card key={p.name} className="text-center transition-shadow hover:shadow-lg">
            <CardContent className="flex flex-col items-center p-6">
              <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/10">
                <p.icon size={28} className="text-secondary" />
              </div>
              <h3 className="font-display text-sm font-semibold">{p.name}</h3>
              <span className="mt-1 text-xs text-muted-foreground">{p.cat}</span>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="container mt-10 text-center">
        <p className="mb-4 text-muted-foreground">Consultá disponibilidad y precios por WhatsApp</p>
        <Button asChild className="bg-whatsapp text-whatsapp-foreground hover:bg-whatsapp/90">
          <a href="https://wa.me/5491124873190?text=Hola,%20quiero%20consultar%20por%20productos" target="_blank" rel="noopener noreferrer">
            <MessageCircle size={18} /> Consultar disponibilidad
          </a>
        </Button>
      </div>
    </section>
  </Layout>
);

export default Tienda;
