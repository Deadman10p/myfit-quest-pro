import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Dumbbell } from "lucide-react";

const SplashScreen: React.FC = () => {
  const navigate = useNavigate();
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(() => navigate("/login"), 500);
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <motion.div
      className="fixed inset-0 flex flex-col items-center justify-center bg-background z-50"
      initial={{ opacity: 1 }}
      animate={{ opacity: show ? 1 : 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
        className="mb-6"
      >
        <div className="w-24 h-24 rounded-2xl btn-primary-gradient flex items-center justify-center animate-pulse-glow">
          <Dumbbell className="w-12 h-12 text-primary-foreground" aria-hidden="true" />
        </div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="text-4xl font-extrabold tracking-tight text-foreground"
      >
        Fit<span className="text-primary">AI</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        className="text-muted-foreground mt-2 text-sm"
      >
        Your AI-Powered Fitness Coach
      </motion.p>

      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 1.3, duration: 1.2, ease: "easeInOut" }}
        className="mt-8 h-1 w-32 rounded-full bg-primary origin-left"
      />
    </motion.div>
  );
};

export default SplashScreen;
