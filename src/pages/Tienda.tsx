"use client";

import { useEffect, useMemo, useState } from "react";
import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "../lib/firebase";

interface Producto {
  id: string;
  nombre: string;
  categoria: string;
  imagen: string;
  precio: number;
  stock: number;
}

const Tienda = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState("");

  useEffect(() => {
    const stockQuery = query(collection(db, "stock"), orderBy("nombre"));
    const unsub = onSnapshot(stockQuery, (querySnapshot) => {
      const items = querySnapshot.docs.map((stockDoc) => ({
        id: stockDoc.id,
        ...stockDoc.data(),
      })) as Producto[];

      setProductos(items);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const productosFiltrados = useMemo(() => {
    const lista = productos.filter((p) =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );

    if (orden === "asc") {
      lista.sort((a, b) => a.precio - b.precio);
    }

    if (orden === "desc") {
      lista.sort((a, b) => b.precio - a.precio);
    }

    return lista;
  }, [productos, busqueda, orden]);

  const categorias = useMemo(
    () => [...new Set(productosFiltrados.map((p) => p.categoria))],
    [productosFiltrados]
  );

  return (
    <Layout>
      <section className="relative overflow-hidden py-24 text-white">
        <img
          src="/BAN-TN.png"
          alt="Banner Tienda"
          className="absolute inset-0 h-full w-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-slate-950/60" />

        <div className="container relative z-10 max-w-2xl text-center">
          <h1 className="font-display text-4xl font-bold">Tienda Completa</h1>
          <p className="mt-4 text-lg text-background/70">Stock actualizado en tiempo real.</p>
        </div>
      </section>

      <section className="bg-gradient-to-b from-slate-100 via-slate-100 to-slate-200 py-20 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
        <div className="container">
          <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 p-5 shadow-2xl sm:p-8 dark:border-zinc-700 dark:bg-zinc-900/90">
            <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-cyan-200/50 blur-3xl dark:bg-cyan-500/10" />
            <div className="pointer-events-none absolute -left-20 bottom-0 h-56 w-56 rounded-full bg-emerald-200/50 blur-3xl dark:bg-emerald-500/10" />

            <div className="mb-12 flex flex-col gap-6 md:flex-row md:justify-between">
            <input
              type="text"
              placeholder="Buscar producto..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white p-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-800 md:w-80"
            />

            <select
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white p-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-800"
            >
              <option value="">Ordenar</option>
              <option value="asc">Precio menor a mayor</option>
              <option value="desc">Precio mayor a menor</option>
            </select>
          </div>

          {loading && (
            <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-72 animate-pulse rounded-2xl bg-gray-200 dark:bg-zinc-800"
                />
              ))}
            </div>
          )}

          {!loading && categorias.length === 0 && (
            <p className="text-center text-muted-foreground">No hay productos encontrados.</p>
          )}

          {!loading &&
            categorias.map((categoria) => (
              <div key={categoria} className="mb-16">
                <h2 className="mb-8 inline-flex rounded-full border border-slate-300 bg-slate-100 px-4 py-1.5 text-xl font-bold text-slate-800 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100">
                  {categoria}
                </h2>

                <motion.div
                  layout
                  className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                >
                  {productosFiltrados
                    .filter((p) => p.categoria === categoria)
                    .map((producto) => (
                      <motion.div
                        key={producto.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card className="group overflow-hidden border-slate-200 bg-white/90 transition hover:-translate-y-1 hover:shadow-xl dark:border-zinc-700 dark:bg-zinc-900/90">
                          {producto.imagen && (
                            <img
                              src={producto.imagen}
                              alt={producto.nombre}
                              className="h-48 w-full object-cover transition duration-300 group-hover:scale-105"
                              loading="lazy"
                              decoding="async"
                            />
                          )}

                          <CardContent className="p-6">
                            <h3 className="text-lg font-semibold">{producto.nombre}</h3>

                            <p className="mt-2 text-xl font-bold text-primary">
                              ${producto.precio.toLocaleString()}
                            </p>

                            <p className="text-sm text-muted-foreground">
                              {producto.stock > 0 ? "En stock" : "Sin stock"}
                            </p>

                            <Button
                              asChild
                              size="sm"
                              className="mt-4 w-full bg-whatsapp text-whatsapp-foreground hover:bg-whatsapp/90"
                            >
                              <a
                                href={`https://wa.me/5491124873190?text=${encodeURIComponent(
                                  `Hola, quiero consultar por ${producto.nombre}`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <MessageCircle size={16} className="mr-2" />
                                Consultar
                              </a>
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Tienda;
