import { Suspense } from "react";
import { Package } from "lucide-react";

import { LoginForm } from "@/components/features/auth/login-form";

export default function LoginPage() {
  return (
    <div className="relative min-h-dvh overflow-hidden">
      {/* Decorative chevron banner */}
      <div className="absolute inset-x-0 top-0 h-40">
        <div
          className="absolute inset-0 bg-brand-blue"
          style={{ clipPath: "polygon(0 0, 100% 0, 100% 55%, 50% 100%, 0 55%)" }}
        />
        <div
          className="absolute inset-0 bg-brand-red"
          style={{ clipPath: "polygon(0 35%, 50% 80%, 100% 35%, 100% 60%, 50% 100%, 0 60%)" }}
        />
      </div>

      {/* Login card */}
      <div className="relative z-10 flex min-h-dvh items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-card p-8 shadow-xl">
          <div className="mb-6 flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-md bg-brand-blue text-white">
              <Package className="size-5" />
            </span>
            <span className="text-xl font-bold tracking-tight text-brand-blue">
              Cargo<span className="text-brand-red">Land</span>
            </span>
          </div>

          <h1 className="text-3xl font-bold text-foreground">Welcome Back!</h1>
          <p className="mb-6 mt-1 text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <a href="#" className="font-semibold text-primary hover:underline">
              Sign up
            </a>
          </p>

          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
