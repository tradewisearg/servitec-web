import { useState } from "react";

interface Props {
  onLogin: () => void;
}

const AdminLogin = ({ onLogin }: Props) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (password === "1234") { // CAMBIÁ ESTO POR TU CONTRASEÑA
      localStorage.setItem("admin-auth", "true");
      onLogin();
    } else {
      setError("Contraseña incorrecta");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-zinc-900">
      <div className="bg-white dark:bg-zinc-800 p-8 rounded-2xl shadow-xl w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Acceso Admin
        </h2>

        <input
          type="password"
          placeholder="Ingresar contraseña"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
          className="w-full border p-2 rounded mb-2"
        />

        {error && (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        )}

        <button
          onClick={handleLogin}
          className="w-full bg-primary text-white py-2 rounded-lg hover:scale-105 transition"
        >
          Ingresar
        </button>
      </div>
    </div>
  );
};

export default AdminLogin;
