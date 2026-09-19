"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function CambiaPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleChangePassword(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (password.length < 8) {
      setError("La password deve contenere almeno 8 caratteri.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Le password non coincidono.");
      return;
    }

    setLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("Sessione non valida. Effettua nuovamente il login.");
      setLoading(false);
      return;
    }

    const { error: passwordError } = await supabase.auth.updateUser({
      password,
    });

    if (passwordError) {
  console.error("ERRORE CAMBIO PASSWORD:", passwordError);

  setError(
    `Errore: ${passwordError.message}`
  );

  setLoading(false);
  return;
}

    const { error: profileError } = await supabase
      .from("profili")
      .update({
        must_change_password: false,
      })
      .eq("id", user.id);

    if (profileError) {
      setError(
        "Password aggiornata, ma non è stato possibile completare la configurazione dell'account."
      );
      setLoading(false);
      return;
    }

    const { data: profile, error: getProfileError } = await supabase
      .from("profili")
      .select("locale_id")
      .eq("id", user.id)
      .single();

    if (getProfileError || !profile) {
      setError(
        "Password aggiornata, ma non è stato possibile trovare il locale associato."
      );
      setLoading(false);
      return;
    }

    const { data: locale, error: localeError } = await supabase
      .from("locali")
      .select("slug")
      .eq("id", profile.locale_id)
      .single();

    if (localeError || !locale) {
      setError(
        "Password aggiornata, ma non è stato possibile trovare il locale."
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
              Imposta la tua password
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Per sicurezza, scegli una password personale prima di
              accedere alla dashboard.
            </p>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-5">
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Nuova password
              </label>

              <input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition focus:border-fuchsia-400 focus:bg-white focus:ring-4 focus:ring-fuchsia-100"
                placeholder="Almeno 8 caratteri"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Conferma password
              </label>

              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                required
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition focus:border-fuchsia-400 focus:bg-white focus:ring-4 focus:ring-fuchsia-100"
                placeholder="Ripeti la password"
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
              {loading
                ? "Aggiornamento..."
                : "Imposta password"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}