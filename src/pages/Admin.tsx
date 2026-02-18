
import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../lib/firebase";
import AdminLogin from "./AdminLogin";
import { CATEGORIA } from "../lib/categoria";

const Admin = () => {
  const [isAuth, setIsAuth] = useState(
    localStorage.getItem("admin-auth") === "true"
  );

  const categorias = [
    "Auriculares",
    "Mouse",
    "Teclado",
    "Kit",
    "Otros"
  ];



  const [productos, setProductos] = useState<any[]>([]);
  const [filtro, setFiltro] = useState("");
  const [form, setForm] = useState({
    nombre: "",
    categoria: "",
    precio: "",
    stock: "",
  });

  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  const fetchProductos = async () => {
    const data = await getDocs(collection(db, "stock"));
    setProductos(data.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    if (isAuth) fetchProductos();
  }, [isAuth]);

  const handleLogout = () => {
    localStorage.removeItem("admin-auth");
    setIsAuth(false);
  };

  const handleImageChange = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    setImagenFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!imagenFile) return;

    const imageRef = ref(
      storage,
      `productos/${Date.now()}-${imagenFile.name}`
    );
    await uploadBytes(imageRef, imagenFile);
    const imageUrl = await getDownloadURL(imageRef);

    await addDoc(collection(db, "stock"), {
      nombre: form.nombre,
      categoria: form.categoria,
      precio: Number(form.precio),
      stock: Number(form.stock),
      imagen: imageUrl,
    });

    setForm({ nombre: "", categoria: "", precio: "", stock: "" });
    setImagenFile(null);
    setPreview("");
    fetchProductos();
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "stock", id));
    fetchProductos();
  };

  const handleUpdate = async (id: string, campo: string, valor: any) => {
    await updateDoc(doc(db, "stock", id), {
      [campo]: Number(valor),
    });
    fetchProductos();
  };

  if (!isAuth) return <AdminLogin onLogin={() => setIsAuth(true)} />;

  <select
    value={filtro}
    onChange={(e) => setFiltro(e.target.value)}
    className="border p-2 rounded"
  >
    <option value="">Todas las categorías</option>

    {CATEGORIA.map((cat) => (
      <option key={cat} value={cat}>
        {cat}
      </option>
    ))}
  </select>


  const productosFiltrados = filtro
    ? productos.filter((p) => p.categoria === filtro)
    : productos;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-zinc-900 p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard Admin</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
        >
          Cerrar sesión
        </button>
      </div>

      {/* METRICA */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow">
          <p className="text-muted-foreground text-sm">
            Productos cargados
          </p>
          <h2 className="text-3xl font-bold mt-2">
            {productos.length}
          </h2>
        </div>
      </div>

      {/* FORMULARIO */}
      <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow mb-10">
        <h2 className="text-xl font-bold mb-4">Agregar producto</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <input
              placeholder="Nombre"
              value={form.nombre}
              onChange={(e) =>
                setForm({ ...form, nombre: e.target.value })
              }
              className="border p-2 rounded"
              required
            />


            <div className="space-y-2">
              <label className="text-sm font-medium">Categoría</label>
              <select
                value={form.categoria}
                onChange={(e) =>
                  setForm({ ...form, categoria: e.target.value })
                }
                required
                className="w-full rounded-lg border p-2 bg-white dark:bg-zinc-800"
              >
                <option value="">Seleccionar categoría</option>

                {CATEGORIA.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

            </div>

            <input
              type="number"
              placeholder="Precio"
              value={form.precio}
              onChange={(e) =>
                setForm({ ...form, precio: e.target.value })
              }
              className="border p-2 rounded"
              required
            />

            <input
              type="number"
              placeholder="Stock"
              value={form.stock}
              onChange={(e) =>
                setForm({ ...form, stock: e.target.value })
              }
              className="border p-2 rounded"
              required
            />
          </div>

          <input type="file" onChange={handleImageChange} />

          {preview && (
            <img
              src={preview}
              className="h-28 rounded-lg object-cover"
            />
          )}

          <button
            type="submit"
            className="bg-primary text-white px-6 py-2 rounded-lg hover:scale-105 transition"
          >
            Agregar producto
          </button>
        </form>
      </div>

      {/* FILTRO */}
      <div className="mb-6">
        <select
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Todas las categorías</option>

          {CATEGORIA.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

      </div>

      {/* PRODUCTOS */}
      <div className="grid md:grid-cols-3 gap-6">
        {productosFiltrados.map((p) => (
          <div
            key={p.id}
            className="bg-white dark:bg-zinc-800 rounded-2xl shadow p-4"
          >
            <img
              src={p.imagen}
              className="h-40 w-full object-cover rounded mb-4"
            />

            <h3 className="font-bold">{p.nombre}</h3>
            <p className="text-sm text-muted-foreground">
              {p.categoria}
            </p>

            <div className="mt-3 space-y-2">
              <input
                type="number"
                defaultValue={p.precio}
                onBlur={(e) =>
                  handleUpdate(p.id, "precio", e.target.value)
                }
                className="border p-1 rounded w-full"
              />

              <input
                type="number"
                defaultValue={p.stock}
                onBlur={(e) =>
                  handleUpdate(p.id, "stock", e.target.value)
                }
                className="border p-1 rounded w-full"
              />
            </div>

            <button
              onClick={() => handleDelete(p.id)}
              className="mt-4 bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 w-full"
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Admin;
