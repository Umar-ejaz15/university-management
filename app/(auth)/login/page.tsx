"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }
      if (data.user?.needsOnboarding) router.push("/onboarding/teacher");
      else router.push("/uni-dashboard");
    } catch (e) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Sign in</h2>
        {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
        <label className="block mb-2">
          <span className="text-sm">Email</span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full" />
        </label>
        <label className="block mb-4">
          <span className="text-sm">Password</span>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required className="mt-1 block w-full" />
        </label>
        <div className="flex items-center justify-between">
          <button type="submit" disabled={loading} className="px-4 py-2 bg-[#2d6a4f] text-white rounded">
            {loading ? "Loading..." : "Sign in"}
          </button>
          <Link href="/signup" className="text-sm text-[#2d6a4f]">Create account</Link>
        </div>
      </form>
    </div>
  );
}
