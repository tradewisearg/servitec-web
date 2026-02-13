import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle } from "lucide-react";

const Presupuesto = () => (
  <Layout>
    <section className="bg-gradient-to-br from-foreground to-foreground/95 py-20 text-background">
      <div className="container max-w-2xl text-center">
        <h1 className="font-display text-4xl font-bold">Presupuesto Online</h1>
        <p className="mt-4 text-lg text-background/70">Completá el formulario y te respondemos a la brevedad.</p>
      </div>
    </section>
    <section className="py-16">
      <div className="container max-w-lg">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const msg = `Hola, soy ${fd.get("nombre")}. Quiero presupuesto para mi ${fd.get("dispositivo")}: ${fd.get("problema")}`;
            window.open(`https://wa.me/5491124873190?text=${encodeURIComponent(msg)}`, "_blank");
          }}
        >
          <Input name="nombre" placeholder="Tu nombre" required />
          <Input name="dispositivo" placeholder="Dispositivo (ej: iPhone 14, PS5, Notebook)" required />
          <Textarea name="problema" placeholder="Describí brevemente el problema o lo que necesitás" rows={5} required />
          <Button type="submit" size="lg" className="w-full">
            Enviar por WhatsApp <MessageCircle size={18} />
          </Button>
        </form>
      </div>
    </section>
  </Layout>
);

export default Presupuesto;
