"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plane } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Divider } from "@/components/ui/Divider";
import { GoogleButton } from "@/components/ui/GoogleButton";
import { createClient } from "@/lib/supabase/client";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Enter a valid email";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { name: name.trim() },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
      },
    });

    if (error) {
      setErrors({ email: error.message });
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  async function handleGoogleSignUp() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
      },
    });
  }

  if (success) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <Plane size={28} className="text-emerald-600 -rotate-45" />
          </div>
          <h2 className="text-2xl font-bold text-navy mb-2">Check your email</h2>
          <p className="text-text-muted">
            We sent a confirmation link to <strong>{email}</strong>.
            Click it to activate your account and get started.
          </p>
          <button
            onClick={() => router.push("/signin")}
            className="mt-6 text-coral font-semibold hover:underline cursor-pointer"
          >
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Left panel — branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-navy relative flex-col items-center justify-center px-12">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-8">
            <Plane size={36} className="text-white -rotate-45" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Your points, maximized
          </h2>
          <p className="text-white/70 text-lg leading-relaxed">
            Join thousands of travelers who save on flights by finding the
            best award redemptions across all their loyalty programs.
          </p>
        </div>
        <div className="absolute top-12 left-12 w-32 h-32 rounded-full bg-coral/10" />
        <div className="absolute bottom-16 right-16 w-48 h-48 rounded-full bg-sky-light/5" />
        <div className="absolute top-1/3 right-8 w-16 h-16 rounded-full bg-white/5" />
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="animate-fade-in-up mb-8" style={{ animationDelay: "0s" }}>
            <a href="/" className="text-2xl font-bold text-navy">
              Point<span className="text-coral">.ly</span>
            </a>
          </div>

          <div className="animate-fade-in-up mb-8" style={{ animationDelay: "0.05s" }}>
            <h1 className="text-2xl md:text-3xl font-bold text-navy">
              Create your account
            </h1>
            <p className="text-text-secondary mt-2">
              Start maximizing your travel points today
            </p>
          </div>

          <div className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <GoogleButton onClick={handleGoogleSignUp}>
              {loading ? "Connecting..." : "Sign up with Google"}
            </GoogleButton>
          </div>

          <div className="animate-fade-in-up my-6" style={{ animationDelay: "0.15s" }}>
            <Divider text="or sign up with email" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <Input
                label="Full Name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={errors.name}
              />
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: "0.25s" }}>
              <Input
                label="Email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
              />
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              <Input
                label="Password"
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
              />
            </div>
            <div className="animate-fade-in-up pt-2" style={{ animationDelay: "0.35s" }}>
              <Button type="submit" variant="secondary" size="lg" className="w-full" disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </div>
          </form>

          <p className="animate-fade-in-up text-xs text-text-muted text-center mt-4" style={{ animationDelay: "0.4s" }}>
            By signing up, you agree to our{" "}
            <a href="#" className="text-coral hover:underline">Terms of Service</a>{" "}
            and{" "}
            <a href="#" className="text-coral hover:underline">Privacy Policy</a>
          </p>

          <p className="animate-fade-in-up text-sm text-text-secondary text-center mt-6" style={{ animationDelay: "0.45s" }}>
            Already have an account?{" "}
            <a href="/signin" className="text-coral font-semibold hover:underline">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
}
