import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Swords, Mail, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import bossImg from "@/assets/boss-procrastinator.png";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Procrastination Slayer" },
      {
        name: "description",
        content: "Create your hero or sign in to continue your quests, streaks and boss fights.",
      },
      { property: "og:title", content: "Sign in — Procrastination Slayer" },
      { property: "og:description", content: "Create your hero and start slaying procrastination." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup";

function AuthPage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) navigate({ to: "/dashboard", replace: true });
  }, [isAuthenticated, loading, navigate]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/dashboard", replace: true });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: displayName.trim() || undefined },
          },
        });
        if (error) throw error;
        if (data.session) navigate({ to: "/dashboard", replace: true });
        else setCheckEmail(true);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="realm-bg stars-bg flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl border border-border bg-card shadow-2xl md:grid-cols-2">
        <aside className="relative hidden flex-col justify-between bg-gradient-to-br from-accent/60 via-card to-card p-8 md:flex">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
            <Swords className="size-5 text-gold" /> Procrastination Slayer
          </Link>
          <img
            src={bossImg}
            alt="The Procrastinator boss"
            width={1024}
            height={1024}
            className="mx-auto w-64 animate-bob drop-shadow-[0_20px_40px_oklch(0.5_0.2_300/0.6)]"
          />
          <blockquote className="text-sm text-muted-foreground">
            <p className="italic">"You'll sign up tomorrow. You always do."</p>
            <footer className="mt-1 text-xs">— The Procrastinator, 500 HP</footer>
          </blockquote>
        </aside>

        <section className="p-8 md:p-10">
          {checkEmail ? (
            <div className="animate-pop-in text-center">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/15">
                <Mail className="size-8 text-primary" />
              </div>
              <h1 className="mt-5 text-2xl font-bold">Check your inbox</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                We sent a confirmation link to <span className="text-foreground">{email}</span>.
                Click it to awaken your hero, then come back and sign in.
              </p>
              <Button variant="outline" className="mt-6" onClick={() => { setCheckEmail(false); setMode("signin"); }}>
                Back to sign in
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-6 flex rounded-lg bg-muted p-1 text-sm font-medium">
                {(["signin", "signup"] as Mode[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    className={`flex-1 rounded-md px-3 py-2 transition-colors ${mode === m ? "bg-card text-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {m === "signin" ? "Sign in" : "Create hero"}
                  </button>
                ))}
              </div>
              <h1 className="text-2xl font-bold">
                {mode === "signin" ? "Welcome back, adventurer" : "Forge your hero"}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {mode === "signin"
                  ? "Your quests, streak and boss are waiting."
                  : "Start at level 1 with 50 gold and a very smug boss."}
              </p>

              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                {mode === "signup" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="displayName">Hero name</Label>
                    <Input
                      id="displayName"
                      placeholder="Sir Finishes-A-Lot"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      maxLength={32}
                    />
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@realm.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full font-semibold" size="lg" disabled={busy}>
                  {busy ? <LoaderCircle className="animate-spin" /> : <Swords />}
                  {mode === "signin" ? "Enter the realm" : "Create hero"}
                </Button>
              </form>
              <p className="mt-6 text-center text-xs text-muted-foreground">
                <Link to="/" className="hover:text-foreground">← Back to home</Link>
              </p>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
