import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const ForgotPasswordScreen: React.FC = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error("Please enter your email"); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 flex flex-col items-center justify-center px-6 py-12"
      >
        {sent ? (
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Check Your Email</h1>
            <p className="text-muted-foreground text-sm mb-6">We've sent a password reset link to <strong className="text-foreground">{email}</strong></p>
            <Link to="/login">
              <Button variant="outline" className="touch-target w-full">Back to Sign In</Button>
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-foreground mb-1">Forgot Password</h1>
            <p className="text-muted-foreground text-sm mb-8 text-center max-w-xs">Enter your email and we'll send you a reset link</p>
            <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fp-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                  <Input id="fp-email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} className="pl-10 touch-target bg-secondary border-border" aria-label="Email address" />
                </div>
              </div>
              <Button type="submit" className="w-full touch-target btn-primary-gradient text-primary-foreground font-semibold" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
            <Link to="/login" className="mt-6 text-sm text-muted-foreground flex items-center gap-1 hover:text-foreground">
              <ArrowLeft className="w-4 h-4" /> Back to Sign In
            </Link>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPasswordScreen;
