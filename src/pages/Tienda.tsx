"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
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

  useEffect(() => {
    const fetchProductos = async () => {
      const querySnapshot = await getDocs(collection(db, "stock"));
      const items: Producto[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Producto[];

      setProductos(items);
      setLoading(false);
    };

    fetchProductos();
  }, []);

  // Agrupar por categoría
  const categorias = [...new Set(productos.map((p) => p.categoria))];

  return (
    <Layout>
      {/* HERO */}
      <section className="relative overflow-hidden py-24 text-white">
        <img
          src="/BAN-TN.png"
          alt="Banner Tienda"
          className="absolute inset-0 h-full w-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-slate-950/60" />

        <div className="container relative z-10 max-w-2xl text-center">
          <h1 className="font-display text-4xl font-bold">
            Tienda Completa
          </h1>
          <p className="mt-4 text-lg text-background/70">
            Stock actualizado en tiempo real.
          </p>
        </div>
      </section>

      {/* PRODUCTOS */}
      <section className="py-20 bg-slate-50 dark:bg-zinc-900">
        <div className="container">

          {loading && (
            <p className="text-center text-muted-foreground">
              Cargando productos...
            </p>
          )}

          {!loading && categorias.length === 0 && (
            <p className="text-center text-muted-foreground">
              No hay productos cargados.
            </p>
          )}

          {categorias.map((categoria) => (
            <div key={categoria} className="mb-16">
              <h2 className="text-2xl font-bold mb-8">
                {categoria}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {productos
                  .filter((p) => p.categoria === categoria)
                  .map((producto) => (
                    <Card
                      key={producto.id}
                      className="group overflow-hidden hover:shadow-xl transition"
                    >
                      {producto.imagen && (
                        <img
                          src={producto.imagen}
                          alt={producto.nombre}
                          className="h-48 w-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      )}

                      <CardContent className="p-6">
                        <h3 className="font-semibold text-lg">
                          {producto.nombre}
                        </h3>

                        <p className="mt-2 font-bold text-primary">
                          ${producto.precio.toLocaleString()}
                        </p>

                        <p className="text-sm text-muted-foreground">
                          Stock: {producto.stock}
                        </p>

                        <Button
                          asChild
                          size="sm"
                          className="mt-4 w-full bg-whatsapp text-whatsapp-foreground hover:bg-whatsapp/90"
                        >
                          <a
                            href={`https://wa.me/5491124873190?text=Hola,%20quiero%20consultar%20por%20${producto.nombre}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <MessageCircle size={16} /> Consultar
                          </a>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default Tienda;
