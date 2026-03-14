"use client";

import React, { useState } from "react";
import Modal from "@/components/ui/Modal";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "signup";
};

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = "login",
}) => {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);

  const handleSwitchToSignup = () => {
    setMode("signup");
  };

  const handleSwitchToLogin = () => {
    setMode("login");
  };

  const handleClose = () => {
    setMode(initialMode); // Reset to initial mode when closing
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      {mode === "login" ? (
        <LoginForm onSwitchToSignup={handleSwitchToSignup} onClose={handleClose} />
      ) : (
        <SignupForm onSwitchToLogin={handleSwitchToLogin} onClose={handleClose} />
      )}
    </Modal>
  );
};

export default AuthModal;
