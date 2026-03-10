import { motion } from "framer-motion";
import { FaBlog, FaEye, FaEyeSlash } from "react-icons/fa";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabaseClient";
import { useUi } from "../context/UiContext";

export function LoginPage() {
  const navigate = useNavigate();
  const { showSplash, hideSplash } = useUi();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }

    try {
      setSubmitting(true);
      showSplash("Signing into your blog...");

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // 400 normalmente é credencial inválida
        if (error.status === 400) {
          toast.error("Invalid email or password.");
          return;
        }
        throw error;
      }

      toast.success("Login successful.");
      navigate("/home");
    } catch (error) {
      toast.error(error.message || "Error signing in. Please check your data.");
    } finally {
      hideSplash();
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 px-4">
      <motion.div
        className="flex w-full max-w-md flex-col items-center gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.div
          className="flex flex-col items-center gap-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-slate-50 shadow-xl">
            <FaBlog size={26} />
          </div>
          <h1 className="text-xl font-semibold text-slate-50">
            Welcome back
          </h1>
          <p className="text-sm text-slate-400">
            Sign in to your account and keep creating.
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          className="w-full rounded-2xl bg-slate-900/80 p-6 shadow-xl border border-slate-800 backdrop-blur-md"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          <div className="mb-4">
            <label className="mb-1 block text-xs font-medium text-slate-300">
              Email
            </label>
            <input
              type="email"
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none ring-0 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-6">
            <label className="mb-1 block text-xs font-medium text-slate-300">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 pr-9 text-sm text-slate-50 outline-none ring-0 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 py-2.5 text-sm font-semibold text-slate-50 shadow-lg transition hover:from-blue-400 hover:to-blue-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-4 w-full text-center text-xs text-slate-400 hover:text-slate-200 transition"
          >
            Don't have an account? Sign up
          </button>
        </motion.form>
      </motion.div>
    </div>
  );
}

