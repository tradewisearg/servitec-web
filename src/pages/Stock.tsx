import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/lib/firebase";

interface EquipoStock {
  id: string;
  nombre: string;
  marca?: string;
  modelo?: string;
  imagen?: string;
  image?: string;
  original: number;
  promo: number;
  almacenamiento: string;
  storage?: string;
  ram: string;
  warranty: string;
  condition: "Sellado" | "Reacondicionado" | string;
  estado?: "disponible" | "vendido" | string;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("es-AR").format(price);
};

const Stock = () => {
  const [equipos, setEquipos] = useState<EquipoStock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const equiposRef = collection(db, "equipos_stock");
    const unsub = onSnapshot(
      equiposRef,
      (snap) => {
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as EquipoStock[];
        setEquipos(items);
        setLoading(false);
      },
      () => setLoading(false)
    );

    return () => unsub();
  }, []);

  const sortedProducts = useMemo(
    () => [...equipos].sort((a, b) => Number(a.promo || 0) - Number(b.promo || 0)),
    [equipos]
  );

  return (
    <Layout>
      <section className="relative overflow-hidden py-20 text-white sm:py-24">
        <img
          src="/BAN-STK.png"
          alt="Banner Stock"
          className="absolute inset-0 h-full w-full object-cover opacity-70"
          loading="eager"
          decoding="async"
        />
        <div className="absolute inset-0 bg-slate-950/60" />

        <div className="container relative z-10 text-center">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Equipos en Stock</h1>
          <p className="mt-4 text-base text-slate-200 sm:text-lg">
            Equipos sellados y reacondicionados con garantia.
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="container">
          {loading && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-[420px] animate-pulse rounded-2xl bg-slate-200" />
              ))}
            </div>
          )}

          {!loading && sortedProducts.length === 0 && (
            <p className="text-center text-muted-foreground">No hay equipos publicados.</p>
          )}

          {!loading && sortedProducts.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sortedProducts.map((p) => {
                const imagen = p.imagen || p.image || "";
                const almacenamiento = p.almacenamiento || p.storage || "-";
                const vendido = String(p.estado || "disponible").toLowerCase() === "vendido";
                const nombreDisplay = p.nombre || `${p.marca || ""} ${p.modelo || ""}`.trim() || "Equipo";
                const mensaje = vendido
                  ? `Hola, quiero consultar por ${nombreDisplay} (figura como vendido)`
                  : `Hola, quiero consultar por ${nombreDisplay} - ${formatPrice(p.promo)} ARS`;

                return (
                  <Card
                    key={p.id}
                    className="overflow-hidden transition hover:shadow-xl"
                  >
                    <div className="relative aspect-square w-full overflow-hidden bg-slate-900">
                      {imagen && (
                        <img
                          src={imagen}
                          alt={nombreDisplay}
                          className="h-full w-full object-cover"
                          loading="lazy"
                          decoding="async"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      )}

                      <div className="absolute bottom-0 left-0 w-full bg-slate-950/80 p-3 backdrop-blur-sm sm:p-4">
                        <p className="mb-2 break-words text-sm font-semibold text-white">{nombreDisplay}</p>
                        <div className="grid grid-cols-1 gap-1.5 text-xs text-white sm:grid-cols-2 sm:gap-2">
                          <p>
                            <span className="font-semibold text-primary">Alm:</span>{" "}
                            {almacenamiento}
                          </p>
                          <p>
                            <span className="font-semibold text-primary">RAM:</span>{" "}
                            {p.ram}
                          </p>
                          <p>
                            <span className="font-semibold text-primary">
                              Garantia:
                            </span>{" "}
                            {p.warranty}
                          </p>
                          <p>
                            <span className="font-semibold text-primary">
                              Condicion:
                            </span>{" "}
                            <span className="rounded-full bg-primary px-2 py-1 text-[10px] font-semibold text-black">
                              {p.condition}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div className="w-full space-y-3">
                          {vendido ? (
                            <p className="text-xl font-extrabold uppercase tracking-wide text-rose-600">
                              Vendido
                            </p>
                          ) : (
                            <>
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm sm:text-base line-through text-muted-foreground">
                                  ${formatPrice(p.original)} ARS
                                </p>

                                <span
                                  className="whitespace-nowrap rounded-full border border-red-500 px-3 py-1 text-[11px] font-semibold text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.4)] sm:text-xs"
                                >
                                  3 Cuotas sin interes
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-lg font-bold text-green-600 sm:text-xl md:text-2xl">
                                  ${formatPrice(p.promo)} ARS
                                </p>

                                <span
                                  className="whitespace-nowrap rounded-full border border-emerald-500 px-3 py-1 text-[11px] font-semibold text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.4)] sm:text-xs"
                                >
                                  Efectivo y Transferencia
                                </span>
                              </div>
                            </>
                          )}
                        </div>

                        <a
                          href={`https://wa.me/5491124873190?text=${encodeURIComponent(mensaje)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full rounded-md bg-primary px-4 py-3 text-center text-sm font-medium text-secondary-foreground transition hover:bg-primary/80 sm:min-w-[130px] sm:w-auto sm:py-2"
                        >
                          Consultar
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Stock;
