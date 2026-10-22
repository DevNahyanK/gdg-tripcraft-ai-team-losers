"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Compass,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Loader2,
  KeyRound,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

function ResetPasswordForm() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});
  const [success, setSuccess] = useState(false);

  // Verify that an authenticated recovery session exists
  useEffect(() => {
    let mounted = true;
    async function checkAuth() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (mounted) {
          setHasSession(!!user);
          setCheckingSession(false);
        }
      } catch {
        if (mounted) {
          setHasSession(false);
          setCheckingSession(false);
        }
      }
    }
    checkAuth();
    return () => {
      mounted = false;
    };
  }, [supabase]);

  const validate = () => {
    const errs: { password?: string; confirmPassword?: string } = {};

    if (!password) {
      errs.password = "New password is required.";
    } else if (password.length < 8) {
      errs.password = "Must be at least 8 characters.";
    } else if (!/\d/.test(password)) {
      errs.password = "Must contain at least 1 number.";
    }

    if (!confirmPassword) {
      errs.confirmPassword = "Confirm password is required.";
    } else if (password !== confirmPassword) {
      errs.confirmPassword = "Passwords do not match.";
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validate()) return;

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError(updateError.message);
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 2000);
      }
    } catch {
      setError("Unable to update password. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 text-sm">
        <Loader2 size={24} className="animate-spin text-blue-400 mb-3" />
        <p>Verifying recovery link…</p>
      </div>
    );
  }

  if (!hasSession && !success) {
    return (
      <div className="glass-strong rounded-3xl p-8 sm:p-10 text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
          <AlertCircle size={28} />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
          Reset Link Expired or Invalid
        </h2>
        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          This password recovery link has already been used or has expired. Please request a new reset link.
        </p>
        <Link
          href="/auth?mode=forgot"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-bold shadow-lg shadow-blue-500/25 hover:from-blue-500 hover:to-violet-500 transition-all"
        >
          <span>Request New Reset Link</span>
          <ArrowRight size={15} />
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-strong rounded-3xl p-8 sm:p-10"
    >
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
          <KeyRound size={22} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">
          Set New Password
        </h1>
        <p className="text-sm text-slate-400">
          Enter and confirm your new secure password below.
        </p>
      </div>

      {success ? (
        <div className="text-center py-4">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
            <CheckCircle size={30} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            Password Updated!
          </h2>
          <p className="text-slate-400 text-sm mb-6">
            Your password has been changed successfully. Redirecting to your dashboard…
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-bold shadow-lg shadow-blue-500/25 hover:from-blue-500 hover:to-violet-500 transition-all"
          >
            <span>Go to Dashboard</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* New password input */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="new-password"
              className="text-xs font-semibold text-slate-400 uppercase tracking-wider"
            >
              New Password
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                <Lock size={15} />
              </div>
              <input
                id="new-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, password: undefined }));
                  setError(null);
                }}
                placeholder="Min. 8 chars + 1 number"
                autoComplete="new-password"
                className={`w-full pl-10 pr-10 py-3 rounded-xl bg-white/5 border text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 transition-all duration-200 ${
                  fieldErrors.password
                    ? "border-rose-500/60 focus:ring-rose-500/30 focus:border-rose-500"
                    : "border-white/10 focus:ring-blue-500/30 focus:border-blue-500/50 hover:border-white/20"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-xs text-rose-400 mt-1">{fieldErrors.password}</p>
            )}
          </div>

          {/* Confirm password input */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="confirm-new-password"
              className="text-xs font-semibold text-slate-400 uppercase tracking-wider"
            >
              Confirm New Password
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                <Lock size={15} />
              </div>
              <input
                id="confirm-new-password"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                  setError(null);
                }}
                placeholder="Repeat your new password"
                autoComplete="new-password"
                className={`w-full pl-10 pr-10 py-3 rounded-xl bg-white/5 border text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 transition-all duration-200 ${
                  fieldErrors.confirmPassword
                    ? "border-rose-500/60 focus:ring-rose-500/30 focus:border-rose-500"
                    : "border-white/10 focus:ring-blue-500/30 focus:border-blue-500/50 hover:border-white/20"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                aria-label={showConfirm ? "Hide" : "Show"}
              >
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <p className="text-xs text-rose-400 mt-1">{fieldErrors.confirmPassword}</p>
            )}
          </div>

          {/* Error Banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-sm"
              >
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="glow-btn w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-bold text-white text-sm mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Updating password…</span>
              </>
            ) : (
              <>
                <span>Update Password</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>
      )}
    </motion.div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#020510] flex items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-blue-700/8 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-violet-700/8 blur-[100px]" />
      </div>

      <div className="w-full max-w-md">
        {/* Brand Logo */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white font-extrabold text-xl tracking-tight hover:opacity-90 transition-opacity"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-violet-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Compass size={18} className="text-white" />
            </div>
            <span>
              Trip<span className="text-blue-400">Craft</span>
            </span>
          </Link>
        </div>

        <Suspense fallback={<div className="text-center text-slate-500 py-12">Loading…</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
