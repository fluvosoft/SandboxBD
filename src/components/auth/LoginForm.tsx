"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Loader2 } from "lucide-react";

type LoginFormProps = {
  onSwitchToSignup: () => void;
  onClose?: () => void;
};

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToSignup, onClose }) => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Handle login logic here
      console.log("Login:", { email, password });
      if (onClose) {
        onClose();
      } else {
        // Redirect to home page after successful login
        router.push("/");
      }
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-[#37352f] mb-2">Welcome back</h2>
        <p className="text-sm text-[#787774]">Sign in to your account to continue</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] rounded-md text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Email Field */}
      <div>
        <label htmlFor="login-email" className="block text-sm font-medium text-[#37352f] mb-1.5">
          Email
        </label>
        <div className="relative">
          <Mail
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9b9a97]"
            aria-hidden="true"
          />
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[rgba(55,53,47,0.16)] rounded-md text-[#37352f] placeholder-[#9b9a97] focus:outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[rgba(249,115,22,0.15)] transition-all"
            placeholder="Enter your email"
          />
        </div>
      </div>

      {/* Password Field */}
      <div>
        <label htmlFor="login-password" className="block text-sm font-medium text-[#37352f] mb-1.5">
          Password
        </label>
        <div className="relative">
          <Lock
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9b9a97]"
            aria-hidden="true"
          />
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[rgba(55,53,47,0.16)] rounded-md text-[#37352f] placeholder-[#9b9a97] focus:outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[rgba(249,115,22,0.15)] transition-all"
            placeholder="Enter your password"
          />
        </div>
      </div>

      {/* Forgot Password */}
      <div className="flex items-center justify-end">
        <button
          type="button"
          className="text-sm text-[#f97316] hover:text-[#ea580c] transition-colors"
        >
          Forgot password?
        </button>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-[#37352f] text-white py-2.5 rounded-md text-sm font-medium hover:bg-[#2e2d29] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 size={18} className="animate-spin" aria-hidden="true" />
            Signing in...
          </>
        ) : (
          "Sign in"
        )}
      </button>

      {/* Switch to Signup */}
      <div className="pt-4 border-t border-[rgba(55,53,47,0.09)]">
        <p className="text-sm text-center text-[#787774]">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-[#f97316] hover:text-[#ea580c] font-medium transition-colors"
          >
            Sign up
          </Link>
        </p>
      </div>
    </form>
  );
};

export default LoginForm;
