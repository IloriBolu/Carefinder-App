import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error !== null) {
      alert(error.message);
      setLoading(false);
      return;
    }

    const user = data.user;

    if (user !== null) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: user.id,
        role: "user",
      });

      if (profileError !== null) {
        console.error("Profile creation error:", profileError.message);
      }
    }

    setLoading(false);
    alert("Account created successfully!");
    navigate("/login");
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Sign Up</h1>
      <form onSubmit={handleSignup} className="flex flex-col">
        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          required={true}
          className="border p-2 w-full mb-2 text-black"
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          required={true}
          className="border p-2 w-full mb-2 text-black"
        />
        <button
          type="submit"
          disabled={loading === true}
          className="bg-black text-white px-4 py-2 w-full transition disabled:opacity-50"
        >
          {loading === true ? "Creating..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
}