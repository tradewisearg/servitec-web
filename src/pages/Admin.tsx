import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
  query,
  orderBy,
  limit
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { db, storage, auth } from "../lib/firebase";
import AdminLogin from "./AdminLogin";

interface Producto {
  id: string;
  nombre: string;
  categoria: string;
  precio: number;
  stock: number;
  imagen: string;
}

type Role = "superadmin" | "admin" | "viewer";

const CATEGORIA = ["Teclado", "Accesorios", "Mouse", "Kit Gamer", "Cable", "Auriculares", "Cargador"];

const Admin = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [role, setRole] = useState<Role | null>(null);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [movimientos, setMovimientos] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);

  const [form, setForm] = useState({
    nombre: "",
    categoria: "",
    precio: "",
    stock: ""
  });

  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  /* ================= AUTH ================= */

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setIsAuth(false);
        return;
      }

      setIsAuth(true);

      const snap = await getDoc(doc(db, "users", user.uid));
      setRole(snap.data()?.role || "viewer");

      fetchProductos();
      fetchMovimientos();
      fetchUsuarios();
    });

    return () => unsub();
  }, []);

  /* ================= FETCH ================= */

  const fetchProductos = async () => {
    const snap = await getDocs(collection(db, "stock"));
    setProductos(
      snap.docs.map((d) => ({ id: d.id, ...d.data() } as Producto))
    );
  };

  const fetchMovimientos = async () => {
    const q = query(
      collection(db, "movimientos"),
      orderBy("fecha", "desc"),
      limit(10)
    );
    const snap = await getDocs(q);
    setMovimientos(snap.docs.map((d) => d.data()));
  };

  const fetchUsuarios = async () => {
    const snap = await getDocs(collection(db, "users"));
    setUsuarios(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };


  /* ================= MÉTRICAS ================= */

  const stockTotal = productos.reduce(
    (acc, p) => acc + p.stock,
    0
  );

  const valorInventario = productos.reduce(
    (acc, p) => acc + p.stock * p.precio,
    0
  );

  /* ================= AGREGAR PRODUCTO ================= */

  const handleImageChange = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (role === "viewer") return;

    let imageUrl = "";

    if (image) {
      const storageRef = ref(
        storage,
        `productos/${Date.now()}-${image.name}`
      );
      await uploadBytes(storageRef, image);
      imageUrl = await getDownloadURL(storageRef);
    }

    await addDoc(collection(db, "stock"), {
      nombre: form.nombre,
      categoria: form.categoria,
      precio: Number(form.precio),
      stock: Number(form.stock),
      imagen: imageUrl
    });

    await addDoc(collection(db, "movimientos"), {
      producto: form.nombre,
      tipo: "entrada",
      cantidad: Number(form.stock),
      anterior: 0,
      nuevo: Number(form.stock),
      usuario: auth.currentUser?.email,
      fecha: new Date()
    });

    setForm({
      nombre: "",
      categoria: "",
      precio: "",
      stock: ""
    });
    setImage(null);
    setPreview(null);

    fetchProductos();
    fetchMovimientos();
  };

  /* ================= MODIFICAR STOCK ================= */

  const modificarStock = async (
    producto: Producto,
    cantidad: number,
    tipo: "entrada" | "salida"
  ) => {
    if (role === "viewer") return;

    let nuevoStock =
      tipo === "entrada"
        ? producto.stock + cantidad
        : producto.stock - cantidad;

    if (nuevoStock < 0) nuevoStock = 0;

    await updateDoc(doc(db, "stock", producto.id), {
      stock: nuevoStock
    });

    await addDoc(collection(db, "movimientos"), {
      producto: producto.nombre,
      tipo,
      cantidad,
      anterior: producto.stock,
      nuevo: nuevoStock,
      usuario: auth.currentUser?.email,
      fecha: new Date()
    });

    fetchProductos();
    fetchMovimientos();
  };




  /* ================= ACTUALIZAR PRECIO ================= */
  const actualizarPrecio = async (
    producto: Producto,
    nuevoPrecio: number
  ) => {
    if (role === "viewer") return;

    await updateDoc(doc(db, "stock", producto.id), {
      precio: nuevoPrecio
    });

    fetchProductos();
  };

  /* ================= UPDATE ROLE ================= */

  const updateRole = async (uid: string, nuevoRole: Role) => {
    if (role !== "superadmin") return;

    await updateDoc(doc(db, "users", uid), {
      role: nuevoRole
    });

    fetchUsuarios();
  };

  if (!isAuth) return <AdminLogin onLogin={() => setIsAuth(true)} />;



  /* ================= ELIMINAR PRODUCTO ================= */
  const eliminarProducto = async (id: string) => {
    if (role !== "superadmin") return;

    await deleteDoc(doc(db, "stock", id));
    fetchProductos();
  };


  return (
    <div className="min-h-screen bg-slate-100 px-4 sm:px-8 py-10">
      <div className="max-w-7xl mx-auto space-y-12">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-semibold">
            Dashboard Premium
          </h1>

          <button
            onClick={() => signOut(auth)}
            className="bg-red-500 hover:bg-red-600 transition text-white px-4 py-2 rounded-lg"
          >
            Cerrar sesión
          </button>
        </div>

        {/* MÉTRICAS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <Card title="Productos" value={productos.length} />
          <Card title="Stock total" value={stockTotal} />
          <Card title="Valor inventario" value={`$${valorInventario}`} />
          <Card title="Rol actual" value={role} />
        </div>


        {/* FORMULARIO PROFESIONAL */}
        {role !== "viewer" && (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-semibold mb-6">
              Agregar nuevo producto
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input
                  placeholder="Nombre del producto"
                  value={form.nombre}
                  onChange={(e) =>
                    setForm({ ...form, nombre: e.target.value })
                  }
                  className="border p-3 rounded-lg w-full"
                  required
                />

                <select
                  value={form.categoria}
                  onChange={(e) =>
                    setForm({ ...form, categoria: e.target.value })
                  }
                  required
                  className="border p-3 rounded-lg w-full"
                >
                  <option value="">Seleccionar categoría</option>
                  {CATEGORIA.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  placeholder="Precio"
                  value={form.precio}
                  onChange={(e) =>
                    setForm({ ...form, precio: e.target.value })
                  }
                  className="border p-3 rounded-lg w-full"
                  required
                />

                <input
                  type="number"
                  placeholder="Stock"
                  value={form.stock}
                  onChange={(e) =>
                    setForm({ ...form, stock: e.target.value })
                  }
                  className="border p-3 rounded-lg w-full"
                  required
                />
              </div>

              <input
                type="file"
                onChange={handleImageChange}
              />

              {preview && (
                <img
                  src={preview}
                  className="h-28 rounded-lg object-cover"
                />
              )}

              <button
                type="submit"
                className="bg-black text-white px-6 py-3 rounded-lg"
              >
                Guardar producto
              </button>
            </form>
          </div>
        )}

        {/* ================= INVENTARIO ================= */}

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-semibold mb-6">
            Gestión de inventario
          </h2>

          {productos.length === 0 && (
            <p className="text-gray-500">No hay productos cargados.</p>
          )}

          <div className="space-y-6">
            {productos.map((p) => (
              <div
                key={p.id}
                className="border rounded-xl p-4 sm:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 sm:gap-6"
              >
                <div className="flex items-center gap-4">

                  {p.imagen && (
                    <div className="w-14 h-14 sm:w-20 sm:h-20 flex-shrink-0">
                      <img
                        src={p.imagen}
                        alt={p.nombre}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  )}


                  <div>
                    <h3 className="font-semibold text-lg">
                      {p.nombre}
                    </h3>

                    <p className="text-sm text-gray-500">
                      Categoría: {p.categoria}
                    </p>

                    <p className="text-sm">
                      Stock actual: <b>{p.stock}</b>
                    </p>

                    <p className="text-sm">
                      Precio actual: <b>${p.precio}</b>
                    </p>
                  </div>
                </div>

                {/* CONTROLES ADMIN */}
                {role !== "viewer" && (
                  <div className="flex flex-col gap-3 w-full lg:w-96">

                    {/* EDITAR PRECIO */}
                    <input
                      type="number"
                      defaultValue={p.precio}
                      onBlur={(e) =>
                        actualizarPrecio(
                          p,
                          Number(e.target.value)
                        )
                      }
                      className="border p-2 rounded-lg"
                    />

                    {/* MODIFICAR STOCK */}
                    <div className="flex flex-wrap gap-2">
                      <input
                        type="number"
                        placeholder="Cantidad"
                        id={`input-${p.id}`}
                        className="border p-2 rounded-lg w-full"
                      />

                      <button
                        onClick={() => {
                          const input = document.getElementById(
                            `input-${p.id}`
                          ) as HTMLInputElement;
                          const cantidad = Number(input.value);
                          if (!cantidad) return;
                          modificarStock(p, cantidad, "entrada");
                          input.value = "";
                        }}
                        className="bg-green-500 text-white px-3 rounded-lg"
                      >
                        +
                      </button>

                      <button
                        onClick={() => {
                          const input = document.getElementById(
                            `input-${p.id}`
                          ) as HTMLInputElement;
                          const cantidad = Number(input.value);
                          if (!cantidad) return;
                          modificarStock(p, cantidad, "salida");
                          input.value = "";
                        }}
                        className="bg-red-500 text-white px-3 rounded-lg"
                      >
                        -
                      </button>

                      {role === "superadmin" && (
                        <button
                          onClick={() => eliminarProducto(p.id)}
                          className="bg-black text-white px-3 py-2 rounded-lg text-sm"
                        >
                          Eliminar producto
                        </button>
                      )}

                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ================= HISTORIAL ================= */}

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-semibold mb-6">
            Historial de movimientos
          </h2>

          {movimientos.length === 0 && (
            <p className="text-gray-500">
              No hay movimientos registrados.
            </p>
          )}

          <div className="space-y-4">
            {movimientos.map((m, i) => (
              <div
                key={i}
                className="border rounded-lg p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">
                    {m.tipo === "entrada" ? "🟢 Entrada" : "🔴 Salida"} — {m.producto}
                  </p>
                  <p className="text-sm text-gray-500">
                    {m.usuario}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-semibold">
                    {m.cantidad} unidades
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        {role === "superadmin" && (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-semibold mb-6">
              Gestión de usuarios
            </h2>

            <div className="space-y-4">
              {usuarios.map((u) => (
                <div
                  key={u.id}
                  className="border rounded-lg p-4 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">{u.email}</p>
                    <p className="text-sm text-gray-500">
                      Rol actual: {u.role}
                    </p>
                  </div>

                  <select
                    value={u.role}
                    onChange={(e) =>
                      updateRole(u.id, e.target.value as any)
                    }
                    className="border p-2 rounded-lg"
                  >
                    <option value="viewer">viewer</option>
                    <option value="admin">admin</option>
                    <option value="superadmin">superadmin</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>


  );
};

const Card = ({ title, value }: { title: string; value: any }) => (
  <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
    <p className="text-xs sm:text-sm text-gray-500">{title}</p>
    <h2 className="text-lg sm:text-2xl font-semibold mt-2 break-words">
      {value}
    </h2>
  </div>
);


export default Admin;