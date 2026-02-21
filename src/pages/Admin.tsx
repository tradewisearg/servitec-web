import { memo, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  increment,
  setDoc,
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
import { useNavigate } from "react-router-dom";
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
  origen?: string;
}

interface ResumenFinancieroDiario {
  fecha: string;
  facturacion: number;
  costo: number;
  ganancia: number;
  ventas: number;
  unidadesVendidas: number;
}

type Role = "admin" | "viewer";
type UiMessage = { type: "success" | "error" | "info"; text: string };

const CATEGORIA = [
  "ACCESORIOS",
  "ADAPTADORES",
  "ALMACENAMIENTO",
  "ARTICULOS",
  "AURICULARES",
  "CARGADORES",
  "CABLES",
  "CARGADOR NOTEBOOK",
  "CELULARES",
  "CONSOLAS",
  "HIDROGEL",
  "INSUMOS TECNICOS",
  "JOYSTICK PS4 AAA",
  "PARLANTES",
  "PERIFERICOS",
  "SOPORTES",
  "TECLADOS",
  "WEBCAM"
];

const normalizeImportedCategory = (rawCategory: string) => {
  const normalized = rawCategory.trim();
  if (!normalized) return "ARTICULO";

  const canonByUpper = new Map(CATEGORIA.map((cat) => [cat.toUpperCase(), cat]));
  return canonByUpper.get(normalized.toUpperCase()) || normalized;
};

const COLORS = ["#22c55e", "#f87171"];
const INVENTARIO_PAGE_SIZE = 24;
const HISTORIAL_PAGE_SIZE = 30;
const MAX_IMAGE_SIDE = 1200;
const WEBP_QUALITY = 0.82;

const getLocalDayKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseCsvRows = (csvText: string) => {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i += 1) {
    const char = csvText[i];

    if (char === '"') {
      if (inQuotes && csvText[i + 1] === '"') {
        cell += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && csvText[i + 1] === "\n") i += 1;
      row.push(cell);
      if (row.some((value) => value.trim() !== "")) rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  row.push(cell);
  if (row.some((value) => value.trim() !== "")) rows.push(row);
  return rows;
};

const optimizeImageForUpload = async (file: File) => {
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("No se pudo leer la imagen."));
      img.src = objectUrl;
    });

    const longestSide = Math.max(image.width, image.height) || 1;
    const scale = Math.min(1, MAX_IMAGE_SIDE / longestSide);
    const targetWidth = Math.max(1, Math.round(image.width * scale));
    const targetHeight = Math.max(1, Math.round(image.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No se pudo preparar la compresion de imagen.");
    ctx.drawImage(image, 0, 0, targetWidth, targetHeight);

    const webpBlob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/webp", WEBP_QUALITY);
    });
    if (!webpBlob) throw new Error("No se pudo convertir la imagen a WebP.");

    const baseName = file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9-_]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "producto";

    return new File([webpBlob], `${baseName}.webp`, { type: "image/webp" });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};

const blockAnimation = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" as const }
  }
};

const getMovimientoMeta = (tipo: string) => {
  if (tipo === "entrada") return { label: "Entrada", color: "text-emerald-700" };
  if (tipo === "salida") return { label: "Salida", color: "text-rose-700" };
  if (tipo === "venta") return { label: "Venta", color: "text-blue-700" };
  return { label: tipo, color: "text-slate-700" };
};

const getMarginData = (precioInput: number, costoInput: number) => {
  const precio = Number(precioInput);
  const costo = Number(costoInput);
  if (!precio || !costo) return { margen: 0, porcentaje: "0" };
  const margen = precio - costo;
  return { margen, porcentaje: ((margen / costo) * 100).toFixed(1) };
};

const Admin = () => {
  const navigate = useNavigate();
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
  const [fechaConsulta, setFechaConsulta] = useState(getLocalDayKey(new Date()));
  const [resumenDiario, setResumenDiario] = useState<ResumenFinancieroDiario | null>(null);
  const [cargandoResumenDiario, setCargandoResumenDiario] = useState(false);
  const [archivoCsv, setArchivoCsv] = useState<File | null>(null);
  const [importandoCsv, setImportandoCsv] = useState(false);
  const [uiMessage, setUiMessage] = useState<UiMessage | null>(null);

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

  useEffect(() => {
    if (!isAuth || role !== "admin") {
      setResumenDiario(null);
      setCargandoResumenDiario(false);
      return;
    }

    setCargandoResumenDiario(true);
    const resumenRef = doc(db, "resumen_financiero_diario", fechaConsulta);
    const unsubResumen = onSnapshot(
      resumenRef,
      (snap) => {
        if (!snap.exists()) {
          setResumenDiario(null);
          setCargandoResumenDiario(false);
          return;
        }

        const data = snap.data() as Partial<ResumenFinancieroDiario>;
        setResumenDiario({
          fecha: fechaConsulta,
          facturacion: Number(data.facturacion || 0),
          costo: Number(data.costo || 0),
          ganancia: Number(data.ganancia || 0),
          ventas: Number(data.ventas || 0),
          unidadesVendidas: Number(data.unidadesVendidas || 0)
        });
        setCargandoResumenDiario(false);
      },
      () => {
        setResumenDiario(null);
        setCargandoResumenDiario(false);
      }
    );

    return () => unsubResumen();
  }, [fechaConsulta, isAuth, role]);

  useEffect(() => {
    if (!uiMessage) return;
    const timeout = setTimeout(() => setUiMessage(null), 5000);
    return () => clearTimeout(timeout);
  }, [uiMessage]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

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
      let imageToUpload = image;
      try {
        imageToUpload = await optimizeImageForUpload(image);
      } catch {
        setUiMessage({
          type: "info",
          text: "No se pudo optimizar la imagen. Se subio el archivo original."
        });
      }

      const storageRef = ref(storage, `productos/${Date.now()}-${imageToUpload.name}`);
      await uploadBytes(storageRef, imageToUpload);
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
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
  }, [preview]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (role === "viewer") return;

      let imageUrl = "";
      if (image) {
        let imageToUpload = image;
        try {
          imageToUpload = await optimizeImageForUpload(image);
        } catch {
          setUiMessage({
            type: "info",
            text: "No se pudo optimizar la imagen. Se subio el archivo original."
          });
        }

        const storageRef = ref(storage, `productos/${Date.now()}-${imageToUpload.name}`);
        await uploadBytes(storageRef, imageToUpload);
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
        setUiMessage({ type: "error", text: "No hay suficiente stock para registrar esa venta." });
        return;
      }

      const nuevoStock = producto.stock - cantidad;
      const ingresoTotal = producto.precio * cantidad;
      const costoTotal = (producto.precioCosto || 0) * cantidad;
      const gananciaTotal = ingresoTotal - costoTotal;
      const dayKey = getLocalDayKey(new Date());
      const ventaBatch = writeBatch(db);
      ventaBatch.update(doc(db, "stock", producto.id), { stock: nuevoStock });
      ventaBatch.set(doc(collection(db, "movimientos")), {
        producto: producto.nombre,
        tipo: "venta",
        cantidad,
        anterior: producto.stock,
        nuevo: nuevoStock,
        precioUnitario: producto.precio,
        total: ingresoTotal,
        usuario: auth.currentUser?.email,
        fecha: serverTimestamp()
      });
      await ventaBatch.commit();

      try {
        await setDoc(
          doc(db, "resumen_financiero_diario", dayKey),
          {
            fecha: dayKey,
            facturacion: increment(ingresoTotal),
            costo: increment(costoTotal),
            ganancia: increment(gananciaTotal),
            ventas: increment(1),
            unidadesVendidas: increment(cantidad),
            updatedAt: serverTimestamp()
          },
          { merge: true }
        );
      } catch (error) {
        console.error("No se pudo actualizar el resumen diario:", error);
      }

      setCantidadVenta((prev) => ({ ...prev, [producto.id]: 0 }));
    },
    [role]
  );

  const eliminarProducto = useCallback(
    async (id: string) => {
      if (role === "viewer") return;
      await deleteDoc(doc(db, "stock", id));
      setProductoEditando(null);
    },
    [role]
  );

  const handleCantidadChange = useCallback((id: string, value: number) => {
    setCantidadVenta((prev) => ({ ...prev, [id]: value }));
  }, []);

  const importarStockDesdeCsv = useCallback(async () => {
    if (role === "viewer" || !archivoCsv) return;

    setImportandoCsv(true);
    try {
      const csvText = await archivoCsv.text();
      const rows = parseCsvRows(csvText);
      if (rows.length < 2) throw new Error("El CSV no tiene filas de datos.");

      const headers = rows[0].map((h) => h.trim().toLowerCase());
      const idxName = headers.indexOf("name");
      const idxCategory = headers.indexOf("category");
      const idxCost = headers.indexOf("cost");
      const idxPrice = headers.indexOf("price");
      const idxQuantity = headers.indexOf("quantity");
      const idxDeletedAt = headers.indexOf("deletedat");

      if ([idxName, idxCategory, idxCost, idxPrice, idxQuantity].some((idx) => idx < 0)) {
        throw new Error("Faltan columnas obligatorias: Name, Category, Cost, Price o Quantity.");
      }

      const productosPorNombreNormalizado = new Map(
        productos.map((p) => [p.nombre.trim().toLowerCase(), p])
      );

      let creados = 0;
      let actualizados = 0;
      let omitidos = 0;
      let movimientosRegistrados = 0;

      let batch = writeBatch(db);
      let ops = 0;
      const commitBatch = async () => {
        if (ops === 0) return;
        await batch.commit();
        batch = writeBatch(db);
        ops = 0;
      };

      for (let i = 1; i < rows.length; i += 1) {
        const row = rows[i];
        const deletedAt = idxDeletedAt >= 0 ? String(row[idxDeletedAt] || "").trim() : "";
        if (deletedAt) {
          omitidos += 1;
          continue;
        }

        const nombre = String(row[idxName] || "").trim();
        const categoriaCsv = String(row[idxCategory] || "").trim();
        const categoria = normalizeImportedCategory(categoriaCsv);
        const precioCosto = Number(String(row[idxCost] || "").replace(",", "."));
        const precio = Number(String(row[idxPrice] || "").replace(",", "."));
        const stock = Number(String(row[idxQuantity] || "").replace(",", "."));

        if (!nombre || Number.isNaN(precioCosto) || Number.isNaN(precio) || Number.isNaN(stock)) {
          omitidos += 1;
          continue;
        }

        const key = nombre.toLowerCase();
        const existente = productosPorNombreNormalizado.get(key);
        const payload = {
          nombre,
          categoria,
          precio,
          precioCosto,
          stock,
          imagen: existente?.imagen || ""
        };

        if (existente) {
          batch.update(doc(db, "stock", existente.id), payload);
          ops += 1;

          const diferenciaStock = stock - Number(existente.stock || 0);
          if (diferenciaStock !== 0) {
            batch.set(doc(collection(db, "movimientos")), {
              producto: nombre,
              tipo: diferenciaStock > 0 ? "entrada" : "salida",
              cantidad: Math.abs(diferenciaStock),
              anterior: Number(existente.stock || 0),
              nuevo: stock,
              usuario: auth.currentUser?.email || "importador_csv",
              origen: "importacion_csv",
              fecha: serverTimestamp()
            });
            ops += 1;
            movimientosRegistrados += 1;
          }

          actualizados += 1;
        } else {
          batch.set(doc(collection(db, "stock")), payload);
          ops += 1;

          if (stock > 0) {
            batch.set(doc(collection(db, "movimientos")), {
              producto: nombre,
              tipo: "entrada",
              cantidad: stock,
              anterior: 0,
              nuevo: stock,
              usuario: auth.currentUser?.email || "importador_csv",
              origen: "importacion_csv",
              fecha: serverTimestamp()
            });
            ops += 1;
            movimientosRegistrados += 1;
          }

          creados += 1;
        }
        if (ops >= 400) await commitBatch();
      }

      await commitBatch();
      setArchivoCsv(null);
      setUiMessage({
        type: "success",
        text: `Importacion completada. Creados: ${creados}, actualizados: ${actualizados}, movimientos: ${movimientosRegistrados}, omitidos: ${omitidos}.`
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Error inesperado importando CSV.";
      setUiMessage({ type: "error", text: msg });
    } finally {
      setImportandoCsv(false);
    }
  }, [archivoCsv, productos, role]);

  const descargarPlantillaCsv = useCallback(() => {
    const headers = ["Name", "Description", "Category", "Cost", "Price", "Quantity", "DeletedAt"];
    const ejemplo = [
      "Producto de ejemplo",
      "",
      CATEGORIA[0],
      "10000",
      "15000",
      "5",
      ""
    ];
    const csv = `${headers.join(",")}\n${ejemplo.join(",")}\n`;
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "plantilla_stock.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setUiMessage({ type: "info", text: "Plantilla CSV descargada." });
  }, []);

  const marginData = useMemo(() => {
    return getMarginData(Number(form.precio), Number(form.precioCosto));
  }, [form.precio, form.precioCosto]);

  const editMarginData = useMemo(() => {
    return getMarginData(Number(formEdit.precio), Number(formEdit.precioCosto));
  }, [formEdit.precio, formEdit.precioCosto]);

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
    <div className="relative min-h-screen overflow-x-hidden bg-slate-950 px-3 py-6 text-slate-100 sm:px-6 sm:py-8 lg:px-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute right-0 top-20 h-80 w-80 rounded-full bg-blue-500/25 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-rose-500/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl space-y-8 sm:space-y-10">
        <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur-lg sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-center gap-3">
            <div className="relative grid h-12 w-12 place-items-center rounded-xl border border-white/20 bg-white/10 shadow-lg">
              <div className="h-6 w-6 rounded-md bg-gradient-to-br from-sky-400 to-blue-600" />
              <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-red-500" />
            </div>
            <div>
              <p className="text-2xl font-black tracking-tight leading-none">
                <span className="text-sky-300">Stock</span>
                <span className="text-red-500">AI</span>
              </p>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Panel administrativo</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => navigate("/")}
              className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              Ir al inicio
            </button>
            <button
              onClick={() => signOut(auth)}
              className="rounded-xl border border-rose-300/30 bg-rose-500/80 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500"
            >
              Cerrar sesion
            </button>
          </div>
        </div>

        {uiMessage && (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm shadow-lg backdrop-blur ${
              uiMessage.type === "success"
                ? "border-emerald-200/30 bg-emerald-500/20 text-emerald-100"
                : uiMessage.type === "error"
                  ? "border-red-200/30 bg-red-500/20 text-red-100"
                  : "border-slate-200/30 bg-slate-500/20 text-slate-100"
            }`}
          >
            {uiMessage.text}
          </div>
        )}

        <motion.div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-6"
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
            className="rounded-3xl border border-white/10 bg-white p-5 text-slate-900 shadow-2xl sm:p-6 xl:col-span-7"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={blockAnimation}
          >
            <h2 className="mb-6 text-xl font-semibold">Dashboard financiero</h2>
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4">
                <p className="text-sm text-gray-500">Ingresos</p>
                <h3 className="text-xl font-bold text-emerald-600">
                  {currency.format(resumen30Dias.ganancia + resumen30Dias.costo)}
                </h3>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4">
                <p className="text-sm text-gray-500">Costo</p>
                <h3 className="text-xl font-bold text-red-500">{currency.format(resumen30Dias.costo)}</h3>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4">
                <p className="text-sm text-gray-500">Ganancia</p>
                <h3 className="text-xl font-bold text-emerald-700">{currency.format(resumen30Dias.ganancia)}</h3>
              </div>
            </div>

            <div className="mb-6 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm text-gray-500">Resumen por fecha</p>
                  <h3 className="text-lg font-semibold text-slate-800">Consultar facturacion diaria</h3>
                </div>
                <input
                  type="date"
                  value={fechaConsulta}
                  onChange={(e) => setFechaConsulta(e.target.value)}
                  className="rounded-xl border border-slate-300 px-3 py-2"
                />
              </div>

              {cargandoResumenDiario ? (
                <p className="text-sm text-gray-500">Cargando resumen diario...</p>
              ) : !resumenDiario ? (
                <p className="text-sm text-gray-500">No hay datos guardados para esta fecha.</p>
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <p className="text-xs text-gray-500">Facturacion</p>
                    <p className="font-semibold text-emerald-700">
                      {currency.format(resumenDiario.facturacion)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <p className="text-xs text-gray-500">Costo</p>
                    <p className="font-semibold text-red-500">{currency.format(resumenDiario.costo)}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <p className="text-xs text-gray-500">Ganancia</p>
                    <p className="font-semibold text-emerald-700">
                      {currency.format(resumenDiario.ganancia)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <p className="text-xs text-gray-500">Ventas</p>
                    <p className="font-semibold text-slate-800">{resumenDiario.ventas}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <p className="text-xs text-gray-500">Unidades vendidas</p>
                    <p className="font-semibold text-slate-800">{resumenDiario.unidadesVendidas}</p>
                  </div>
                </div>
              )}
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
              className="rounded-3xl border border-white/10 bg-white p-6 text-slate-900 shadow-2xl"
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
                      className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm shadow-sm"
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
              <>
                <motion.section
                  className="rounded-3xl border border-white/10 bg-white p-6 text-slate-900 shadow-2xl"
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

                    <input type="file" accept="image/*" onChange={handleImageChange} />
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

                <motion.section
                  className="rounded-3xl border border-white/10 bg-white p-6 text-slate-900 shadow-2xl"
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={blockAnimation}
                >
                  <h2 className="mb-4 text-xl font-semibold">Carga masiva de stock (CSV)</h2>
                  <div className="space-y-3">
                    <input
                      type="file"
                      accept=".csv,text/csv"
                      onChange={(e) => setArchivoCsv(e.target.files?.[0] || null)}
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={importarStockDesdeCsv}
                        disabled={!archivoCsv || importandoCsv}
                        className="rounded-xl bg-emerald-600 px-5 py-2 font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {importandoCsv ? "Importando..." : "Importar CSV"}
                      </button>
                      <button
                        onClick={descargarPlantillaCsv}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                      >
                        Descargar plantilla
                      </button>
                    </div>
                  </div>
                </motion.section>
              </>
            )}
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-12">
        <motion.section
          className="rounded-3xl border border-white/10 bg-white p-5 text-slate-900 shadow-2xl sm:p-8 xl:col-span-7"
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
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium transition hover:bg-slate-100"
              >
                Cargar mas productos
              </button>
            </div>
          )}
        </motion.section>

        <motion.section
          className="rounded-3xl border border-white/10 bg-white p-5 text-slate-900 shadow-2xl sm:p-8 xl:col-span-5"
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
                className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-medium">
                    <span className={getMovimientoMeta(m.tipo).color}>{getMovimientoMeta(m.tipo).label}</span> -{' '}
                    <span className="break-words">{m.producto}</span>
                  </p>
                  <p className="text-xs text-gray-500 sm:text-sm">
                    {m.usuario}
                    {m.origen === "importacion_csv" ? " • Importacion CSV" : ""}
                  </p>
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
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium transition hover:bg-slate-100"
              >
                Cargar mas movimientos
              </button>
            </div>
          )}
        </motion.section>
        </div>

        <AnimatePresence>
          {productoEditando && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl sm:p-8"
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
                  <input type="file" accept="image/*" onChange={handleImageChange} />
                  {(preview || productoEditando.imagen) && (
                    <img
                      src={preview || productoEditando.imagen}
                      className="h-28 rounded-lg object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                </div>
                <p className="mt-4 text-sm text-emerald-700">
                  Ganancia estimada: ${editMarginData.margen} ({editMarginData.porcentaje}%)
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  {role !== "viewer" && (
                    <button
                      onClick={() => eliminarProducto(productoEditando.id)}
                      className="rounded-lg bg-red-500 px-4 py-2 text-white"
                    >
                      Eliminar producto
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
  }) => {
    const marginInfo = getMarginData(Number(producto.precio), Number(producto.precioCosto));

    return (
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 shadow-sm sm:gap-6 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-4">
        {producto.imagen && (
          <img
            src={producto.imagen}
            className="h-16 w-16 rounded-xl object-cover ring-1 ring-slate-200"
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
          <p className="text-sm text-emerald-700">
            Ganancia estimada: ${marginInfo.margen} ({marginInfo.porcentaje}%)
          </p>
        </div>
      </div>

      {role !== "viewer" && (
        <div className="flex w-full flex-col gap-3 lg:w-[350px]">
          <button
            onClick={() => onAbrirEditor(producto)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium transition hover:bg-slate-100"
          >
            Editar producto
          </button>

          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              value={cantidad || ""}
              onChange={(e) => onCantidadChange(producto.id, Number(e.target.value))}
              className="w-full rounded-xl border border-slate-300 p-2"
              placeholder="Cantidad vendida"
            />
            <button
              onClick={() => onRegistrarVenta(producto, cantidad)}
              className="rounded-xl bg-emerald-600 px-4 font-medium text-white transition hover:bg-emerald-700"
            >
              Vender
            </button>
          </div>
        </div>
      )}
      </div>
    );
  }
);

const Card = memo(({ title, value }: { title: string; value: ReactNode }) => (
  <motion.div
    variants={blockAnimation}
    className="rounded-2xl border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur-lg sm:p-6"
  >
    <p className="text-xs uppercase tracking-wide text-slate-300 sm:text-sm">{title}</p>
    <h2 className="mt-2 break-words text-lg font-semibold text-white sm:text-2xl">{value}</h2>
  </motion.div>
));

export default Admin;


