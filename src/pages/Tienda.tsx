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

      <section className="bg-slate-50 py-20 dark:bg-zinc-900">
        <div className="container">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:justify-between">
            <input
              type="text"
              placeholder="Buscar producto..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full rounded-xl border p-3 dark:bg-zinc-800 md:w-80"
            />

            <select
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
              className="rounded-xl border p-3 dark:bg-zinc-800"
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
                <h2 className="mb-8 text-2xl font-bold">{categoria}</h2>

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
                        <Card className="group overflow-hidden transition hover:shadow-xl">
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
      </section>
    </Layout>
  );
};

export default Tienda;
