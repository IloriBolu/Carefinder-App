import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    setLoading(false);

    if (error !== null) {
      alert(error.message);
      return;
    }

    navigate("/hospitals");
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">User Login</h1>

      <form onSubmit={handleLogin} className="flex flex-col">
        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          required={true}
          className="border p-2 w-full mb-2"
        />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          required={true}
          className="border p-2 w-full mb-2"
        />

        <button
          type="submit"
          disabled={loading === true}
          className="bg-black text-white px-4 py-2 w-full transition disabled:opacity-50"
        >
          {loading === true ? "Logging in…" : "Login"}
        </button>
      </form>
    </div>
  );
}