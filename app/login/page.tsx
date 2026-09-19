"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    const { data, error: loginError } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

    if (loginError || !data.user) {
      setError("Email o password non corretti.");
      setLoading(false);
      return;
    }

    const userId = data.user.id;

    const { data: profile, error: profileError } = await supabase
      .from("profili")
      .select("must_change_password, locale_id")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      await supabase.auth.signOut();

      setError(
        "Non è stato possibile trovare il profilo associato a questo account."
      );

      setLoading(false);
      return;
    }

    if (profile.must_change_password) {
      router.push("/cambia-password");
      return;
    }

    const { data: locale, error: localeError } = await supabase
      .from("locali")
      .select("slug")
      .eq("id", profile.locale_id)
      .single();

    if (localeError || !locale) {
      await supabase.auth.signOut();

      setError(
        "Non è stato possibile trovare il locale associato a questo account."
      );

      setLoading(false);
      return;
    }

    router.push(`/dashboard-lite/${locale.slug}`);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-fuchsia-100 via-white to-orange-100 px-6 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center justify-center">
        <div className="w-full rounded-[32px] border border-white/70 bg-white/90 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-8 text-center">
            <div className="mb-3 text-4xl font-black tracking-tight text-fuchsia-600">
              UPOSTO
            </div>

            <h1 className="text-2xl font-bold text-gray-900">
              Accedi alla tua dashboard
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Inserisci le credenziali del tuo account UPOSTO.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition focus:border-fuchsia-400 focus:bg-white focus:ring-4 focus:ring-fuchsia-100"
                placeholder="nome@esempio.it"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition focus:border-fuchsia-400 focus:bg-white focus:ring-4 focus:ring-fuchsia-100"
                placeholder="Inserisci la password"
              />
            </div>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-fuchsia-600 to-purple-600 px-5 py-3.5 text-base font-bold text-white shadow-lg shadow-fuchsia-200 transition hover:scale-[1.01] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Accesso in corso..." : "Accedi"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}