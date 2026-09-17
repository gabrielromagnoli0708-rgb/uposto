"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Business = {
  id: string;
  nome: string;
  categoria: string | null;
};

type Scan = {
  id: string;
  source: string | null;
  created_at: string;
};

export default function StatistichePage() {
  const params = useParams();
  const slug = params.slug as string;

  const [business, setBusiness] = useState<Business | null>(null);
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<7 | 30 | 90>(30);

  useEffect(() => {
    async function load() {
      if (!slug) return;

      const { data: businessData } = await supabase
        .from("locali")
        .select("id, nome, categoria")
        .eq("slug", slug)
        .single();

      if (!businessData) {
        setLoading(false);
        return;
      }

      setBusiness(businessData);

      const { data: scanData } = await supabase
        .from("scansioni")
        .select("id, source, created_at")
        .eq("locale_id", businessData.id)
        .order("created_at", { ascending: false });

      setScans(scanData ?? []);
      setLoading(false);
    }

    load();
  }, [slug]);

  const filteredScans = useMemo(() => {
    const since = new Date();

    since.setHours(0, 0, 0, 0);
    since.setDate(since.getDate() - period + 1);

    return scans.filter(
      (scan) => new Date(scan.created_at) >= since
    );
  }, [scans, period]);

  const nfc = filteredScans.filter(
    (scan) => scan.source === "nfc"
  ).length;

  const qr = filteredScans.filter(
    (scan) => scan.source === "qr"
  ).length;

  const average =
    period > 0
      ? (filteredScans.length / period).toFixed(1)
      : "0";

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f7ff]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-200 border-t-fuchsia-500" />
      </main>
    );
  }

  if (!business) {
    return <NotFound />;
  }

  return (
    <main className="min-h-screen bg-[#f8f7ff]">

      <aside className="fixed left-0 top-0 hidden h-screen w-[230px] border-r border-white bg-white/80 px-5 py-7 backdrop-blur-2xl lg:block">

        <Link
          href={`/dashboard/${slug}`}
          className="flex items-center gap-3 px-2"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500 via-purple-500 to-orange-400 text-white font-black">
            U
          </div>

          <span className="text-xl font-black">
            UPOSTO
          </span>
        </Link>

        <nav className="mt-10 space-y-2">

          <Nav label="Dashboard" icon="⌂" href={`/dashboard/${slug}`} />

          <Nav
            label="Recensioni"
            icon="☆"
            href={`/dashboard/${slug}/recensioni`}
          />

          <Nav
            label="Statistiche"
            icon="▥"
            href={`/dashboard/${slug}/statistiche`}
            active
          />
          
        </nav>

      </aside>

      <div className="lg:ml-[230px]">

        <div className="mx-auto max-w-[1100px] px-5 py-8 sm:px-8">

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

            <div>

              <h1 className="text-4xl font-black tracking-tight">
                Statistiche
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Analizza le scansioni generate dalle tue targhette.
              </p>

            </div>

            <div className="flex rounded-full bg-white p-1 shadow-sm">

              {[7, 30, 90].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setPeriod(value as 7 | 30 | 90)
                  }
                  className={`rounded-full px-5 py-2 text-xs font-bold ${
                    period === value
                      ? "bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white"
                      : "text-slate-400"
                  }`}
                >
                  {value} giorni
                </button>
              ))}

            </div>

          </div>

          <section className="mt-8 grid gap-5 md:grid-cols-3">

            <Metric
              title="Scansioni"
              value={filteredScans.length}
              icon="⌁"
              gradient="from-fuchsia-500 to-orange-400"
            />

            <Metric
              title="NFC"
              value={nfc}
              icon="◉"
              gradient="from-blue-500 to-purple-600"
            />

            <Metric
              title="QR"
              value={qr}
              icon="▦"
              gradient="from-orange-400 to-pink-500"
            />

          </section>

          <section className="mt-5 rounded-[28px] bg-white p-7 shadow-[0_15px_50px_rgba(60,40,100,0.08)]">

            <h2 className="text-xl font-black">
              Riepilogo
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-2">

              <Info
                label="Media scansioni giornaliere"
                value={average}
              />

              <Info
                label="Periodo analizzato"
                value={`${period} giorni`}
              />

              <Info
                label="Scansioni NFC"
                value={`${nfc}`}
              />

              <Info
                label="Scansioni QR"
                value={`${qr}`}
              />

            </div>

          </section>

          <section className="mt-5 rounded-[28px] bg-gradient-to-br from-fuchsia-600 via-purple-600 to-orange-400 p-8 text-white shadow-xl">

            <p className="text-xs font-black uppercase tracking-[0.2em] text-white/60">
              UPOSTO
            </p>

            <h2 className="mt-4 text-3xl font-black">
              I dati delle tue targhette,
              <br />
              tutti in un unico posto.
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-6 text-white/70">
              Ogni scansione viene registrata con la relativa
              sorgente, permettendoti di capire come i clienti
              interagiscono con UPOSTO.
            </p>

          </section>

        </div>

      </div>

    </main>
  );
}

function Nav({
  label,
  icon,
  href,
  active = false,
}: {
  label: string;
  icon: string;
  href: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold ${
        active
          ? "bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white"
          : "text-slate-600 hover:bg-purple-50 hover:text-purple-600"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}

function Metric({
  title,
  value,
  icon,
  gradient,
}: {
  title: string;
  value: number;
  icon: string;
  gradient: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[28px] bg-gradient-to-br ${gradient} p-7 text-white shadow-xl`}
    >
      <div className="text-2xl">
        {icon}
      </div>

      <p className="mt-7 text-sm font-bold text-white/70">
        {title}
      </p>

      <p className="mt-1 text-4xl font-black">
        {value}
      </p>
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-5">

      <p className="text-xs font-semibold text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-2xl font-black text-slate-800">
        {value}
      </p>

    </div>
  );
}

function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f7ff]">
      <div className="rounded-3xl bg-white p-10 shadow-xl">
        Locale non trovato
      </div>
    </main>
  );
}