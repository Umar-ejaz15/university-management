"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }
      router.push("/login?registered=true");
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Create account</h2>
        {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
        <label className="block mb-2">
          <span className="text-sm">Full name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full" />
        </label>
        <label className="block mb-2">
          <span className="text-sm">Email</span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full" />
        </label>
        <label className="block mb-4">
          <span className="text-sm">Password</span>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required className="mt-1 block w-full" />
        </label>
        <label className="block mb-4">
          <span className="text-sm">Confirm password</span>
          <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" required className="mt-1 block w-full" />
        </label>
        <div className="flex items-center justify-between">
          <button type="submit" disabled={loading} className="px-4 py-2 bg-[#2d6a4f] text-white rounded">
            {loading ? "Creating..." : "Create account"}
          </button>
          <Link href="/login" className="text-sm text-[#2d6a4f]">Sign in</Link>
        </div>
      </form>
    </div>
  );
}
