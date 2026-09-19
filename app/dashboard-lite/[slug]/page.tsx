"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
};

type Period = 7 | 30 | 90;

export default function DashboardLitePage() {
  const params = useParams();
  const router = useRouter();

  const slug = params.slug as string;

  const [business, setBusiness] = useState<Business | null>(null);
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [period, setPeriod] = useState<Period>(7);

  useEffect(() => {
    async function loadDashboard() {
      if (!slug) return;

      setLoading(true);

      /*
       * ============================================================
       * 1. CONTROLLO SESSIONE
       * ============================================================
       */

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace("/login");
        return;
      }

      /*
       * ============================================================
       * 2. RECUPERO PROFILO DEL PROPRIETARIO
       * ============================================================
       */

      const { data: profile, error: profileError } = await supabase
        .from("profili")
        .select("locale_id, must_change_password")
        .eq("id", user.id)
        .single();

      if (profileError || !profile) {
        console.error(
          "Errore caricamento profilo:",
          profileError
        );

        await supabase.auth.signOut();
        router.replace("/login");
        return;
      }

      /*
       * ============================================================
       * 3. PRIMO ACCESSO → CAMBIO PASSWORD
       * ============================================================
       */

      if (profile.must_change_password) {
        router.replace("/cambia-password");
        return;
      }

      /*
       * ============================================================
       * 4. RECUPERO LOCALE ASSOCIATO AL PROFILO
       * ============================================================
       */

      const { data: businessData, error: businessError } =
        await supabase
          .from("locali")
          .select("id, nome, categoria")
          .eq("id", profile.locale_id)
          .eq("slug", slug)
          .single();

      if (businessError || !businessData) {
        console.error(
          "Errore caricamento locale:",
          businessError
        );

        setLoading(false);
        return;
      }

      setBusiness(businessData);

      /*
       * ============================================================
       * 5. RECUPERO SCANSIONI
       * ============================================================
       */

      const { data: scanData, error: scanError } = await supabase
        .from("scansioni")
        .select("id, source, created_at")
        .eq("locale_id", businessData.id)
        .order("created_at", { ascending: false });

      if (scanError) {
        console.error(
          "Errore caricamento scansioni:",
          scanError
        );
      }

      setScans(scanData ?? []);
      setLoading(false);
    }

    loadDashboard();
  }, [slug, router]);

  /*
   * ================================================================
   * LOGOUT
   * ================================================================
   */

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Errore logout:", error);
      setLoggingOut(false);
      return;
    }

    router.replace("/login");
  }

  /*
   * ================================================================
   * STATISTICHE BASE
   * ================================================================
   */

  const totalScans = scans.length;

  const nfcScans = scans.filter(
    (scan) => scan.source === "nfc"
  ).length;

  const qrScans = scans.filter(
    (scan) => scan.source === "qr"
  ).length;

  const otherScans = scans.filter(
    (scan) =>
      scan.source !== "nfc" &&
      scan.source !== "qr"
  ).length;

  const nfcPercentage =
    totalScans > 0
      ? Math.round((nfcScans / totalScans) * 100)
      : 0;

  const qrPercentage =
    totalScans > 0
      ? Math.round((qrScans / totalScans) * 100)
      : 0;

  const otherPercentage =
    totalScans > 0
      ? Math.round((otherScans / totalScans) * 100)
      : 0;

  /*
   * ================================================================
   * DATI GRAFICO
   * ================================================================
   */

  const chartData = useMemo(() => {
    const days = [];

    for (let i = period - 1; i >= 0; i--) {
      const date = new Date();

      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - i);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const count = scans.filter((scan) => {
        const scanDate = new Date(scan.created_at);

        return (
          scanDate >= date &&
          scanDate < nextDate
        );
      }).length;

      let label = "";

      if (period === 7) {
        label = date.toLocaleDateString("it-IT", {
          weekday: "short",
        });
      }

      if (period === 30) {
        const shouldShow =
          i === period - 1 ||
          i === 24 ||
          i === 18 ||
          i === 12 ||
          i === 6 ||
          i === 0;

        label = shouldShow
          ? date.toLocaleDateString("it-IT", {
              day: "2-digit",
              month: "2-digit",
            })
          : "";
      }

      if (period === 90) {
        const previousDate = new Date(date);

        previousDate.setDate(
          previousDate.getDate() - 1
        );

        const monthChanged =
          date.getMonth() !==
          previousDate.getMonth();

        label =
          monthChanged || i === 0
            ? date.toLocaleDateString("it-IT", {
                month: "short",
              })
            : "";
      }

      days.push({
        date,
        label,
        value: count,
      });
    }

    return days;
  }, [scans, period]);

  const chartMax = Math.max(
    ...chartData.map((item) => item.value),
    5
  );

  const periodLabel =
    period === 7
      ? "Ultimi 7 giorni"
      : period === 30
      ? "Ultimi 30 giorni"
      : "Ultimi 90 giorni";

  /*
   * ================================================================
   * LOADING
   * ================================================================
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
   * ================================================================
   * LOCALE NON TROVATO
   * ================================================================
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

          <button
            type="button"
            onClick={handleLogout}
            className="mt-6 rounded-full bg-slate-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-700"
          >
            Esci
          </button>
        </div>
      </main>
    );
  }

  /*
   * ================================================================
   * DASHBOARD
   * ================================================================
   */

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f8f7ff] text-[#17163a]">

      {/* BACKGROUND */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-fuchsia-300/30 blur-[120px]" />

        <div className="absolute right-[-180px] top-[120px] h-[500px] w-[500px] rounded-full bg-orange-300/25 blur-[130px]" />

        <div className="absolute bottom-[-200px] left-[35%] h-[500px] w-[500px] rounded-full bg-purple-300/25 blur-[140px]" />
      </div>

      {/* ==========================================================
          SIDEBAR DESKTOP
      ========================================================== */}

      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[230px] border-r border-white/70 bg-white/75 px-5 py-7 backdrop-blur-2xl lg:block">

        <Link
          href={`/dashboard-lite/${slug}`}
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

        <div className="mt-2 px-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
          Dashboard Lite
        </div>

        {/* UNICA VOCE DI NAVIGAZIONE */}

        <nav className="mt-8 space-y-2">
          <SidebarItem
            icon="⌂"
            label="Dashboard"
            href={`/dashboard-lite/${slug}`}
            active
          />
        </nav>

        {/* LOGOUT */}

        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="absolute bottom-[230px] left-5 right-5 flex w-[calc(100%-40px)] items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold text-slate-600 transition hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="flex w-5 items-center justify-center text-lg">
            ↪
          </span>

          <span>
            {loggingOut ? "Uscita..." : "Esci"}
          </span>
        </button>

        {/* PROMO CARD */}

        <div className="absolute bottom-7 left-5 right-5 overflow-hidden rounded-3xl bg-gradient-to-br from-fuchsia-600 via-purple-600 to-orange-400 p-5 text-white shadow-xl shadow-purple-300/30">

          <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/20 blur-2xl" />

          <div className="relative">

            <div className="text-2xl">
              ⚡
            </div>

            <p className="mt-4 text-sm font-bold">
              UPOSTO sta
              <br />
              lavorando.
            </p>

            <p className="mt-2 text-[11px] leading-5 text-white/75">
              Qui puoi controllare le scansioni della tua targhetta.
            </p>

          </div>
        </div>

      </aside>

      {/* ==========================================================
          MOBILE HEADER
      ========================================================== */}

      <div className="relative z-30 flex items-center justify-between border-b border-white/60 bg-white/75 px-5 py-4 backdrop-blur-xl lg:hidden">

        <Link
          href={`/dashboard-lite/${slug}`}
          className="flex items-center gap-2"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-fuchsia-500 to-purple-600 text-white font-black">
            U
          </div>

          <span className="font-black">
            UPOSTO
          </span>
        </Link>

        <div className="flex items-center gap-4">

          <div className="text-right">
            <p className="text-xs font-black">
              {business.nome}
            </p>

            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
              Dashboard Lite
            </p>
          </div>

          {/* LOGOUT MOBILE */}

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="rounded-full bg-red-50 px-4 py-2 text-xs font-black text-red-500 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loggingOut ? "..." : "Esci"}
          </button>

        </div>

      </div>

      {/* ==========================================================
          MAIN
      ========================================================== */}

      <div className="relative min-h-screen lg:ml-[230px]">

        <div className="mx-auto max-w-[1250px] px-5 py-7 sm:px-8 lg:px-10">

          {/* ======================================================
              HEADER
          ====================================================== */}

          <section className="relative mt-2 overflow-hidden rounded-[30px]">

            <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-100 via-white to-orange-100" />

            <div className="relative flex min-h-[145px] items-center justify-between overflow-hidden rounded-[30px] border border-white/80 px-7 py-8 shadow-[0_20px_60px_rgba(104,65,180,0.10)] sm:px-10">

              <div>

                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-purple-100 bg-white/90 px-4 py-2 text-[10px] font-black uppercase tracking-wider text-purple-600 shadow-sm">
                  Dashboard Lite
                </div>

                <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
                  {business.nome}
                </h1>

                <p className="mt-3 text-sm font-medium text-slate-400">
                  Monitora le scansioni della tua targhetta UPOSTO.
                </p>

              </div>

              <div className="absolute right-[-20px] top-[-70px] hidden h-64 w-64 rounded-full bg-gradient-to-br from-fuchsia-300/40 to-orange-300/40 blur-3xl sm:block" />

            </div>

          </section>

          {/* ======================================================
              STATS
          ====================================================== */}

          <section className="mt-6 grid gap-5 md:grid-cols-3">

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

          </section>

          {/* ======================================================
              CHART
          ====================================================== */}

          <section className="mt-5">

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

                <div className="flex rounded-full bg-slate-100 p-1 text-[11px] font-bold">

                  {[7, 30, 90].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        setPeriod(value as Period)
                      }
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

              <div className="mt-8 h-[260px] w-full">

                <svg
                  viewBox="0 0 760 260"
                  className="h-full w-full overflow-visible"
                  preserveAspectRatio="none"
                >

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

                  <defs>

                    <linearGradient
                      id="liteChartGradient"
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
                      id="liteLineGradient"
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
                            (item.value / chartMax) *
                              185;

                          return `${x},${y}`;
                        })
                        .join(" ") +
                      " 740,220 50,220"
                    }
                    fill="url(#liteChartGradient)"
                    stroke="none"
                  />

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
                          (item.value / chartMax) *
                            185;

                        return `${x},${y}`;
                      })
                      .join(" ")}
                    fill="none"
                    stroke="url(#liteLineGradient)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

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
                      (item.value / chartMax) *
                        185;

                    return (
                      <g key={index}>

                        <circle
                          cx={x}
                          cy={y}
                          r="6"
                          fill="white"
                          stroke="#ec4899"
                          strokeWidth="3"
                        />

                        <circle
                          cx={x}
                          cy={y}
                          r="2.5"
                          fill="#ec4899"
                        />

                        <title>
                          {item.value} scansioni
                        </title>

                      </g>
                    );
                  })}

                  {chartData.map((item, index) => {

                    if (!item.label) return null;

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
                        key={index}
                        x={x}
                        y="248"
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight="600"
                        fill="#8b89a0"
                      >
                        {item.label}
                      </text>
                    );
                  })}

                </svg>

              </div>

            </div>

          </section>

          {/* ======================================================
              DISTRIBUTION + ACTIVITY
          ====================================================== */}

          <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_1.5fr]">

            {/* DISTRIBUTION */}

            <div className="rounded-[28px] border border-white/80 bg-white/90 p-6 shadow-[0_15px_50px_rgba(60,40,100,0.08)] backdrop-blur-xl">

              <h2 className="text-lg font-black">
                Come ti stanno trovando
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Distribuzione delle scansioni
              </p>

              <div className="mt-8 flex items-center justify-center gap-8">

                <div
                  className="relative h-40 w-40 shrink-0 rounded-full"
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
                              nfcPercentage +
                              qrPercentage
                            }% 100%
                          )`,
                  }}
                >

                  <div className="absolute inset-[22px] flex flex-col items-center justify-center rounded-full bg-white shadow-inner">

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

                  {otherScans > 0 && (
                    <Legend
                      gradient="from-slate-300 to-slate-400"
                      label="Altro"
                      percentage={otherPercentage}
                      value={otherScans}
                    />
                  )}

                </div>

              </div>

            </div>

            {/* ACTIVITY */}

            <div className="rounded-[28px] border border-white/80 bg-white/90 p-6 shadow-[0_15px_50px_rgba(60,40,100,0.08)] backdrop-blur-xl">

              <div>
                <h2 className="text-lg font-black">
                  Attività recente
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Ultime scansioni registrate
                </p>
              </div>

              <div className="mt-5 divide-y divide-slate-100">

                {scans.slice(0, 7).map((scan) => {

                  const isNfc =
                    scan.source === "nfc";

                  const source =
                    scan.source === "nfc"
                      ? "NFC"
                      : scan.source === "qr"
                      ? "QR"
                      : "Diretta";

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
                            Scansione {source}
                          </p>

                          <p className="mt-1 text-[11px] text-slate-400">

                            {new Date(
                              scan.created_at
                            ).toLocaleDateString("it-IT")}

                            {" · "}

                            {new Date(
                              scan.created_at
                            ).toLocaleTimeString("it-IT", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}

                          </p>

                        </div>

                      </div>

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
                      Quando qualcuno utilizzerà la tua targhetta,
                      la vedrai qui.
                    </p>

                  </div>
                )}

              </div>

            </div>

          </section>

        </div>

      </div>

    </main>
  );
}

/* =============================================================
   SIDEBAR ITEM
============================================================= */

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

/* =============================================================
   STAT CARD
============================================================= */

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

/* =============================================================
   LEGEND
============================================================= */

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