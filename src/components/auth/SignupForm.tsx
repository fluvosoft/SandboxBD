"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Loader2 } from "lucide-react";

type SignupFormProps = {
  onSwitchToLogin: () => void;
  onClose?: () => void;
};

const SignupForm: React.FC<SignupFormProps> = ({ onSwitchToLogin, onClose }) => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Handle signup logic here
      console.log("Signup:", { name, email, password });
      if (onClose) {
        onClose();
      } else {
        // Redirect to verification page with email parameter
        router.push(`/verify?email=${encodeURIComponent(email)}`);
      }
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-[#37352f] mb-2">Create an account</h2>
        <p className="text-sm text-[#787774]">Join SANDBOX to get started</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] rounded-md text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Startup Name Field */}
      <div>
        <label htmlFor="signup-name" className="block text-sm font-medium text-[#37352f] mb-1.5">
          Startup Name
        </label>
        <div className="relative">
          <User
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9b9a97]"
            aria-hidden="true"
          />
          <input
            id="signup-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[rgba(55,53,47,0.16)] rounded-md text-[#37352f] placeholder-[#9b9a97] focus:outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[rgba(249,115,22,0.15)] transition-all"
            placeholder="Enter your startup name"
          />
        </div>
      </div>

      {/* Email Field */}
      <div>
        <label htmlFor="signup-email" className="block text-sm font-medium text-[#37352f] mb-1.5">
          Email
        </label>
        <div className="relative">
          <Mail
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9b9a97]"
            aria-hidden="true"
          />
          <input
            id="signup-email"
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
        <label htmlFor="signup-password" className="block text-sm font-medium text-[#37352f] mb-1.5">
          Password
        </label>
        <div className="relative">
          <Lock
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9b9a97]"
            aria-hidden="true"
          />
          <input
            id="signup-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[rgba(55,53,47,0.16)] rounded-md text-[#37352f] placeholder-[#9b9a97] focus:outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[rgba(249,115,22,0.15)] transition-all"
            placeholder="At least 8 characters"
          />
        </div>
      </div>

      {/* Confirm Password Field */}
      <div>
        <label
          htmlFor="signup-confirm-password"
          className="block text-sm font-medium text-[#37352f] mb-1.5"
        >
          Confirm Password
        </label>
        <div className="relative">
          <Lock
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9b9a97]"
            aria-hidden="true"
          />
          <input
            id="signup-confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[rgba(55,53,47,0.16)] rounded-md text-[#37352f] placeholder-[#9b9a97] focus:outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[rgba(249,115,22,0.15)] transition-all"
            placeholder="Confirm your password"
          />
        </div>
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
            Creating account...
          </>
        ) : (
          "Create account"
        )}
      </button>

      {/* Switch to Login */}
      <div className="pt-4 border-t border-[rgba(55,53,47,0.09)]">
        <p className="text-sm text-center text-[#787774]">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-[#f97316] hover:text-[#ea580c] font-medium transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </form>
  );
};

export default SignupForm;
