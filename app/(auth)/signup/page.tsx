"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  CheckCircle,
  FlaskConical,
  Users,
  BarChart3,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Calculate password strength
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { strength: "none", color: "gray", text: "" };

    let score = 0;
    if (pass.length >= 8) score++;
    if (pass.length >= 12) score++;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score++;
    if (/\d/.test(pass)) score++;
    if (/[^a-zA-Z0-9]/.test(pass)) score++;

    if (score <= 1) return { strength: "weak", color: "red", text: "Weak" };
    if (score <= 3) return { strength: "medium", color: "yellow", text: "Medium" };
    return { strength: "strong", color: "green", text: "Strong" };
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, confirmPassword }),
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
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-[52%] bg-linear-to-br from-[#1a3d2b] via-[#2d6a4f] to-[#1e4d38] relative overflow-hidden flex-col">
        {/* Decorative orbs */}
        <div className="-top-20 -left-20 absolute w-85 h-85 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="-bottom-15 -right-15 absolute w-105 h-105 bg-[#c9a961]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-white/3 rounded-full pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full px-14 py-14">
          {/* Top: Logo + Name */}
          <div className="flex flex-col items-start">
            <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-6 border border-white/20">
              <Image
                src="/logo.png"
                alt="MNSUAM Logo"
                width={56}
                height={56}
                className="object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
            <h1 className="text-2xl font-bold text-white leading-snug max-w-xs">
              Muhammad Nawaz Sharif University of Agriculture
            </h1>
            <p className="text-[#c9a961] font-semibold text-sm mt-1 tracking-wide uppercase">
              Multan, Pakistan
            </p>
          </div>

          {/* Middle: Feature bullets */}
          <div className="space-y-5">
            <p className="text-white/60 text-xs uppercase tracking-widest font-semibold mb-2">
              Why Join MNSUAM Portal
            </p>

            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                <FlaskConical className="w-5 h-5 text-[#c9a961]" />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">CLS Integration</p>
                <p className="text-white/60 text-xs mt-0.5">
                  Centralised laboratory &amp; course system
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-[#c9a961]" />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">Faculty Directory</p>
                <p className="text-white/60 text-xs mt-0.5">
                  Manage staff profiles &amp; departments
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                <BarChart3 className="w-5 h-5 text-[#c9a961]" />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">Academic Analytics</p>
                <p className="text-white/60 text-xs mt-0.5">
                  Research metrics &amp; publication tracking
                </p>
              </div>
            </div>
          </div>

          {/* Stats strip */}
          <div className="space-y-4">
            <div className="h-px bg-white/20" />
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-2xl font-bold text-white">500+</p>
                <p className="text-white/50 text-xs mt-0.5">Faculty Members</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">50+</p>
                <p className="text-white/50 text-xs mt-0.5">Departments</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">1000+</p>
                <p className="text-white/50 text-xs mt-0.5">Publications</p>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <div className="h-px flex-1 bg-white/20" />
              <span className="text-white/50 text-xs font-medium tracking-widest uppercase">
                Established 2012
              </span>
              <div className="h-px flex-1 bg-white/20" />
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-6 py-12">
        <div className="w-full max-w-105">
          {/* Mobile header */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-[#2d6a4f]/10 flex items-center justify-center mb-4">
              <Image
                src="/logo.png"
                alt="MNSUAM"
                width={40}
                height={40}
                className="object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
            <p className="text-sm font-semibold text-[#2d6a4f] uppercase tracking-widest">
              MNSUAM Portal
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="mb-7">
              <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
              <p className="text-gray-500 text-sm mt-1">Join MNSUAM portal</p>
            </div>

            {error && (
              <div className="mb-5 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-[#2d6a4f] focus:ring-4 focus:ring-[#2d6a4f]/10 outline-none transition-all text-gray-800 placeholder:text-gray-400 text-sm"
                    placeholder="Dr. John Smith"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-[#2d6a4f] focus:ring-4 focus:ring-[#2d6a4f]/10 outline-none transition-all text-gray-800 placeholder:text-gray-400 text-sm"
                    placeholder="your.email@mnsuam.edu.pk"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full pl-11 pr-11 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-[#2d6a4f] focus:ring-4 focus:ring-[#2d6a4f]/10 outline-none transition-all text-gray-800 placeholder:text-gray-400 text-sm"
                    placeholder="At least 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4.5 h-4.5" />
                    ) : (
                      <Eye className="w-4.5 h-4.5" />
                    )}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          passwordStrength.strength === "weak"
                            ? "w-1/3 bg-red-500"
                            : passwordStrength.strength === "medium"
                            ? "w-2/3 bg-amber-400"
                            : "w-full bg-emerald-500"
                        }`}
                      />
                    </div>
                    <span
                      className={`text-xs font-semibold w-12 text-right ${
                        passwordStrength.strength === "weak"
                          ? "text-red-600"
                          : passwordStrength.strength === "medium"
                          ? "text-amber-600"
                          : "text-emerald-600"
                      }`}
                    >
                      {passwordStrength.text}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <CheckCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full pl-11 pr-11 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-[#2d6a4f] focus:ring-4 focus:ring-[#2d6a4f]/10 outline-none transition-all text-gray-800 placeholder:text-gray-400 text-sm"
                    placeholder="Re-enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4.5 h-4.5" />
                    ) : (
                      <Eye className="w-4.5 h-4.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="bg-[#2d6a4f]/5 border border-[#2d6a4f]/15 rounded-xl p-3.5">
                <p className="text-xs font-semibold text-[#2d6a4f] mb-2">
                  Password Requirements
                </p>
                <ul className="space-y-1.5">
                  <li className="flex items-center gap-2">
                    <div
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${
                        password.length >= 6 ? "bg-emerald-500" : "bg-gray-300"
                      }`}
                    />
                    <span className="text-xs text-gray-600">
                      At least 6 characters long
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${
                        password === confirmPassword && password
                          ? "bg-emerald-500"
                          : "bg-gray-300"
                      }`}
                    />
                    <span className="text-xs text-gray-600">Passwords match</span>
                  </li>
                </ul>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#2d6a4f] hover:bg-[#235a40] text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm mt-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-500">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-[#2d6a4f] font-semibold hover:text-[#235a40] transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6 leading-relaxed">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
