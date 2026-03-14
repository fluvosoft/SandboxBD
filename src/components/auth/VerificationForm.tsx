"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

const VerificationForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  
  const [codes, setCodes] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newCodes = [...codes];
    newCodes[index] = value;
    setCodes(newCodes);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === "Backspace" && !codes[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    // Handle paste
    if (e.key === "v" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then((text) => {
        const digits = text.replace(/\D/g, "").slice(0, 6).split("");
        const newCodes = [...codes];
        digits.forEach((digit, i) => {
          if (i < 6) {
            newCodes[i] = digit;
          }
        });
        setCodes(newCodes);
        inputRefs.current[Math.min(digits.length - 1, 5)]?.focus();
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = codes.join("");
    
    if (code.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setError("");
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Handle verification logic here
      console.log("Verification code:", code);
      // Redirect to home page after successful verification
      router.push("/");
    }, 1000);
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    setIsLoading(true);
    // Simulate API call to resend code
    setTimeout(() => {
      setIsLoading(false);
      setResendCooldown(60); // 60 second cooldown
      
      // Countdown timer
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, 500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-[#37352f] mb-2">Verify your email</h2>
        <p className="text-sm text-[#787774]">
          We&apos;ve sent a 6-digit verification code to
        </p>
        <p className="text-sm font-medium text-[#37352f] mt-1">{email || "your email"}</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] rounded-md text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Code Input Fields */}
      <div className="flex justify-center gap-2 sm:gap-3">
        {codes.map((code, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={code}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-semibold bg-white border border-[rgba(55,53,47,0.16)] rounded-md text-[#37352f] focus:outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[rgba(249,115,22,0.15)] transition-all"
            aria-label={`Digit ${index + 1}`}
          />
        ))}
      </div>

      {/* Resend Code */}
      <div className="text-center">
        <p className="text-sm text-[#787774] mb-2">
          Didn&apos;t receive the code?{" "}
          {resendCooldown > 0 ? (
            <span className="text-[#9b9a97]">
              Resend in {resendCooldown}s
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={isLoading}
              className="text-[#f97316] hover:text-[#ea580c] font-medium transition-colors disabled:opacity-50"
            >
              Resend code
            </button>
          )}
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || codes.join("").length !== 6}
        className="w-full bg-[#37352f] text-white py-2.5 rounded-md text-sm font-medium hover:bg-[#2e2d29] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 size={18} className="animate-spin" aria-hidden="true" />
            Verifying...
          </>
        ) : (
          "Verify Email"
        )}
      </button>

      {/* Back to Signup */}
      <div className="pt-4 border-t border-[rgba(55,53,47,0.09)]">
        <Link
          href="/signup"
          className="flex items-center justify-center gap-2 text-sm text-[#787774] hover:text-[#37352f] transition-colors"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back to signup
        </Link>
      </div>
    </form>
  );
};

export default VerificationForm;
