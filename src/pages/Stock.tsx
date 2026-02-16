import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { products } from "@/data/products";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("es-AR").format(price);
};

const Stock = () => {
  const sortedProducts = [...products].sort((a, b) => a.promo - b.promo);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden py-24 text-white">
        {/* Imagen de fondo */}
        <img
          src="/BAN-STK.png"
          alt="Banner Consolas"
          className="absolute inset-0 h-full w-full object-cover opacity-70"
        />

        {/* Capa oscura para legibilidad (Overlay) */}
        <div className="absolute inset-0 bg-slate-950/60" />

        {/* Contenido */}
        <div className="container relative z-10 text-center">
          <h1 className="font-display text-4xl font-bold">Equipos en Stock</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Equipos sellados y reacondicionados con garantía.
          </p>
        </div>
      </section>

      {/* Productos */}
      <section className="py-16">
        <div className="container grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {sortedProducts.map((p) => (
            <Card
              key={p.id}
              className="overflow-hidden transition hover:shadow-xl"
            >
              {/* Imagen */}
              <div className="relative aspect-square w-full overflow-hidden bg-slate-900">
                <img
                  src={p.image}
                  alt="Producto"
                  className="h-full w-full object-cover"
                />

                {/* Specs sobre imagen */}
                <div className="absolute bottom-0 left-0 w-full bg-slate-950/80 backdrop-blur-sm p-4">
                  <div className="grid grid-cols-2 gap-2 text-xs text-white">
                    <p>
                      <span className="font-semibold text-primary">Alm:</span>{" "}
                      {p.storage}
                    </p>
                    <p>
                      <span className="font-semibold text-primary">RAM:</span>{" "}
                      {p.ram}
                    </p>
                    <p>
                      <span className="font-semibold text-primary">
                        Garantía:
                      </span>{" "}
                      {p.warranty}
                    </p>
                    <p>
                      <span className="font-semibold text-primary">
                        Condición:
                      </span>{" "}
                      <span className="px-2 py-1 rounded-full bg-primary text-black text-[10px] font-semibold">
                        {p.condition}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Precios + botón */}
              <CardContent className="p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                  {/* Precios */}
                  <div className="space-y-3 w-full">
                    {/* Precio original */}
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm sm:text-base line-through text-muted-foreground">
                        ${formatPrice(p.original)} ARS
                      </p>

                      <span
                        className="px-3 py-1 text-[11px] sm:text-xs font-semibold rounded-full 
          border border-red-500 text-red-400 
          shadow-[0_0_10px_rgba(239,68,68,0.4)] whitespace-nowrap"
                      >
                        💳 3 y 6 cuotas
                      </span>
                    </div>

                    {/* Precio promo */}
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">
                        ${formatPrice(p.promo)} ARS
                      </p>

                      <span
                        className="px-3 py-1 text-[11px] sm:text-xs font-semibold rounded-full 
          border border-emerald-500 text-emerald-400 
          shadow-[0_0_10px_rgba(16,185,129,0.4)] whitespace-nowrap"
                      >
                        💵 Efectivo y Transferencia
                      </span>
                    </div>
                  </div>

                  {/* Botón */}
                  <a
                    href={`https://wa.me/5491124873190?text=Hola,%20quiero%20consultar%20por%20el%20equipo%20de%20${p.storage}%20-%20${formatPrice(p.promo)}%20ARS`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto text-center bg-primary text-secondary-foreground 
      hover:bg-primary/80 px-4 py-3 sm:py-2 rounded-md text-sm font-medium transition"
                  >
                    Consultar
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default Stock;
