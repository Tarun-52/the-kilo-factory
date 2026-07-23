"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function KitchenLogin() {
  const [email, setEmail] = useState("kitchen@thekilofactory.com");
  const [password, setPassword] = useState("kitchen123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid Kitchen Credentials");
      setLoading(false);
    } else {
      window.location.href = "/kitchen";
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Kitchen Portal</h1>
          <p className="text-gray-500 mt-1">The Kilo Factory Staff Only</p>
        </div>
        
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          {error && <p className="bg-red-100 text-red-700 p-2 rounded text-sm text-center">{error}</p>}
          
          <input 
            type="email" 
            placeholder="Kitchen Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-3 rounded-lg focus:ring-2 focus:ring-maroon outline-none"
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-3 rounded-lg focus:ring-2 focus:ring-maroon outline-none"
            required 
          />
          <button 
            type="submit" 
            disabled={loading}
            className="bg-maroon text-white font-bold py-3 rounded-lg hover:bg-maroon-light transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Logging in..." : "Access Kitchen"}
          </button>
        </form>
      </div>
    </div>
  );
}