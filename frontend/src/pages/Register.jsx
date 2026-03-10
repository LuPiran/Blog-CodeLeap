import { motion } from "framer-motion";
import { FaBlog, FaEye, FaEyeSlash } from "react-icons/fa";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabaseClient";
import { useUi } from "../context/UiContext";

function validatePassword(password) {
  const checks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const passed = Object.values(checks).filter(Boolean).length;
  const progress = (passed / 5) * 100;

  const missing = [];
  if (!checks.length) missing.push("at least 8 characters");
  if (!checks.upper) missing.push("1 uppercase letter");
  if (!checks.lower) missing.push("1 lowercase letter");
  if (!checks.number) missing.push("1 number");
  if (!checks.special) missing.push("1 special character");

  return { checks, progress, missing };
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { showSplash, hideSplash } = useUi();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { progress, missing } = validatePassword(password);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (missing.length > 0) {
      toast.error("Password does not meet all requirements.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setSubmitting(true);
      showSplash("Creating your account...");

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) {
        throw error;
      }

      toast.success("User created successfully.");
      navigate("/login");
    } catch (error) {
      toast.error(
        error.message || "Error creating user. Please try again later.",
      );
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
            Create your account
          </h1>
          <p className="text-sm text-slate-400">
            Share stories and ideas with the world.
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
              Name
            </label>
            <input
              type="text"
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none ring-0 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

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

          <div className="mb-4">
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
            <div className="mt-2 h-1.5 w-full rounded-full bg-slate-800">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-red-500 via-yellow-400 to-green-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              {missing.length === 0
                ? "Strong and valid password."
                : `Missing: ${missing.join(", ")}`}
            </p>
          </div>

          <div className="mb-6">
            <label className="mb-1 block text-xs font-medium text-slate-300">
              Confirm password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 pr-9 text-sm text-slate-50 outline-none ring-0 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
                onClick={() =>
                  setShowConfirmPassword((prev) => !prev)
                }
              >
                {showConfirmPassword ? (
                  <FaEyeSlash size={14} />
                ) : (
                  <FaEye size={14} />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 py-2.5 text-sm font-semibold text-slate-50 shadow-lg transition hover:from-blue-400 hover:to-blue-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? "Signing up..." : "Sign up"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="mt-4 w-full text-center text-xs text-slate-400 hover:text-slate-200 transition"
          >
            Already have an account? Sign in
          </button>
        </motion.form>
      </motion.div>
    </div>
  );
}

