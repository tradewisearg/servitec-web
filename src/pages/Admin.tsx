import { memo, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
  writeBatch,
  where
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { db, storage, auth } from "../lib/firebase";
import AdminLogin from "./AdminLogin";
import { ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from "recharts";

interface Producto {
  id: string;
  nombre: string;
  categoria: string;
  precio: number;
  precioCosto: number;
  stock: number;
  imagen: string;
}

interface Movimiento {
  tipo: "entrada" | "salida" | "venta" | string;
  producto: string;
  cantidad: number;
  total?: number;
  precioUnitario?: number;
  fecha?: { toDate?: () => Date };
  usuario?: string;
}

type Role = "superadmin" | "admin" | "viewer";

const CATEGORIA = [
  "Teclado",
  "Accesorios",
  "Mouse",
  "Kit Gamer",
  "Cable",
  "Auriculares",
  "Cargador"
];

const COLORS = ["#22c55e", "#f87171"];
const INVENTARIO_PAGE_SIZE = 24;
const HISTORIAL_PAGE_SIZE = 30;

const blockAnimation = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" as const }
  }
};

const Admin = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [role, setRole] = useState<Role | null>(null);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [ventasHistoricas, setVentasHistoricas] = useState<Movimiento[]>([]);
  const [visibleProductos, setVisibleProductos] = useState(INVENTARIO_PAGE_SIZE);
  const [visibleMovimientos, setVisibleMovimientos] = useState(HISTORIAL_PAGE_SIZE);

  const [form, setForm] = useState({
    nombre: "",
    categoria: "",
    precio: "",
    precioCosto: "",
    stock: ""
  });

  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [cantidadVenta, setCantidadVenta] = useState<Record<string, number>>({});
  const [productoEditando, setProductoEditando] = useState<Producto | null>(null);

  const [formEdit, setFormEdit] = useState({
    nombre: "",
    categoria: "",
    precio: "",
    precioCosto: "",
    stock: ""
  });

  useEffect(() => {
    let unsubStock: (() => void) | undefined;
    let unsubMovimientos: (() => void) | undefined;
    let unsubVentas: (() => void) | undefined;

    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      unsubStock?.();
      unsubMovimientos?.();
      unsubVentas?.();
      unsubStock = undefined;
      unsubMovimientos = undefined;
      unsubVentas = undefined;

      if (!user) {
        setIsAuth(false);
        setRole(null);
        setProductos([]);
        setMovimientos([]);
        setVentasHistoricas([]);
        return;
      }

      setIsAuth(true);
      const snap = await getDoc(doc(db, "users", user.uid));
      setRole((snap.data()?.role || "viewer") as Role);

      const stockQuery = query(collection(db, "stock"), orderBy("nombre"));
      unsubStock = onSnapshot(stockQuery, (stockSnap) => {
        setProductos(stockSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Producto)));
      });

      const movimientosQuery = query(
        collection(db, "movimientos"),
        orderBy("fecha", "desc"),
        limit(50)
      );
      unsubMovimientos = onSnapshot(movimientosQuery, (movSnap) => {
        setMovimientos(movSnap.docs.map((d) => d.data() as Movimiento));
      });

      const ventasQuery = query(collection(db, "movimientos"), where("tipo", "==", "venta"));
      unsubVentas = onSnapshot(ventasQuery, (ventasSnap) => {
        setVentasHistoricas(ventasSnap.docs.map((d) => d.data() as Movimiento));
      });
    });

    return () => {
      unsubStock?.();
      unsubMovimientos?.();
      unsubVentas?.();
      unsubAuth();
    };
  }, []);

  const abrirEditor = useCallback((producto: Producto) => {
    setProductoEditando(producto);
    setFormEdit({
      nombre: producto.nombre,
      categoria: producto.categoria,
      precio: String(producto.precio),
      precioCosto: String(producto.precioCosto || 0),
      stock: String(producto.stock)
    });
  }, []);

  const guardarEdicion = useCallback(async () => {
    if (!productoEditando || role === "viewer") return;

    const stockAnterior = productoEditando.stock;
    const stockNuevo = Number(formEdit.stock);

    let imageUrl = productoEditando.imagen;
    if (image) {
      const storageRef = ref(storage, `productos/${Date.now()}-${image.name}`);
      await uploadBytes(storageRef, image);
      imageUrl = await getDownloadURL(storageRef);
    }

    const batch = writeBatch(db);

    batch.update(doc(db, "stock", productoEditando.id), {
      nombre: formEdit.nombre,
      categoria: formEdit.categoria,
      precio: Number(formEdit.precio),
      precioCosto: Number(formEdit.precioCosto),
      stock: stockNuevo,
      imagen: imageUrl
    });

    if (!Number.isNaN(stockNuevo) && stockNuevo !== stockAnterior) {
      batch.set(doc(collection(db, "movimientos")), {
        producto: formEdit.nombre || productoEditando.nombre,
        tipo: stockNuevo > stockAnterior ? "entrada" : "salida",
        cantidad: Math.abs(stockNuevo - stockAnterior),
        anterior: stockAnterior,
        nuevo: stockNuevo,
        usuario: auth.currentUser?.email,
        fecha: serverTimestamp()
      });
    }

    await batch.commit();

    setProductoEditando(null);
    setImage(null);
    setPreview(null);
  }, [formEdit, image, productoEditando, role]);

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (role === "viewer") return;

      let imageUrl = "";
      if (image) {
        const storageRef = ref(storage, `productos/${Date.now()}-${image.name}`);
        await uploadBytes(storageRef, image);
        imageUrl = await getDownloadURL(storageRef);
      }

      const batch = writeBatch(db);
      const stockRef = doc(collection(db, "stock"));
      const movimientoRef = doc(collection(db, "movimientos"));
      const stockInicial = Number(form.stock);

      batch.set(stockRef, {
        nombre: form.nombre,
        categoria: form.categoria,
        precio: Number(form.precio),
        precioCosto: Number(form.precioCosto),
        stock: stockInicial,
        imagen: imageUrl
      });

      batch.set(movimientoRef, {
        producto: form.nombre,
        tipo: "entrada",
        cantidad: stockInicial,
        anterior: 0,
        nuevo: stockInicial,
        usuario: auth.currentUser?.email,
        fecha: serverTimestamp()
      });

      await batch.commit();

      setForm({ nombre: "", categoria: "", precio: "", precioCosto: "", stock: "" });
      setImage(null);
      setPreview(null);
    },
    [form, image, role]
  );

  const registrarVenta = useCallback(
    async (producto: Producto, cantidad: number) => {
      if (role === "viewer" || cantidad <= 0) return;
      if (cantidad > producto.stock) {
        alert("No hay suficiente stock");
        return;
      }

      const nuevoStock = producto.stock - cantidad;
      const batch = writeBatch(db);
      batch.update(doc(db, "stock", producto.id), { stock: nuevoStock });
      batch.set(doc(collection(db, "movimientos")), {
        producto: producto.nombre,
        tipo: "venta",
        cantidad,
        anterior: producto.stock,
        nuevo: nuevoStock,
        precioUnitario: producto.precio,
        total: producto.precio * cantidad,
        usuario: auth.currentUser?.email,
        fecha: serverTimestamp()
      });
      await batch.commit();

      setCantidadVenta((prev) => ({ ...prev, [producto.id]: 0 }));
    },
    [role]
  );

  const eliminarProducto = useCallback(
    async (id: string) => {
      if (role !== "superadmin") return;
      await deleteDoc(doc(db, "stock", id));
      setProductoEditando(null);
    },
    [role]
  );

  const handleCantidadChange = useCallback((id: string, value: number) => {
    setCantidadVenta((prev) => ({ ...prev, [id]: value }));
  }, []);

  const marginData = useMemo(() => {
    const precio = Number(form.precio);
    const costo = Number(form.precioCosto);
    if (!precio || !costo) return { margen: 0, porcentaje: "0" };
    const margen = precio - costo;
    return { margen, porcentaje: ((margen / costo) * 100).toFixed(1) };
  }, [form.precio, form.precioCosto]);

  const metrics = useMemo(() => {
    return productos.reduce(
      (acc, p) => {
        acc.stockTotal += p.stock;
        acc.valorInventario += p.stock * p.precioCosto;
        return acc;
      },
      { stockTotal: 0, valorInventario: 0 }
    );
  }, [productos]);

  const productosPorNombre = useMemo(() => {
    return new Map(productos.map((p) => [p.nombre, p]));
  }, [productos]);

  const financialData = useMemo(() => {
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);

    const acumuladoVentas = new Map<string, { cantidad: number; ganancia: number }>();
    const ventasUltimos30 = new Set<string>();
    let totalGananciaHistorica = 0;
    let totalCostoHistorico = 0;
    let gananciaUltimos30Dias = 0;

    for (const venta of ventasHistoricas) {
      const producto = productosPorNombre.get(venta.producto);
      const costoUnitario = producto?.precioCosto ?? 0;
      const costoTotal = costoUnitario * venta.cantidad;
      const ingreso = venta.total ?? (venta.precioUnitario ?? producto?.precio ?? 0) * venta.cantidad;
      const ganancia = ingreso - costoTotal;

      totalGananciaHistorica += ganancia;
      totalCostoHistorico += costoTotal;

      const registro = acumuladoVentas.get(venta.producto) || { cantidad: 0, ganancia: 0 };
      registro.cantidad += venta.cantidad || 0;
      registro.ganancia += ganancia;
      acumuladoVentas.set(venta.producto, registro);

      if (venta.fecha?.toDate && venta.fecha.toDate() >= hace30Dias) {
        gananciaUltimos30Dias += ganancia;
        ventasUltimos30.add(venta.producto);
      }
    }

    let productoMasRentable = "-";
    let productoMasVendido = "-";
    let maxGanancia = Number.NEGATIVE_INFINITY;
    let maxCantidad = Number.NEGATIVE_INFINITY;

    acumuladoVentas.forEach((valor, producto) => {
      if (valor.ganancia > maxGanancia) {
        maxGanancia = valor.ganancia;
        productoMasRentable = producto;
      }
      if (valor.cantidad > maxCantidad) {
        maxCantidad = valor.cantidad;
        productoMasVendido = producto;
      }
    });

    const margenPromedio = totalCostoHistorico > 0
      ? (totalGananciaHistorica / totalCostoHistorico) * 100
      : 0;

    return {
      totalGananciaHistorica,
      gananciaUltimos30Dias,
      margenPromedio,
      productoMasRentable,
      productoMasVendido,
      totalCostoHistorico,
      ventasUltimos30
    };
  }, [productosPorNombre, ventasHistoricas]);

  const resumen30Dias = useMemo(() => {
    const desde = new Date();
    desde.setDate(desde.getDate() - 30);

    return movimientos.reduce(
      (acc, m) => {
        if (m.tipo !== "venta" || !m.fecha?.toDate || m.fecha.toDate() < desde) return acc;
        const producto = productosPorNombre.get(m.producto);
        if (!producto) return acc;

        const costoTotal = producto.precioCosto * m.cantidad;
        const ganancia = (m.total || 0) - costoTotal;
        acc.costo += costoTotal;
        acc.ganancia += ganancia;
        return acc;
      },
      { costo: 0, ganancia: 0 }
    );
  }, [movimientos, productosPorNombre]);

  const dataPie = useMemo(
    () => [
      { name: "Ganancia", value: Math.max(0, financialData.totalGananciaHistorica) },
      { name: "Costo", value: Math.max(0, financialData.totalCostoHistorico) }
    ],
    [financialData.totalCostoHistorico, financialData.totalGananciaHistorica]
  );

  const alertasProductos = useMemo(() => {
    return productos.map((p) => {
      const margen = p.precioCosto > 0 ? ((p.precio - p.precioCosto) / p.precioCosto) * 100 : 0;
      return {
        ...p,
        margen,
        stockBajo: p.stock < 5,
        sinVentas30Dias: !financialData.ventasUltimos30.has(p.nombre),
        margenBajo: margen < 10
      };
    });
  }, [financialData.ventasUltimos30, productos]);

  const productosConAlertas = useMemo(
    () => alertasProductos.filter((p) => p.stockBajo || p.sinVentas30Dias || p.margenBajo),
    [alertasProductos]
  );

  const alertasPorProductoId = useMemo(
    () =>
      new Map(
        alertasProductos.map((p) => [
          p.id,
          {
            stockBajo: p.stockBajo,
            sinVentas30Dias: p.sinVentas30Dias,
            margenBajo: p.margenBajo
          }
        ])
      ),
    [alertasProductos]
  );

  const currency = useMemo(
    () =>
      new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0
      }),
    []
  );

  const productosVisibles = useMemo(
    () => productos.slice(0, visibleProductos),
    [productos, visibleProductos]
  );

  const movimientosVisibles = useMemo(
    () => movimientos.slice(0, visibleMovimientos),
    [movimientos, visibleMovimientos]
  );

  if (!isAuth) return <AdminLogin onLogin={() => setIsAuth(true)} />;

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-7xl space-y-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold sm:text-3xl">Dashboard Premium</h1>
          <button
            onClick={() => signOut(auth)}
            className="rounded-lg bg-red-500 px-4 py-2 text-white transition hover:bg-red-600"
          >
            Cerrar sesion
          </button>
        </div>

        <motion.div
          className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 sm:gap-6"
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
        >
          <Card title="Stock total" value={metrics.stockTotal} />
          <Card title="Valor inventario" value={currency.format(metrics.valorInventario)} />
          <Card title="Rol actual" value={role} />
          <Card title="Ganancia historica" value={currency.format(financialData.totalGananciaHistorica)} />
          <Card title="Ganancia ultimos 30 dias" value={currency.format(financialData.gananciaUltimos30Dias)} />
          <Card title="Margen promedio" value={`${financialData.margenPromedio.toFixed(1)}%`} />
          <Card title="Producto mas rentable" value={financialData.productoMasRentable} />
          <Card title="Producto mas vendido" value={financialData.productoMasVendido} />
        </motion.div>

        <div className="grid items-start gap-6 xl:grid-cols-12">
          <motion.section
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-7"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={blockAnimation}
          >
            <h2 className="mb-6 text-xl font-semibold">Dashboard financiero</h2>
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-xl border bg-slate-50 p-4">
                <p className="text-sm text-gray-500">Ingresos</p>
                <h3 className="text-xl font-bold text-emerald-600">
                  {currency.format(resumen30Dias.ganancia + resumen30Dias.costo)}
                </h3>
              </div>
              <div className="rounded-xl border bg-slate-50 p-4">
                <p className="text-sm text-gray-500">Costo</p>
                <h3 className="text-xl font-bold text-red-500">{currency.format(resumen30Dias.costo)}</h3>
              </div>
              <div className="rounded-xl border bg-slate-50 p-4">
                <p className="text-sm text-gray-500">Ganancia</p>
                <h3 className="text-xl font-bold text-emerald-700">{currency.format(resumen30Dias.ganancia)}</h3>
              </div>
            </div>

            {financialData.totalCostoHistorico === 0 && financialData.totalGananciaHistorica === 0 ? (
              <p className="text-gray-500">No hay datos suficientes para el grafico.</p>
            ) : (
              <div className="relative h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dataPie}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={125}
                      innerRadius={85}
                      paddingAngle={4}
                      isAnimationActive
                      animationDuration={800}
                    >
                      {dataPie.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Ganancia total
                  </p>
                  <p className="text-xl font-bold text-emerald-700">
                    {currency.format(financialData.totalGananciaHistorica)}
                  </p>
                  <p className="text-sm text-slate-600">
                    Margen {financialData.margenPromedio.toFixed(1)}%
                  </p>
                </div>
              </div>
            )}
          </motion.section>

          <div className="space-y-6 xl:col-span-5">
            <motion.section
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              variants={blockAnimation}
            >
              <h2 className="mb-4 text-xl font-semibold">Alertas inteligentes</h2>
              {productosConAlertas.length === 0 ? (
                <p className="text-sm text-emerald-700">No hay alertas criticas por ahora.</p>
              ) : (
                <div className="max-h-60 space-y-2 overflow-y-auto pr-1">
                  {productosConAlertas.map((producto) => (
                    <div
                      key={producto.id}
                      className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm"
                    >
                      <p className="font-semibold text-slate-800">{producto.nombre}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {producto.stockBajo && (
                          <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
                            Stock menor a 5
                          </span>
                        )}
                        {producto.sinVentas30Dias && (
                          <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-700">
                            Sin ventas en 30 dias
                          </span>
                        )}
                        {producto.margenBajo && (
                          <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-700">
                            Margen menor al 10%
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.section>

            {role !== "viewer" && (
              <motion.section
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
                variants={blockAnimation}
              >
                <h2 className="mb-4 text-xl font-semibold">Agregar nuevo producto</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <input
                      placeholder="Nombre del producto"
                      value={form.nombre}
                      onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))}
                      className="w-full rounded-lg border p-3"
                      required
                    />
                    <select
                      value={form.categoria}
                      onChange={(e) => setForm((prev) => ({ ...prev, categoria: e.target.value }))}
                      required
                      className="w-full rounded-lg border p-3"
                    >
                      <option value="">Seleccionar categoria</option>
                      {CATEGORIA.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder="Costo de proveedor"
                      value={form.precioCosto}
                      onChange={(e) => setForm((prev) => ({ ...prev, precioCosto: e.target.value }))}
                      className="w-full rounded-lg border p-3"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Precio Cliente"
                      value={form.precio}
                      onChange={(e) => setForm((prev) => ({ ...prev, precio: e.target.value }))}
                      className="w-full rounded-lg border p-3"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Stock a anadir"
                      value={form.stock}
                      onChange={(e) => setForm((prev) => ({ ...prev, stock: e.target.value }))}
                      className="w-full rounded-lg border p-3 md:col-span-2"
                      required
                    />
                  </div>

                  <input type="file" onChange={handleImageChange} />
                  {preview && (
                    <img
                      src={preview}
                      className="h-24 rounded-lg object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  )}

                  <button type="submit" className="rounded-lg bg-black px-5 py-2 text-white">
                    Guardar producto
                  </button>
                  <p className="text-sm text-green-600">
                    Ganancia estimada: ${marginData.margen} ({marginData.porcentaje}%)
                  </p>
                </form>
              </motion.section>
            )}
          </div>
        </div>

        <motion.section
          className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={blockAnimation}
        >
          <h2 className="mb-6 text-xl font-semibold">Gestion de inventario</h2>
          {productos.length === 0 && <p className="text-gray-500">No hay productos cargados.</p>}

          <motion.div
            className="space-y-6"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={{ show: { transition: { staggerChildren: 0.05 } } }}
          >
            {productosVisibles.map((p) => (
              <ProductoRow
                key={p.id}
                producto={p}
                role={role}
                cantidad={cantidadVenta[p.id] || 0}
                alertas={alertasPorProductoId.get(p.id)}
                onCantidadChange={handleCantidadChange}
                onRegistrarVenta={registrarVenta}
                onAbrirEditor={abrirEditor}
              />
            ))}
          </motion.div>
          {visibleProductos < productos.length && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setVisibleProductos((prev) => prev + INVENTARIO_PAGE_SIZE)}
                className="rounded-lg border bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
              >
                Cargar mas productos
              </button>
            </div>
          )}
        </motion.section>

        <motion.section
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={blockAnimation}
        >
          <h2 className="mb-6 text-lg font-semibold sm:text-xl">Historial de movimientos</h2>
          {movimientos.length === 0 && <p className="text-gray-500">No hay movimientos registrados.</p>}

          <div className="max-h-[500px] space-y-4 overflow-y-auto pr-2">
            {movimientosVisibles.map((m, i) => (
              <div
                key={`${m.producto}-${m.tipo}-${i}`}
                className="flex flex-col gap-2 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">
                    {m.tipo === "entrada" && "🟢 Entrada"}
                    {m.tipo === "salida" && "🔴 Salida"}
                    {m.tipo === "venta" && "💰 Venta"} - {m.producto}
                  </p>
                  <p className="text-xs text-gray-500 sm:text-sm">{m.usuario}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm font-semibold sm:text-base">{m.cantidad} unidades</p>
                  {m.total && <p className="text-xs text-emerald-600 sm:text-sm">Total: ${m.total}</p>}
                </div>
              </div>
            ))}
          </div>
          {visibleMovimientos < movimientos.length && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setVisibleMovimientos((prev) => prev + HISTORIAL_PAGE_SIZE)}
                className="rounded-lg border bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
              >
                Cargar mas movimientos
              </button>
            </div>
          )}
        </motion.section>

        <AnimatePresence>
          {productoEditando && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="relative w-full max-w-2xl rounded-2xl bg-white p-8 shadow-xl"
                initial={{ scale: 0.94, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.98, opacity: 0 }}
              >
                <button onClick={() => setProductoEditando(null)} className="absolute right-4 top-4">
                  X
                </button>

                <h2 className="mb-6 text-xl font-semibold">Editar producto</h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <input
                    value={formEdit.nombre}
                    onChange={(e) => setFormEdit((prev) => ({ ...prev, nombre: e.target.value }))}
                    className="rounded-lg border p-3"
                    placeholder="Nombre"
                  />
                  <select
                    value={formEdit.categoria}
                    onChange={(e) => setFormEdit((prev) => ({ ...prev, categoria: e.target.value }))}
                    className="rounded-lg border p-3"
                  >
                    {CATEGORIA.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={formEdit.precioCosto}
                    onChange={(e) => setFormEdit((prev) => ({ ...prev, precioCosto: e.target.value }))}
                    className="rounded-lg border p-3"
                    placeholder="Precio costo"
                  />
                  <input
                    type="number"
                    value={formEdit.precio}
                    onChange={(e) => setFormEdit((prev) => ({ ...prev, precio: e.target.value }))}
                    className="rounded-lg border p-3"
                    placeholder="Precio venta"
                  />
                  <input
                    type="number"
                    value={formEdit.stock}
                    onChange={(e) => setFormEdit((prev) => ({ ...prev, stock: e.target.value }))}
                    className="rounded-lg border p-3"
                    placeholder="Stock"
                  />
                </div>

                <div className="mt-6 space-y-3">
                  <input type="file" onChange={handleImageChange} />
                  {(preview || productoEditando.imagen) && (
                    <img
                      src={preview || productoEditando.imagen}
                      className="h-28 rounded-lg object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                </div>

                <div className="mt-8 flex justify-between">
                  {role === "superadmin" && (
                    <button
                      onClick={() => eliminarProducto(productoEditando.id)}
                      className="rounded-lg bg-red-500 px-4 py-2 text-white"
                    >
                      Eliminar
                    </button>
                  )}
                  <button onClick={guardarEdicion} className="rounded-lg bg-black px-6 py-2 text-white">
                    Guardar cambios
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const ProductoRow = memo(
  ({
    producto,
    role,
    cantidad,
    alertas,
    onCantidadChange,
    onRegistrarVenta,
    onAbrirEditor
  }: {
    producto: Producto;
    role: Role | null;
    cantidad: number;
    alertas?: {
      stockBajo: boolean;
      sinVentas30Dias: boolean;
      margenBajo: boolean;
    };
    onCantidadChange: (id: string, value: number) => void;
    onRegistrarVenta: (producto: Producto, cantidad: number) => Promise<void>;
    onAbrirEditor: (producto: Producto) => void;
  }) => (
    <div className="flex flex-col gap-4 rounded-xl border p-4 sm:gap-6 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-4">
        {producto.imagen && (
          <img
            src={producto.imagen}
            className="h-16 w-16 rounded-lg object-cover"
            loading="lazy"
            decoding="async"
          />
        )}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold">{producto.nombre}</h3>
            {alertas?.stockBajo && (
              <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
                Stock bajo
              </span>
            )}
            {alertas?.sinVentas30Dias && (
              <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-700">
                Sin ventas 30d
              </span>
            )}
            {alertas?.margenBajo && (
              <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-700">
                Margen &lt; 10%
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">Categoria: {producto.categoria}</p>
          <p className="text-sm">
            Stock: <b>{producto.stock}</b>
          </p>
          <p className="text-sm">
            Precio: <b>${producto.precio}</b>
          </p>
        </div>
      </div>

      {role !== "viewer" && (
        <div className="flex w-full flex-col gap-3 lg:w-[350px]">
          <button
            onClick={() => onAbrirEditor(producto)}
            className="rounded-lg border bg-slate-100 px-3 py-2 text-sm font-medium transition hover:bg-slate-200"
          >
            Editar producto
          </button>

          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              value={cantidad || ""}
              onChange={(e) => onCantidadChange(producto.id, Number(e.target.value))}
              className="w-full rounded-lg border p-2"
              placeholder="Cantidad vendida"
            />
            <button
              onClick={() => onRegistrarVenta(producto, cantidad)}
              className="rounded-lg bg-emerald-600 px-4 text-white"
            >
              Vender
            </button>
          </div>
        </div>
      )}
    </div>
  )
);

const Card = memo(({ title, value }: { title: string; value: ReactNode }) => (
  <motion.div
    variants={blockAnimation}
    className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
  >
    <p className="text-xs text-gray-500 sm:text-sm">{title}</p>
    <h2 className="mt-2 break-words text-lg font-semibold sm:text-2xl">{value}</h2>
  </motion.div>
));

export default Admin;
