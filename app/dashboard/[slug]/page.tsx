"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Scan = {
  id: string;
  source: string | null;
  created_at: string;
};

type Business = {
  id: string;
  nome: string;
  categoria: string | null;
  google_review_url: string | null;
};

type Period = 7 | 30 | 90;

type ChartItem = {
  date: Date;
  label: string;
  fullLabel: string;
  value: number;
};

export default function DashboardPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [business, setBusiness] = useState<Business | null>(null);
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>(7);

  useEffect(() => {
    async function loadDashboard() {
      if (!slug) return;

      setLoading(true);

      const { data: businessData, error: businessError } =
        await supabase
          .from("locali")
          .select("id, nome, categoria, google_review_url")
          .eq("slug", slug)
          .single();

      if (businessError || !businessData) {
        console.error("Errore caricamento locale:", businessError);
        setLoading(false);
        return;
      }

      setBusiness(businessData);

      const { data: scanData, error: scanError } = await supabase
        .from("scansioni")
        .select("id, source, created_at")
        .eq("locale_id", businessData.id)
        .order("created_at", { ascending: false });

      if (scanError) {
        console.error("Errore caricamento scansioni:", scanError);
      }

      setScans(scanData ?? []);
      setLoading(false);
    }

    loadDashboard();
  }, [slug]);

  /*
   * ============================================================
   * STATISTICHE GENERALI
   * ============================================================
   */

  const totalScans = scans.length;

  const nfcScans = scans.filter(
    (scan) => scan.source === "nfc"
  ).length;

  const qrScans = scans.filter(
    (scan) => scan.source === "qr"
  ).length;

  const unknownScans = scans.filter(
    (scan) => scan.source !== "nfc" && scan.source !== "qr"
  ).length;

  const nfcPercentage =
    totalScans > 0
      ? Math.round((nfcScans / totalScans) * 100)
      : 0;

  const qrPercentage =
    totalScans > 0
      ? Math.round((qrScans / totalScans) * 100)
      : 0;

  /*
   * ============================================================
   * DATA INIZIO PERIODO
   * ============================================================
   */

  const periodStart = useMemo(() => {
    const date = new Date();

    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (period - 1));

    return date;
  }, [period]);

  /*
   * ============================================================
   * SCANSIONI DEL PERIODO
   * ============================================================
   */

  const periodScans = useMemo(() => {
    return scans.filter((scan) => {
      const scanDate = new Date(scan.created_at);
      return scanDate >= periodStart;
    });
  }, [scans, periodStart]);

  const periodNfcScans = periodScans.filter(
    (scan) => scan.source === "nfc"
  ).length;

  const periodQrScans = periodScans.filter(
    (scan) => scan.source === "qr"
  ).length;

  /*
   * ============================================================
   * GRAFICO
   *
   * 7 giorni  -> un punto per ogni giorno
   * 30 giorni -> un punto per ogni giorno, ma poche etichette
   * 90 giorni -> un punto per ogni giorno, ma etichette mensili
   *
   * I dati restano giornalieri in tutti e tre i casi.
   * Cambia solamente la quantità di testo mostrata sull'asse.
   * ============================================================
   */

  const chartData = useMemo<ChartItem[]>(() => {
    const result: ChartItem[] = [];

    for (let i = 0; i < period; i++) {
      const date = new Date(periodStart);

      date.setDate(periodStart.getDate() + i);

      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);

      const value = scans.filter((scan) => {
        const scanDate = new Date(scan.created_at);

        return scanDate >= date && scanDate < nextDate;
      }).length;

      const dayLabel = date.toLocaleDateString("it-IT", {
        day: "2-digit",
        month: "short",
      });

      const fullLabel = date.toLocaleDateString("it-IT", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

      result.push({
        date,
        label: dayLabel,
        fullLabel,
        value,
      });
    }

    return result;
  }, [period, periodStart, scans]);

  /*
   * ============================================================
   * ETICHETTE ASSE X
   *
   * Non nascondiamo i dati:
   * nascondiamo solamente alcune etichette per evitare
   * che si sovrappongano.
   * ============================================================
   */

  const visibleChartLabels = useMemo(() => {
    return chartData.map((item, index) => {
      /*
       * 7 GIORNI
       * Mostriamo tutti i giorni.
       */
      if (period === 7) {
        return true;
      }

      /*
       * 30 GIORNI
       * Mostriamo circa 6 etichette.
       */
      if (period === 30) {
        return index % 5 === 0 || index === chartData.length - 1;
      }

      /*
       * 90 GIORNI
       * Mostriamo solo quando cambia il mese.
       *
       * In questo modo l'asse diventa:
       * LUG
       * AGO
       * SET
       *
       * senza 90 date una sopra l'altra.
       */
      if (period === 90) {
        const previous = chartData[index - 1];

        if (!previous) {
          return true;
        }

        return (
          item.date.getMonth() !== previous.date.getMonth()
        );
      }

      return false;
    });
  }, [chartData, period]);

  /*
   * ============================================================
   * TESTO ETICHETTE GRAFICO
   * ============================================================
   */

  function getChartLabel(
    item: ChartItem,
    index: number
  ) {
    if (period === 7) {
      return item.date.toLocaleDateString("it-IT", {
        day: "2-digit",
        month: "short",
      });
    }

    if (period === 30) {
      return item.date.toLocaleDateString("it-IT", {
        day: "2-digit",
        month: "short",
      });
    }

    /*
     * 90 giorni:
     * mostriamo il nome del mese.
     */
    if (period === 90) {
      return item.date.toLocaleDateString("it-IT", {
        month: "short",
      });
    }

    return item.label;
  }

  /*
   * ============================================================
   * MASSIMO GRAFICO
   * ============================================================
   */

  const chartMax = Math.max(
    ...chartData.map((item) => item.value),
    5
  );

  /*
   * ============================================================
   * LABEL PERIODO
   * ============================================================
   */

  const periodLabel =
    period === 7
      ? "Negli ultimi 7 giorni"
      : period === 30
      ? "Negli ultimi 30 giorni"
      : "Negli ultimi 90 giorni";

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f7ff]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-200 border-t-fuchsia-500" />

          <p className="text-sm font-medium text-slate-500">
            Caricamento dashboard...
          </p>
        </div>
      </main>
    );
  }

  /*
   * ============================================================
   * LOCALE NON TROVATO
   * ============================================================
   */

  if (!business) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f7ff]">
        <div className="rounded-3xl bg-white p-10 text-center shadow-xl">
          <h1 className="text-2xl font-bold text-slate-900">
            Locale non trovato
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Controlla il link della dashboard.
          </p>
        </div>
      </main>
    );
  }

  /*
   * ============================================================
   * DASHBOARD
   * ============================================================
   */

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f8f7ff] text-[#17163a]">

      {/* ======================================================
          BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-fuchsia-300/30 blur-[120px]" />

        <div className="absolute right-[-180px] top-[120px] h-[500px] w-[500px] rounded-full bg-orange-300/25 blur-[130px]" />

        <div className="absolute bottom-[-200px] left-[35%] h-[500px] w-[500px] rounded-full bg-purple-300/25 blur-[140px]" />
      </div>

      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[230px] border-r border-white/70 bg-white/75 px-5 py-7 backdrop-blur-2xl lg:block">

        <Link
          href={`/dashboard/${slug}`}
          className="flex items-center gap-3 px-2"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500 via-purple-500 to-orange-400 text-white shadow-lg shadow-fuchsia-300/40">
            <span className="text-lg font-black">
              U
            </span>
          </div>

          <span className="text-xl font-black tracking-tight">
            UPOSTO
          </span>
        </Link>

        <nav className="mt-10 space-y-2">

          <SidebarItem
            icon="⌂"
            label="Dashboard"
            href={`/dashboard/${slug}`}
            active
          />

          <SidebarItem
            icon="☆"
            label="Recensioni"
            href={`/dashboard/${slug}/recensioni`}
          />

          <SidebarItem
            icon="▥"
            label="Statistiche"
            href={`/dashboard/${slug}/statistiche`}
          />

        </nav>

        {/* GUIDA */}

        <Link
          href={`/dashboard/${slug}/come-funziona`}
          className="absolute bottom-7 left-5 right-5 overflow-hidden rounded-3xl bg-gradient-to-br from-fuchsia-600 via-purple-600 to-orange-400 p-5 text-white shadow-xl shadow-purple-300/30 transition hover:-translate-y-1"
        >
          <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/20 blur-2xl" />

          <div className="relative">

            <div className="text-2xl">
              ⚡
            </div>

            <p className="mt-4 text-sm font-bold">
              Le tue targhette
              <br />
              stanno già lavorando.
            </p>

            <p className="mt-2 text-[11px] leading-5 text-white/75">
              Scopri come funziona UPOSTO.
            </p>

            <div className="mt-4 text-xs font-black">
              SCOPRI →
            </div>

          </div>
        </Link>

      </aside>

      {/* ======================================================
          MOBILE HEADER
      ====================================================== */}

      <div className="relative z-30 flex items-center justify-between border-b border-white/60 bg-white/75 px-5 py-4 backdrop-blur-xl lg:hidden">

        <Link
          href={`/dashboard/${slug}`}
          className="flex items-center gap-2"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-fuchsia-500 to-purple-600 text-white font-black">
            U
          </div>

          <span className="font-black">
            UPOSTO
          </span>
        </Link>

        <div className="text-sm font-semibold">
          {business.nome}
        </div>

      </div>

      {/* ======================================================
          MAIN
      ====================================================== */}

      <div className="relative min-h-screen lg:ml-[230px]">

        <div className="mx-auto max-w-[1250px] px-5 py-7 sm:px-8 lg:px-10">

          {/* ==================================================
              TOP BAR
          ================================================== */}

          <div className="flex items-center justify-end">

            <Link
              href={`/dashboard/${slug}/recensioni`}
              className="flex items-center gap-3"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white bg-white text-xs font-bold shadow-sm">
                IT
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white bg-white shadow-sm transition hover:scale-105">
                👤
              </div>
            </Link>

          </div>

          {/* ==================================================
              BUSINESS HEADER
          ================================================== */}

          <section className="relative mt-6 overflow-hidden rounded-[30px]">

            <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-100 via-white to-orange-100" />

            <div className="relative flex min-h-[145px] items-center justify-between overflow-hidden rounded-[30px] border border-white/80 px-7 py-8 shadow-[0_20px_60px_rgba(104,65,180,0.10)] sm:px-10">

              <div>

                <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
                  {business.nome}
                </h1>

                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-purple-100 bg-white/90 px-4 py-2 text-xs font-bold text-slate-700 shadow-sm">

                  <span className="text-purple-600">
                    ✦
                  </span>

                  {business.categoria || "Locale"}

                </div>

              </div>

              <div className="absolute right-[-20px] top-[-70px] hidden h-64 w-64 rounded-full bg-gradient-to-br from-fuchsia-300/40 to-orange-300/40 blur-3xl sm:block" />

            </div>

          </section>

          {/* ==================================================
              STATS
          ================================================== */}

          <section className="mt-6 grid gap-5 xl:grid-cols-[1fr_1fr_1fr_1.2fr]">

            <StatCard
              gradient="from-fuchsia-500 via-pink-500 to-orange-400"
              icon="⌁"
              title="Scansioni totali"
              value={totalScans}
              subtitle="Tutte le scansioni UPOSTO"
            />

            <StatCard
              gradient="from-blue-500 via-indigo-500 to-purple-600"
              icon="◉"
              title="NFC"
              value={nfcScans}
              subtitle={`${nfcPercentage}% del totale`}
            />

            <StatCard
              gradient="from-orange-400 via-pink-500 to-fuchsia-500"
              icon="▦"
              title="QR"
              value={qrScans}
              subtitle={`${qrPercentage}% del totale`}
            />

            {/* GOOGLE */}

            <div className="group relative overflow-hidden rounded-[28px] border border-white/80 bg-white/90 p-6 shadow-[0_15px_50px_rgba(60,40,100,0.10)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-[0_25px_70px_rgba(80,40,160,0.16)]">

              <div className="flex items-start justify-between">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-2xl font-black shadow-md">
                    <span className="bg-gradient-to-r from-blue-500 via-red-500 to-yellow-500 bg-clip-text text-transparent">
                      G
                    </span>
                  </div>

                  <div>

                    <h2 className="font-bold">
                      Google Business
                    </h2>

                    <div
                      className={`mt-1 flex items-center gap-1.5 text-xs font-semibold ${
                        business.google_review_url
                          ? "text-emerald-500"
                          : "text-red-500"
                      }`}
                    >

                      <span
                        className={`h-2 w-2 rounded-full ${
                          business.google_review_url
                            ? "bg-emerald-500"
                            : "bg-red-500"
                        }`}
                      />

                      {business.google_review_url
                        ? "Collegato"
                        : "Non collegato"}

                    </div>

                  </div>

                </div>

              </div>

              <p className="mt-5 text-xs leading-5 text-slate-500">

                {business.google_review_url
                  ? "Il tuo link Google è configurato e le scansioni possono portare direttamente alle recensioni."
                  : "Il link Google non è ancora configurato. Vai nella sezione recensioni per gestirlo."}

              </p>

              <Link
                href={`/dashboard/${slug}/recensioni`}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-fuchsia-500 via-pink-500 to-purple-600 py-3 text-sm font-bold text-white shadow-lg shadow-fuchsia-300/30 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl"
              >

                <span className="text-base font-black">
                  G
                </span>

                Gestisci Google

                <span>
                  →
                </span>

              </Link>

            </div>

          </section>

          {/* ==================================================
              CHART + DONUT
          ================================================== */}

          <section className="mt-5 grid gap-5 xl:grid-cols-[1.7fr_1fr]">

            {/* ==================================================
                CHART
            ================================================== */}

            <div className="rounded-[28px] border border-white/80 bg-white/90 p-6 shadow-[0_15px_50px_rgba(60,40,100,0.08)] backdrop-blur-xl sm:p-7">

              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">

                <div>

                  <h2 className="text-lg font-black">
                    Andamento delle scansioni
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    {periodLabel}
                  </p>

                </div>

                {/* PERIOD SELECTOR */}

                <div className="flex rounded-full bg-slate-100 p-1 text-[11px] font-bold">

                  {[7, 30, 90].map((value) => (

                    <button
                      key={value}
                      type="button"
                      onClick={() => setPeriod(value as Period)}
                      className={`rounded-full px-4 py-2 transition ${
                        period === value
                          ? "bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white shadow-sm"
                          : "text-slate-400 hover:text-purple-600"
                      }`}
                    >
                      {value} giorni
                    </button>

                  ))}

                </div>

              </div>

              {/* CHART */}

              <div className="mt-8 h-[280px] w-full">

                <svg
                  viewBox="0 0 760 280"
                  className="h-full w-full overflow-visible"
                  preserveAspectRatio="none"
                >

                  {/* GRID */}

                  {[0, 1, 2, 3, 4].map((line) => (

                    <line
                      key={line}
                      x1="50"
                      x2="740"
                      y1={25 + line * 48}
                      y2={25 + line * 48}
                      stroke="#e9e7f2"
                      strokeWidth="1"
                      strokeDasharray="4 5"
                    />

                  ))}

                  {/* GRADIENT */}

                  <defs>

                    <linearGradient
                      id="chartGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >

                      <stop
                        offset="0%"
                        stopColor="#ec4899"
                        stopOpacity="0.30"
                      />

                      <stop
                        offset="100%"
                        stopColor="#f97316"
                        stopOpacity="0.02"
                      />

                    </linearGradient>

                    <linearGradient
                      id="lineGradient"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="0"
                    >

                      <stop
                        offset="0%"
                        stopColor="#d946ef"
                      />

                      <stop
                        offset="50%"
                        stopColor="#ec4899"
                      />

                      <stop
                        offset="100%"
                        stopColor="#f97316"
                      />

                    </linearGradient>

                  </defs>

                  {/* AREA */}

                  <polyline
                    points={
                      chartData
                        .map((item, index) => {

                          const x =
                            50 +
                            index *
                              (690 /
                                Math.max(
                                  chartData.length - 1,
                                  1
                                ));

                          const y =
                            220 -
                            (item.value / chartMax) * 185;

                          return `${x},${y}`;

                        })
                        .join(" ") +
                      " 740,220 50,220"
                    }
                    fill="url(#chartGradient)"
                    stroke="none"
                  />

                  {/* LINE */}

                  <polyline
                    points={chartData
                      .map((item, index) => {

                        const x =
                          50 +
                          index *
                            (690 /
                              Math.max(
                                chartData.length - 1,
                                1
                              ));

                        const y =
                          220 -
                          (item.value / chartMax) * 185;

                        return `${x},${y}`;

                      })
                      .join(" ")}
                    fill="none"
                    stroke="url(#lineGradient)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* POINTS */}

                  {chartData.map((item, index) => {

                    const x =
                      50 +
                      index *
                        (690 /
                          Math.max(
                            chartData.length - 1,
                            1
                          ));

                    const y =
                      220 -
                      (item.value / chartMax) * 185;

                    return (
                      <g key={item.date.toISOString()}>

                        <circle
                          cx={x}
                          cy={y}
                          r="7"
                          fill="white"
                          stroke="#ec4899"
                          strokeWidth="3"
                        />

                        <circle
                          cx={x}
                          cy={y}
                          r="3"
                          fill="#ec4899"
                        />

                        <title>
                          {item.fullLabel}: {item.value} scansioni
                        </title>

                      </g>
                    );

                  })}

                  {/* X LABELS */}

                  {chartData.map((item, index) => {

                    if (!visibleChartLabels[index]) {
                      return null;
                    }

                    const x =
                      50 +
                      index *
                        (690 /
                          Math.max(
                            chartData.length - 1,
                            1
                          ));

                    return (
                      <text
                        key={`label-${item.date.toISOString()}`}
                        x={x}
                        y="252"
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight="600"
                        fill="#8b89a0"
                      >
                        {getChartLabel(item, index)}
                      </text>
                    );

                  })}

                </svg>

              </div>

              {/* LEGENDA GRAFICO */}

              <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-4">

                <p className="text-[11px] text-slate-400">
                  Ogni punto rappresenta le scansioni registrate quel giorno.
                </p>

                <p className="text-[11px] font-bold text-slate-500">
                  {periodScans.length} scansioni nel periodo
                </p>

              </div>

            </div>

            {/* ==================================================
                DONUT
            ================================================== */}

            <div className="rounded-[28px] border border-white/80 bg-white/90 p-6 shadow-[0_15px_50px_rgba(60,40,100,0.08)] backdrop-blur-xl">

              <h2 className="text-lg font-black">
                Come ti stanno trovando
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Distribuzione delle scansioni
              </p>

              <div className="mt-8 flex items-center justify-center gap-8">

                <div
                  className="relative h-44 w-44 shrink-0 rounded-full"
                  style={{
                    background:
                      totalScans === 0
                        ? "#e9e7f2"
                        : `conic-gradient(
                            #c026d3 0% ${nfcPercentage}%,
                            #fb7185 ${nfcPercentage}% ${
                              nfcPercentage + qrPercentage
                            }%,
                            #e9e7f2 ${
                              nfcPercentage + qrPercentage
                            }% 100%
                          )`,
                  }}
                >

                  <div className="absolute inset-[23px] flex flex-col items-center justify-center rounded-full bg-white shadow-inner">

                    <span className="text-3xl font-black">
                      {totalScans}
                    </span>

                    <span className="text-[11px] font-semibold text-slate-400">
                      scansioni
                    </span>

                  </div>

                </div>

                <div className="space-y-5">

                  <Legend
                    gradient="from-fuchsia-500 to-purple-500"
                    label="NFC"
                    percentage={nfcPercentage}
                    value={nfcScans}
                  />

                  <Legend
                    gradient="from-orange-400 to-pink-500"
                    label="QR"
                    percentage={qrPercentage}
                    value={qrScans}
                  />

                  {unknownScans > 0 && (
                    <Legend
                      gradient="from-slate-300 to-slate-400"
                      label="Altro"
                      percentage={
                        totalScans > 0
                          ? Math.round(
                              (unknownScans /
                                totalScans) *
                                100
                            )
                          : 0
                      }
                      value={unknownScans}
                    />
                  )}

                </div>

              </div>

              <div className="mt-8 rounded-2xl bg-gradient-to-r from-purple-50 to-fuchsia-50 p-4">

                <div className="flex gap-3">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-purple-600 shadow-sm">
                    ◉
                  </div>

                  <p className="text-xs leading-5 text-slate-500">

                    {nfcPercentage}% delle persone
                    <br />
                    sceglie la targhetta NFC.

                  </p>

                </div>

              </div>

            </div>

          </section>

          {/* ==================================================
              BOTTOM
          ================================================== */}

          <section className="mt-5 grid gap-5 xl:grid-cols-[1.45fr_1fr]">

            {/* ==================================================
                ACTIVITY
            ================================================== */}

            <div className="rounded-[28px] border border-white/80 bg-white/90 p-6 shadow-[0_15px_50px_rgba(60,40,100,0.08)] backdrop-blur-xl">

              <div className="flex items-center justify-between">

                <div>

                  <h2 className="text-lg font-black">
                    Attività recente
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Ultime scansioni registrate
                  </p>

                </div>

                <Link
                  href={`/dashboard/${slug}/statistiche`}
                  className="rounded-full bg-fuchsia-50 px-4 py-2 text-[11px] font-bold text-fuchsia-600 transition hover:bg-fuchsia-100"
                >
                  Vedi statistiche →
                </Link>

              </div>

              <div className="mt-6 divide-y divide-slate-100">

                {scans.slice(0, 7).map((scan) => {

                  const isNfc =
                    scan.source === "nfc";

                  return (
                    <div
                      key={scan.id}
                      className="flex items-center justify-between py-4"
                    >

                      <div className="flex items-center gap-3">

                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-black text-white shadow-md ${
                            isNfc
                              ? "bg-gradient-to-br from-fuchsia-500 to-purple-600"
                              : "bg-gradient-to-br from-orange-400 to-pink-500"
                          }`}
                        >
                          {isNfc ? "◉" : "▦"}
                        </div>

                        <div>

                          <p className="text-sm font-bold">

                            Scansione{" "}

                            {isNfc
                              ? "NFC"
                              : scan.source === "qr"
                              ? "QR"
                              : "diretta"}

                          </p>

                          <p className="mt-1 text-[11px] text-slate-400">

                            {new Date(
                              scan.created_at
                            ).toLocaleDateString(
                              "it-IT"
                            )}

                            {" · "}

                            {new Date(
                              scan.created_at
                            ).toLocaleTimeString(
                              "it-IT",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}

                          </p>

                        </div>

                      </div>

                      {business.google_review_url && (
                        <Link
                          href={
                            business.google_review_url
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="hidden items-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-[11px] font-bold text-slate-500 transition hover:bg-slate-100 sm:flex"
                        >

                          <span className="font-black text-blue-500">
                            G
                          </span>

                          Google

                          <span className="text-slate-300">
                            →
                          </span>

                        </Link>
                      )}

                    </div>
                  );

                })}

                {scans.length === 0 && (
                  <div className="py-12 text-center">

                    <div className="text-3xl">
                      ◉
                    </div>

                    <p className="mt-3 text-sm font-bold text-slate-500">
                      Nessuna scansione ancora.
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Quando qualcuno utilizzerà la tua
                      targhetta, la vedrai qui.
                    </p>

                  </div>
                )}

              </div>

            </div>

            {/* ==================================================
                RIGHT COLUMN
            ================================================== */}

            <div className="space-y-5">

              {/* PROMO */}

              <Link
                href={`/dashboard/${slug}/come-funziona`}
                className="relative block min-h-[235px] overflow-hidden rounded-[28px] bg-gradient-to-br from-fuchsia-600 via-pink-500 to-orange-400 p-7 text-white shadow-xl shadow-fuchsia-300/30 transition hover:-translate-y-1"
              >

                <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/20 blur-2xl" />

                <div className="absolute bottom-[-50px] right-[-30px] h-44 w-44 rounded-full border-[25px] border-white/10" />

                <div className="relative z-10 max-w-[65%]">

                  <h2 className="text-2xl font-black leading-tight">
                    Più recensioni,
                    <br />
                    più clienti.
                  </h2>

                  <p className="mt-4 text-xs leading-5 text-white/80">
                    Scopri come UPOSTO collega la tua
                    targhetta alle recensioni Google.
                  </p>

                  <div className="mt-6 inline-flex rounded-full bg-white px-5 py-3 text-xs font-black text-fuchsia-600 shadow-lg">
                    Scopri come funziona →
                  </div>

                </div>

                <div className="absolute bottom-7 right-7 rotate-[-8deg]">

                  <div className="relative h-24 w-28 rounded-3xl border-4 border-white/30 bg-white/20 shadow-2xl backdrop-blur-xl">

                    <div className="absolute -right-8 -top-8 flex h-20 w-20 items-center justify-center rounded-full bg-white text-3xl shadow-xl">

                      <span className="bg-gradient-to-r from-blue-500 via-red-500 to-yellow-500 bg-clip-text text-transparent">
                        G
                      </span>

                    </div>

                    <div className="mt-7 text-center text-yellow-300 text-sm tracking-widest">
                      ★★★★★
                    </div>

                  </div>

                </div>

              </Link>

              {/* GOOGLE REVIEWS */}

              <Link
                href={`/dashboard/${slug}/recensioni`}
                className="relative block overflow-hidden rounded-[28px] bg-[#11183d] p-7 text-white shadow-2xl transition hover:-translate-y-1"
              >

                <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-purple-600/30 blur-3xl" />

                <div className="relative">

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-3">

                      <div className="text-3xl font-black">

                        <span className="bg-gradient-to-r from-blue-400 via-red-400 to-yellow-400 bg-clip-text text-transparent">
                          G
                        </span>

                      </div>

                      <div>

                        <h2 className="font-bold">
                          Google Reviews
                        </h2>

                        <p className="mt-1 text-[11px] text-white/40">
                          La tua reputazione online
                        </p>

                      </div>

                    </div>

                    <div className="text-right">

                      <div className="text-2xl font-black">
                        →
                      </div>

                      <div className="text-[10px] text-white/40">
                        apri
                      </div>

                    </div>

                  </div>

                  <svg
                    viewBox="0 0 500 100"
                    className="mt-5 h-20 w-full"
                    preserveAspectRatio="none"
                  >

                    <defs>

                      <linearGradient
                        id="reviewLine"
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="0"
                      >

                        <stop
                          offset="0%"
                          stopColor="#8b5cf6"
                        />

                        <stop
                          offset="100%"
                          stopColor="#ec4899"
                        />

                      </linearGradient>

                    </defs>

                    <path
                      d="M0 75 C70 30, 110 80, 170 52 S270 65, 320 35 S410 70, 500 28"
                      fill="none"
                      stroke="url(#reviewLine)"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />

                  </svg>

                  <div className="mt-2 flex items-center gap-2 text-xs">

                    <span className="text-emerald-400">
                      ↑
                    </span>

                    <span className="text-white/50">
                      Apri la sezione recensioni per
                      gestire il collegamento Google.
                    </span>

                  </div>

                </div>

              </Link>

            </div>

          </section>

        </div>

      </div>

    </main>
  );
}

/*
 * =============================================================
 * SIDEBAR ITEM
 * =============================================================
 */

function SidebarItem({
  icon,
  label,
  href,
  active = false,
}: {
  icon: string;
  label: string;
  href: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${
        active
          ? "bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white shadow-lg shadow-fuchsia-200/50"
          : "text-slate-600 hover:bg-purple-50 hover:text-purple-600"
      }`}
    >
      <span className="w-5 text-center text-lg">
        {icon}
      </span>

      {label}
    </Link>
  );
}

/*
 * =============================================================
 * STAT CARD
 * =============================================================
 */

function StatCard({
  gradient,
  icon,
  title,
  value,
  subtitle,
}: {
  gradient: string;
  icon: string;
  title: string;
  value: number;
  subtitle: string;
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-[28px] bg-gradient-to-br ${gradient} p-6 text-white shadow-xl transition duration-300 hover:-translate-y-1 hover:shadow-2xl`}
    >

      <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-white/20 blur-2xl transition group-hover:scale-125" />

      <div className="absolute bottom-[-60px] right-[-30px] h-36 w-36 rounded-full border-[25px] border-white/10" />

      <div className="relative">

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-xl shadow-inner backdrop-blur-xl">
          {icon}
        </div>

        <p className="mt-7 text-sm font-bold text-white/90">
          {title}
        </p>

        <p className="mt-1 text-4xl font-black tracking-tight">
          {value}
        </p>

        <p className="mt-2 text-[11px] font-semibold text-white/65">
          {subtitle}
        </p>

      </div>

    </div>
  );
}

/*
 * =============================================================
 * LEGEND
 * =============================================================
 */

function Legend({
  gradient,
  label,
  percentage,
  value,
}: {
  gradient: string;
  label: string;
  percentage: number;
  value: number;
}) {
  return (
    <div className="flex items-center gap-3">

      <div
        className={`h-3 w-3 rounded-full bg-gradient-to-r ${gradient} shadow-sm`}
      />

      <div>

        <div className="flex items-center gap-2">

          <span className="text-sm font-black">
            {label}
          </span>

          <span className="text-xs text-slate-400">
            {percentage}%
          </span>

        </div>

        <p className="text-xs text-slate-400">
          {value}
        </p>

      </div>

    </div>
  );
}