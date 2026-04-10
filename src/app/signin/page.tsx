"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plane } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Divider } from "@/components/ui/Divider";
import { GoogleButton } from "@/components/ui/GoogleButton";
import { saveUserAccount } from "@/lib/userProfile";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Enter a valid email";
    if (!password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const namePart = email.split("@")[0].replace(/[^a-zA-Z]/g, " ").trim();
    const displayName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    saveUserAccount({ name: displayName, email: email.trim(), signedIn: true });
    setTimeout(() => {
      router.push("/");
    }, 800);
  }

  function handleGoogleSignIn() {
    setLoading(true);
    saveUserAccount({ name: "Google User", email: "", signedIn: true });
    setTimeout(() => {
      router.push("/");
    }, 800);
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
            Welcome back
          </h2>
          <p className="text-white/70 text-lg leading-relaxed">
            Your loyalty programs are waiting. Sign in to find the best
            award flights and maximize your points.
          </p>
        </div>

        {/* Decorative circles */}
        <div className="absolute top-12 left-12 w-32 h-32 rounded-full bg-coral/10" />
        <div className="absolute bottom-16 right-16 w-48 h-48 rounded-full bg-sky-light/5" />
        <div className="absolute top-1/3 right-8 w-16 h-16 rounded-full bg-white/5" />
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="animate-fade-in-up mb-8" style={{ animationDelay: "0s" }}>
            <a href="/" className="text-2xl font-bold text-navy">
              Point<span className="text-coral">.ly</span>
            </a>
          </div>

          {/* Heading */}
          <div className="animate-fade-in-up mb-8" style={{ animationDelay: "0.05s" }}>
            <h1 className="text-2xl md:text-3xl font-bold text-navy">
              Sign in to Point.ly
            </h1>
            <p className="text-text-secondary mt-2">
              Pick up where you left off
            </p>
          </div>

          {/* Google Sign In */}
          <div className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <GoogleButton onClick={handleGoogleSignIn}>
              {loading ? "Connecting..." : "Continue with Google"}
            </GoogleButton>
          </div>

          <div className="animate-fade-in-up my-6" style={{ animationDelay: "0.15s" }}>
            <Divider text="or sign in with email" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <Input
                label="Email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
              />
            </div>

            <div className="animate-fade-in-up" style={{ animationDelay: "0.25s" }}>
              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
              />
            </div>

            {/* Forgot password */}
            <div className="animate-fade-in-up flex justify-end" style={{ animationDelay: "0.28s" }}>
              <a
                href="#"
                className="text-sm text-coral font-medium hover:underline"
              >
                Forgot password?
              </a>
            </div>

            <div className="animate-fade-in-up pt-2" style={{ animationDelay: "0.3s" }}>
              <Button
                type="submit"
                variant="secondary"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </div>
          </form>

          {/* Sign up link */}
          <p
            className="animate-fade-in-up text-sm text-text-secondary text-center mt-6"
            style={{ animationDelay: "0.35s" }}
          >
            Don&apos;t have an account?{" "}
            <a
              href="/signup"
              className="text-coral font-semibold hover:underline"
            >
              Create one
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
