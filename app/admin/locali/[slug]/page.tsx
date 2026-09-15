"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Feedback = {
  id: string;
  rating: number;
  source: string | null;
  created_at: string;
};

type Scan = {
  id: string;
  source: string | null;
  created_at: string;
};

type Locale = {
  id: string;
  nome: string;
  categoria: string | null;
  citta: string | null;
};

export default function LocalPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [locale, setLocale] = useState<Locale | null>(null);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!slug) return;

      // LOCALE
      const { data: localeData, error: localeError } = await supabase
        .from("locali")
        .select("*")
        .eq("slug", slug)
        .single();

      if (localeError || !localeData) {
        console.error("Errore caricamento locale:", localeError);
        setLoading(false);
        return;
      }

      setLocale(localeData);

      // SCANSIONI
      const { data: scansData, error: scansError } = await supabase
        .from("scansioni")
        .select("id, source, created_at")
        .eq("locale_id", localeData.id)
        .order("created_at", { ascending: false });

      if (scansError) {
        console.error("Errore caricamento scansioni:", scansError);
      }

      // FEEDBACK
      const { data: feedbackData, error: feedbackError } = await supabase
        .from("feedback")
        .select("id, rating, source, created_at")
        .eq("locale_id", localeData.id)
        .order("created_at", { ascending: false });

      if (feedbackError) {
        console.error("Errore caricamento feedback:", feedbackError);
      }

      setScans(scansData ?? []);
      setFeedback(feedbackData ?? []);
      setLoading(false);
    }

    loadData();
  }, [slug]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050812] text-white">
        <div className="text-sm text-white/50">Caricamento UPOSTO...</div>
      </main>
    );
  }

  if (!locale) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050812] text-white">
        <div className="text-sm text-white/50">Locale non trovato.</div>
      </main>
    );
  }

  // =========================================================
  // KPI
  // =========================================================

  const totalScans = scans.length;

  const nfcScans = scans.filter(
    (scan) => scan.source === "nfc"
  ).length;

  const qrScans = scans.filter(
    (scan) => scan.source === "qr"
  ).length;

  const totalFeedback = feedback.length;

  const averageRating =
    totalFeedback > 0
      ? (
          feedback.reduce((sum, item) => sum + item.rating, 0) /
          totalFeedback
        ).toFixed(1)
      : "—";

  // =========================================================
  // DISTRIBUZIONE STELLE
  // =========================================================

  const starCounts = [5, 4, 3, 2, 1].map((star) => {
    const count = feedback.filter(
      (item) => item.rating === star
    ).length;

    const percentage =
      totalFeedback > 0
        ? Math.round((count / totalFeedback) * 100)
        : 0;

    return {
      star,
      count,
      percentage,
    };
  });

  // =========================================================
  // GRAFICO ULTIMI 7 GIORNI
  // =========================================================

  const today = new Date();

  const last7Days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);

    date.setDate(today.getDate() - (6 - index));

    const scansForDay = scans.filter((scan) => {
      const scanDate = new Date(scan.created_at);

      return (
        scanDate.getFullYear() === date.getFullYear() &&
        scanDate.getMonth() === date.getMonth() &&
        scanDate.getDate() === date.getDate()
      );
    }).length;

    const feedbackForDay = feedback.filter((item) => {
      const feedbackDate = new Date(item.created_at);

      return (
        feedbackDate.getFullYear() === date.getFullYear() &&
        feedbackDate.getMonth() === date.getMonth() &&
        feedbackDate.getDate() === date.getDate()
      );
    }).length;

    return {
      label: date.toLocaleDateString("it-IT", {
        weekday: "short",
      }),
      scans: scansForDay,
      feedback: feedbackForDay,
    };
  });

  const maxActivity = Math.max(
    ...last7Days.map((day) => day.scans),
    1
  );

  // =========================================================
  // ULTIMI EVENTI
  // =========================================================

  const recentEvents = [
    ...scans.map((scan) => ({
      type:
        scan.source === "nfc"
          ? "Nuova scansione NFC"
          : "Nuova scansione QR",
      created_at: scan.created_at,
      kind: "scan",
    })),
    ...feedback.map((item) => ({
      type: `Feedback ${item.rating} stelle`,
      created_at: item.created_at,
      kind: "feedback",
    })),
  ]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
    )
    .slice(0, 5);

  function formatTime(dateString: string) {
    const date = new Date(dateString);

    const diff =
      Math.floor(
        (Date.now() - date.getTime()) / 1000
      );

    if (diff < 60) return "Adesso";

    if (diff < 3600) {
      return `${Math.floor(diff / 60)} min fa`;
    }

    if (diff < 86400) {
      return `${Math.floor(diff / 3600)} ore fa`;
    }

    return date.toLocaleDateString("it-IT");
  }

  return (
    <main className="min-h-screen bg-[#050812] text-white">

      {/* GLOW AMBIENTE */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-500/15 blur-[120px]" />
        <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-violet-500/10 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-orange-500/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 py-8 sm:px-8">

        {/* HEADER */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-white/35">
              UPOSTO · LOCALE
            </p>

            <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
              {locale.nome}
            </h1>

            <div className="mt-3 flex items-center gap-3">

              <span className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Attivo
              </span>

              <span className="text-sm text-white/35">
                {locale.categoria ?? "Locale"}
                {locale.citta ? ` · ${locale.citta}` : ""}
              </span>

            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.045] px-5 py-3 backdrop-blur-xl">
            <p className="text-xs text-white/35">
              Ultima attività
            </p>

            <p className="mt-1 text-sm text-white/80">
              {recentEvents.length > 0
                ? formatTime(recentEvents[0].created_at)
                : "Nessuna attività"}
            </p>
          </div>

        </div>


        {/* KPI */}
        <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-5">

          {/* SCANSIONI */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.055] p-5 shadow-xl">

            <p className="text-sm text-white/40">
              Scansioni
            </p>

            <p className="mt-3 text-3xl font-semibold tracking-tight">
              {totalScans.toLocaleString("it-IT")}
            </p>

            <p className="mt-2 text-xs text-white/30">
              Totali
            </p>

          </div>


          {/* NFC */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.055] p-5 shadow-xl">

            <p className="text-sm text-white/40">
              Scansioni NFC
            </p>

            <p className="mt-3 text-3xl font-semibold tracking-tight">
              {nfcScans.toLocaleString("it-IT")}
            </p>

            <p className="mt-2 text-xs text-blue-300">
              NFC
            </p>

          </div>


          {/* QR */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.055] p-5 shadow-xl">

            <p className="text-sm text-white/40">
              Scansioni QR
            </p>

            <p className="mt-3 text-3xl font-semibold tracking-tight">
              {qrScans.toLocaleString("it-IT")}
            </p>

            <p className="mt-2 text-xs text-violet-300">
              QR Code
            </p>

          </div>


          {/* FEEDBACK */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.055] p-5 shadow-xl">

            <p className="text-sm text-white/40">
              Feedback
            </p>

            <p className="mt-3 text-3xl font-semibold tracking-tight">
              {totalFeedback.toLocaleString("it-IT")}
            </p>

            <p className="mt-2 text-xs text-emerald-300">
              Risposte ricevute
            </p>

          </div>


          {/* MEDIA */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.055] p-5 shadow-xl">

            <p className="text-sm text-white/40">
              Media stelle
            </p>

            <p className="mt-3 text-3xl font-semibold tracking-tight">
              {averageRating}
            </p>

            <p className="mt-2 text-xs text-orange-300">
              ★★★★★
            </p>

          </div>

        </div>


        {/* GRAFICO */}
        <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.045] p-6 shadow-xl backdrop-blur-xl">

          <div className="flex items-start justify-between">

            <div>
              <p className="text-sm text-white/40">
                Attività
              </p>

              <h2 className="mt-1 text-2xl font-semibold">
                Scansioni e feedback
              </h2>
            </div>

            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/40">
              Ultimi 7 giorni
            </span>

          </div>


          <div className="mt-8 flex h-56 items-end gap-3 sm:gap-5">

            {last7Days.map((day, index) => {

              const scanHeight =
                (day.scans / maxActivity) * 100;

              const feedbackHeight =
                day.scans > 0
                  ? (day.feedback / maxActivity) * 100
                  : 0;

              return (
                <div
                  key={index}
                  className="flex h-full flex-1 items-end gap-1"
                >

                  <div
                    className="w-full rounded-t-xl bg-gradient-to-t from-blue-500/30 via-violet-400/60 to-orange-300/80 transition-all duration-500"
                    style={{
                      height:
                        day.scans === 0
                          ? "2%"
                          : `${Math.max(scanHeight, 4)}%`,
                    }}
                  />

                  <div
                    className="w-full rounded-t-xl bg-orange-400/70 transition-all duration-500"
                    style={{
                      height:
                        day.feedback === 0
                          ? "2%"
                          : `${Math.max(feedbackHeight, 4)}%`,
                    }}
                  />

                </div>
              );
            })}

          </div>


          <div className="mt-4 flex justify-between text-xs text-white/25">

            {last7Days.map((day, index) => (
              <span key={index}>
                {day.label}
              </span>
            ))}

          </div>


          <div className="mt-5 flex gap-5 text-xs text-white/40">

            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-400" />
              Scansioni
            </div>

            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-orange-400" />
              Feedback
            </div>

          </div>

        </div>


        {/* BOTTOM */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">


          {/* DISTRIBUZIONE STELLE */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-6 shadow-xl backdrop-blur-xl">

            <p className="text-sm text-white/40">
              Feedback ricevuti
            </p>

            <h2 className="mt-1 text-2xl font-semibold">
              Distribuzione stelle
            </h2>

            <div className="mt-7 space-y-4">

              {starCounts.map((item) => (

                <div key={item.star}>

                  <div className="mb-2 flex justify-between text-sm">

                    <span className="text-white/60">
                      {item.star} stelle
                    </span>

                    <span className="text-white/35">
                      {item.count} · {item.percentage}%
                    </span>

                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-white/5">

                    <div
                      className="h-full rounded-full bg-gradient-to-r from-orange-400 to-yellow-200 transition-all duration-700"
                      style={{
                        width: `${item.percentage}%`,
                      }}
                    />

                  </div>

                </div>

              ))}

            </div>

          </div>


          {/* ATTIVITÀ RECENTE */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-6 shadow-xl backdrop-blur-xl">

            <p className="text-sm text-white/40">
              Attività recente
            </p>

            <h2 className="mt-1 text-2xl font-semibold">
              Ultimi eventi
            </h2>

            <div className="mt-6 space-y-5">

              {recentEvents.length === 0 ? (

                <p className="text-sm text-white/30">
                  Nessuna attività ancora.
                </p>

              ) : (

                recentEvents.map((event, index) => (

                  <div
                    key={index}
                    className="flex items-center justify-between border-b border-white/5 pb-4 last:border-0"
                  >

                    <div className="flex items-center gap-3">

                      <div
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

    </main>
  );
}