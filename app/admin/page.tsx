"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Geist } from "next/font/google";
import { supabase } from "@/lib/supabase";

const geist = Geist({
  subsets: ["latin"],
});

type Scan = {
  id: string;
  source: string | null;
  created_at: string;
};

type Feedback = {
  id: string;
  rating: number;
  created_at: string;
};

export default function AdminPage() {
  const [scanData, setScanData] = useState<Scan[]>([]);
  const [feedbackData, setFeedbackData] = useState<Feedback[]>([]);
  const [localiCount, setLocaliCount] = useState(0);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      const [{ data: scans, error: scansError }, { data: feedback, error: feedbackError }, { data: locali, error: localiError }] =
        await Promise.all([
          supabase.from("scansioni").select("id, source, created_at").order("created_at", { ascending: false }),
          supabase.from("feedback").select("id, rating, created_at").order("created_at", { ascending: false }),
          supabase.from("locali").select("id"),
        ]);

      if (scansError) console.error("Errore caricamento scansioni:", scansError);
      if (feedbackError) console.error("Errore caricamento feedback:", feedbackError);
      if (localiError) console.error("Errore caricamento locali:", localiError);

      setScanData(scans ?? []);
      setFeedbackData(feedback ?? []);
      setLocaliCount(locali?.length ?? 0);
      setLoadingData(false);
    }

    loadDashboard();
  }, []);

  const totalScans = scanData.length;
  const totalFeedback = feedbackData.length;

  const last30Days = Array.from({ length: 30 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (29 - index));

    const count = scanData.filter((scan) => {
      const scanDate = new Date(scan.created_at);
      return (
        scanDate.getFullYear() === date.getFullYear() &&
        scanDate.getMonth() === date.getMonth() &&
        scanDate.getDate() === date.getDate()
      );
    }).length;

    return {
      label: date.toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit" }),
      count,
    };
  });

  const maxScans = Math.max(...last30Days.map((day) => day.count), 1);

  const recentEvents = [
    ...scanData.map((scan) => ({
      type:
        scan.source === "nfc"
          ? "Nuova scansione NFC"
          : scan.source === "qr"
            ? "Nuova scansione QR"
            : "Nuova scansione",
      created_at: scan.created_at,
      kind: "scan",
    })),
    ...feedbackData.map((item) => ({
      type: `Feedback ${item.rating} stelle`,
      created_at: item.created_at,
      kind: "feedback",
    })),
  ]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 4);

  function formatTime(dateString: string) {
    const date = new Date(dateString);
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);

    if (diff < 60) return "Adesso";
    if (diff < 3600) return `${Math.floor(diff / 60)} min fa`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} ore fa`;
    return date.toLocaleDateString("it-IT");
  }

  return (
    <main className={`${geist.className} min-h-screen overflow-hidden bg-[#050812] text-white`}>
      <div className="flex min-h-screen">

        {/* SIDEBAR */}
        <aside className="relative z-10 w-64 shrink-0 border-r border-white/10 bg-white/[0.025] px-6 py-8 shadow-[20px_0_80px_rgba(0,0,0,0.25)] backdrop-blur-2xl">

          {/* Logo glow */}
          <div className="pointer-events-none absolute left-1/2 top-16 h-24 w-44 -translate-x-1/2 rounded-full bg-violet-500/20 blur-[55px]" />

          <div className="relative">
            <div className="relative inline-block">

              <div className="pointer-events-none absolute inset-0 blur-[18px] opacity-70">
                <span
                  className="text-3xl font-black tracking-[-0.07em] text-violet-500"
                  style={{
                    fontFamily: "Airstrike, sans-serif",
                  }}
                >
                  UPosto
                </span>
              </div>

              <h1
                className="relative bg-gradient-to-r from-blue-300 via-violet-400 to-orange-300 bg-clip-text text-3xl font-black tracking-[-0.07em] text-transparent drop-shadow-[0_5px_18px_rgba(139,92,246,0.55)]"
                style={{
                  fontFamily: "Airstrike, sans-serif",
                }}
              >
                UPosto
              </h1>

            </div>

            <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/30 drop-shadow-[0_2px_8px_rgba(255,255,255,0.15)]">
              Command Center
            </p>
          </div>

          {/* NAV */}
          <nav className="relative mt-12 space-y-2">

            <div className="rounded-xl border border-white/10 bg-white/[0.09] px-4 py-3 text-sm font-semibold text-white shadow-[0_8px_30px_rgba(0,0,0,0.25)]">
              Overview
            </div>

            <Link
              href="/admin/locali"
              className="block rounded-xl px-4 py-3 text-sm font-medium text-white/50 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/[0.06] hover:text-white hover:shadow-[0_8px_25px_rgba(0,0,0,0.2)]"
            >
              Locali
            </Link>

            <Link
              href="/admin/analytics"
              className="block rounded-xl px-4 py-3 text-sm font-medium text-white/50 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/[0.06] hover:text-white hover:shadow-[0_8px_25px_rgba(0,0,0,0.2)]"
            >
              Analytics
            </Link>

            <Link
              href="/admin/pagamenti"
              className="block rounded-xl px-4 py-3 text-sm font-medium text-white/50 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/[0.06] hover:text-white hover:shadow-[0_8px_25px_rgba(0,0,0,0.2)]"
            >
              Pagamenti
            </Link>

            <Link
              href="/admin/mappa"
              className="block rounded-xl px-4 py-3 text-sm font-medium text-white/50 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/[0.06] hover:text-white hover:shadow-[0_8px_25px_rgba(0,0,0,0.2)]"
            >
              Mappa
            </Link>

          </nav>
        </aside>

        {/* MAIN */}
        <section className="relative flex-1 overflow-hidden px-12 py-10">

          {/* AMBIENT GLOWS */}
          <div className="pointer-events-none absolute -left-48 -top-48 h-[600px] w-[600px] rounded-full bg-blue-500/20 blur-[150px]" />

          <div className="pointer-events-none absolute left-[32%] top-[5%] h-[500px] w-[500px] rounded-full bg-violet-500/15 blur-[150px]" />

          <div className="pointer-events-none absolute right-[-150px] top-[30%] h-[600px] w-[600px] rounded-full bg-orange-500/15 blur-[160px]" />

          <div className="pointer-events-none absolute bottom-[-250px] left-[25%] h-[600px] w-[800px] rounded-full bg-blue-600/10 blur-[180px]" />

          <div className="relative z-10">

            {/* HEADER */}
            <p className="text-sm font-medium tracking-wide text-white/30 drop-shadow-[0_2px_8px_rgba(255,255,255,0.1)]">
              UPOSTO · ADMIN
            </p>

            <h2 className="mt-3 text-5xl font-semibold tracking-[-0.045em] drop-shadow-[0_5px_20px_rgba(255,255,255,0.12)]">
              Ciao Gabriel.
            </h2>

            <p className="mt-2 text-lg font-medium text-white/45 drop-shadow-[0_3px_12px_rgba(255,255,255,0.08)]">
              Ecco cosa sta succedendo in UPOSTO.
            </p>

            {/* KPI */}
            <div className="mt-12 grid grid-cols-4 gap-5">

              {/* LOCALI */}
              <div className="relative overflow-hidden rounded-3xl border border-blue-400/15 bg-white/[0.055] p-6 shadow-xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/30 hover:shadow-[0_20px_60px_rgba(59,130,246,0.15)]">

                <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-blue-500/15 blur-[45px]" />

                <p className="relative text-sm font-medium text-white/40 drop-shadow-[0_2px_8px_rgba(255,255,255,0.08)]">
                  Locali attivi
                </p>

                <p className="relative mt-3 text-4xl font-bold tracking-tight drop-shadow-[0_5px_16px_rgba(96,165,250,0.3)]">
                  {loadingData ? "—" : localiCount}
                </p>

              </div>

              {/* SCANSIONI */}
              <div className="relative overflow-hidden rounded-3xl border border-violet-400/15 bg-white/[0.055] p-6 shadow-xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-violet-400/30 hover:shadow-[0_20px_60px_rgba(139,92,246,0.18)]">

                <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-violet-500/20 blur-[45px]" />

                <p className="relative text-sm font-medium text-white/40 drop-shadow-[0_2px_8px_rgba(255,255,255,0.08)]">
                  Scansioni
                </p>

                <p className="relative mt-3 bg-gradient-to-r from-blue-300 via-violet-400 to-violet-300 bg-clip-text text-4xl font-bold tracking-tight text-transparent drop-shadow-[0_5px_20px_rgba(139,92,246,0.35)]">
                  {loadingData ? "—" : totalScans.toLocaleString("it-IT")}
                </p>

              </div>

              {/* FEEDBACK */}
              <div className="relative overflow-hidden rounded-3xl border border-orange-400/15 bg-white/[0.055] p-6 shadow-xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-orange-400/30 hover:shadow-[0_20px_60px_rgba(249,115,22,0.15)]">

                <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-orange-500/20 blur-[45px]" />

                <p className="relative text-sm font-medium text-white/40 drop-shadow-[0_2px_8px_rgba(255,255,255,0.08)]">
                  Feedback
                </p>

                <p className="relative mt-3 bg-gradient-to-r from-orange-300 via-amber-200 to-orange-400 bg-clip-text text-4xl font-bold tracking-tight text-transparent drop-shadow-[0_5px_20px_rgba(249,115,22,0.35)]">
                  {loadingData ? "—" : totalFeedback.toLocaleString("it-IT")}
                </p>

              </div>

              {/* ENTRATE */}
              <div className="relative overflow-hidden rounded-3xl border border-purple-400/15 bg-white/[0.055] p-6 shadow-xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-purple-400/30 hover:shadow-[0_20px_60px_rgba(168,85,247,0.18)]">

                <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-purple-500/20 blur-[45px]" />

                <p className="relative text-sm font-medium text-white/40 drop-shadow-[0_2px_8px_rgba(255,255,255,0.08)]">
                  Entrate mensili
                </p>

                <p className="relative mt-3 bg-gradient-to-r from-violet-300 via-purple-300 to-blue-300 bg-clip-text text-4xl font-bold tracking-tight text-transparent drop-shadow-[0_5px_20px_rgba(139,92,246,0.35)]">
                  €0
                </p>

              </div>

            </div>

            {/* LOWER GRID */}
            <div className="mt-6 grid grid-cols-3 gap-5">

              {/* GRAPH */}
              <div className="relative col-span-2 min-h-[360px] overflow-hidden rounded-3xl border border-white/10 bg-white/[0.045] p-7 shadow-[0_25px_80px_rgba(0,0,0,0.3)] backdrop-blur-xl">

                <div className="pointer-events-none absolute -left-20 top-20 h-56 w-56 rounded-full bg-violet-500/10 blur-[90px]" />

                <div className="relative flex items-center justify-between">

                  <div>
                    <p className="text-sm font-medium text-white/40">
                      Attività
                    </p>

                    <h3 className="mt-1 text-xl font-semibold tracking-tight drop-shadow-[0_3px_12px_rgba(255,255,255,0.1)]">
                      Scansioni
                    </h3>
                  </div>

                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-white/40 shadow-[0_4px_15px_rgba(0,0,0,0.2)]">
                    Ultimi 30 giorni
                  </span>

                </div>

                <div className="relative mt-8 h-64 overflow-hidden rounded-2xl border border-white/5 bg-black/10">

                  <div className="absolute inset-x-0 bottom-0 h-px bg-white/10" />

                  <div className="absolute inset-x-0 top-1/2 h-px bg-white/[0.035]" />

                  <div className="absolute inset-x-0 top-1/4 h-px bg-white/[0.025]" />

                  <div className="absolute inset-x-0 bottom-1/4 h-px bg-white/[0.025]" />

                  <div className="absolute inset-0 flex items-end gap-[2px] px-3 pb-3">

                    {last30Days.map((day, index) => {
                      const height = day.count > 0 ? Math.max((day.count / maxScans) * 100, 5) : 2;

                      return (
                        <div
                          key={index}
                          className="group relative flex h-full flex-1 items-end"
                        >
                          <div
                            className="w-full rounded-t-md bg-gradient-to-t from-blue-500/35 via-violet-400/65 to-orange-300/85 transition-all duration-500 group-hover:from-blue-400/55 group-hover:via-violet-300/80 group-hover:to-orange-200"
                            style={{ height: `${height}%` }}
                          />

                          <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-[#080d18]/95 px-2 py-1 text-[10px] text-white/70 shadow-xl group-hover:block">
                            {day.label} · {day.count} scansioni
                          </div>
                        </div>
                      );
                    })}

                  </div>

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-blue-500/[0.04] via-violet-500/[0.025] to-transparent" />

                </div>

              </div>

              {/* ATTIVITÀ */}
              <div className="relative min-h-[360px] overflow-hidden rounded-3xl border border-white/10 bg-white/[0.045] p-7 shadow-[0_25px_80px_rgba(0,0,0,0.3)] backdrop-blur-xl">

                <div className="pointer-events-none absolute -right-20 top-20 h-48 w-48 rounded-full bg-orange-500/10 blur-[80px]" />

                <div className="relative">

                  <p className="text-sm font-medium text-white/40">
                    Attività recenti
                  </p>

                  <h3 className="mt-1 text-xl font-semibold tracking-tight drop-shadow-[0_3px_12px_rgba(255,255,255,0.1)]">
                    Ultimi eventi
                  </h3>

                  <div className="mt-8 space-y-5 text-sm">

                    {recentEvents.length === 0 ? (
                      <div className="border-b border-white/5 pb-5">
                        <p className="font-medium text-white/70">
                          Nessuna attività
                        </p>
                        <p className="mt-1 text-xs text-white/25">
                          I dati appariranno qui
                        </p>
                      </div>
                    ) : (
                      recentEvents.map((event, index) => (
                        <div
                          key={`${event.created_at}-${index}`}
                          className="flex items-center justify-between border-b border-white/5 pb-4"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`h-2 w-2 rounded-full ${
                                event.kind === "feedback"
                                  ? "bg-orange-400 shadow-[0_0_12px_rgba(251,146,60,0.8)]"
                                  : "bg-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.8)]"
                              }`}
                            />
                            <span className="text-sm text-white/65">
                              {event.type}
                            </span>
                          </div>

                          <span className="text-xs text-white/25">
                            {formatTime(event.created_at)}
                          </span>
                        </div>
                      ))
                    )}

                  </div>

                </div>

              </div>

            </div>

            {/* LOCALI */}
            <div className="relative mt-6 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.045] p-7 shadow-[0_25px_80px_rgba(0,0,0,0.3)] backdrop-blur-xl">

              <div className="pointer-events-none absolute -left-20 bottom-[-100px] h-64 w-64 rounded-full bg-blue-500/10 blur-[90px]" />

              <div className="relative flex items-center justify-between">

                <div>
                  <p className="text-sm font-medium text-white/40">
                    Network
                  </p>

                  <h3 className="mt-1 text-xl font-semibold tracking-tight drop-shadow-[0_3px_12px_rgba(255,255,255,0.1)]">
                    Locali attivi
                  </h3>
                </div>

                <Link
                  href="/admin/locali"
                  className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/50 shadow-[0_5px_20px_rgba(0,0,0,0.2)] transition-all hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                >
                  Vedi tutti →
                </Link>

              </div>

              <div className="relative mt-8 flex min-h-24 items-center justify-center text-sm text-white/20">
                Nessun locale collegato
              </div>

            </div>

          </div>
        </section>
      </div>
    </main>
  );
}