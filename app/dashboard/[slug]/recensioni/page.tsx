"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Business = {
  id: string;
  nome: string;
  categoria: string | null;
  google_review_url: string | null;
};

type Scan = {
  id: string;
  source: string | null;
  created_at: string;
};

export default function RecensioniPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [business, setBusiness] = useState<Business | null>(null);
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!slug) return;

      const { data, error } = await supabase
        .from("locali")
        .select("id, nome, categoria, google_review_url")
        .eq("slug", slug)
        .single();

      if (error || !data) {
        console.error(error);
        setLoading(false);
        return;
      }

      setBusiness(data);

      const { data: scanData } = await supabase
        .from("scansioni")
        .select("id, source, created_at")
        .eq("locale_id", data.id)
        .order("created_at", { ascending: false });

      setScans(scanData ?? []);
      setLoading(false);
    }

    load();
  }, [slug]);

  if (loading) {
    return <Loading />;
  }

  if (!business) {
    return <NotFound />;
  }

  const total = scans.length;
  const nfc = scans.filter((x) => x.source === "nfc").length;
  const qr = scans.filter((x) => x.source === "qr").length;

  return (
    <DashboardLayout
      slug={slug}
      businessName={business.nome}
      active="recensioni"
    >
      <div className="space-y-6">

        <PageHeader
          title="Recensioni"
          subtitle="Gestisci il collegamento tra UPOSTO e Google."
        />

        <section className="grid gap-5 lg:grid-cols-2">

          <div className="rounded-[28px] bg-white p-7 shadow-[0_15px_50px_rgba(60,40,100,0.08)]">

            <div className="flex items-center gap-4">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-3xl font-black shadow-md">
                <span className="bg-gradient-to-r from-blue-500 via-red-500 to-yellow-500 bg-clip-text text-transparent">
                  G
                </span>
              </div>

              <div>

                <h2 className="text-xl font-black">
                  Google Business
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Collegamento al profilo Google
                </p>

              </div>

            </div>

            <div className="mt-7 rounded-2xl bg-slate-50 p-5">

              <div className="flex items-center gap-3">

                <span
                  className={`h-3 w-3 rounded-full ${
                    business.google_review_url
                      ? "bg-emerald-500"
                      : "bg-red-500"
                  }`}
                />

                <span className="text-sm font-bold">

                  {business.google_review_url
                    ? "Link Google configurato"
                    : "Link Google non configurato"}

                </span>

              </div>

            </div>

            {business.google_review_url ? (
              <a
                href={business.google_review_url}
                target="_blank"
                rel="noreferrer"
                className="mt-6 flex items-center justify-center rounded-2xl bg-gradient-to-r from-fuchsia-500 to-purple-600 px-5 py-4 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5"
              >
                Apri pagina recensioni Google →
              </a>
            ) : (
              <Link
                href={`/dashboard/${slug}/impostazioni`}
                className="mt-6 flex items-center justify-center rounded-2xl bg-gradient-to-r from-fuchsia-500 to-purple-600 px-5 py-4 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5"
              >
                Configura il link Google →
              </Link>
            )}

          </div>

          <div className="rounded-[28px] bg-gradient-to-br from-fuchsia-600 via-purple-600 to-orange-400 p-7 text-white shadow-xl">

            <p className="text-xs font-black uppercase tracking-[0.2em] text-white/60">
              UPOSTO
            </p>

            <h2 className="mt-5 text-3xl font-black">
              Trasforma una scansione
              <br />
              in una recensione.
            </h2>

            <p className="mt-5 max-w-md text-sm leading-6 text-white/75">
              Quando un cliente utilizza una targhetta UPOSTO,
              la scansione viene registrata e può essere
              indirizzata direttamente alla pagina Google del locale.
            </p>

            <div className="mt-7 flex gap-3">

              <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur-xl">
                <div className="text-2xl font-black">
                  {total}
                </div>
                <div className="text-[11px] text-white/60">
                  scansioni
                </div>
              </div>

              <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur-xl">
                <div className="text-2xl font-black">
                  {nfc}
                </div>
                <div className="text-[11px] text-white/60">
                  NFC
                </div>
              </div>

              <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur-xl">
                <div className="text-2xl font-black">
                  {qr}
                </div>
                <div className="text-[11px] text-white/60">
                  QR
                </div>
              </div>

            </div>

          </div>

        </section>

        <section className="rounded-[28px] bg-white p-7 shadow-[0_15px_50px_rgba(60,40,100,0.08)]">

          <h2 className="text-xl font-black">
            Come funziona
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-3">

            <Step
              number="01"
              title="Il cliente scansiona"
              text="Utilizza la targhetta NFC oppure il QR code."
            />

            <Step
              number="02"
              title="UPPOSTO registra"
              text="La scansione viene salvata nel database del locale."
            />

            <Step
              number="03"
              title="Google"
              text="Il cliente viene portato alla pagina Google configurata."
            />

          </div>

        </section>

      </div>
    </DashboardLayout>
  );
}

function Step({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-5">

      <span className="text-xs font-black text-fuchsia-500">
        {number}
      </span>

      <h3 className="mt-3 font-black">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-5 text-slate-400">
        {text}
      </p>

    </div>
  );
}

function DashboardLayout({
  children,
  slug,
  businessName,
  active,
}: {
  children: React.ReactNode;
  slug: string;
  businessName: string;
  active: string;
}) {
  return (
    <main className="min-h-screen bg-[#f8f7ff] text-[#17163a]">

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

          <NavItem
            label="Dashboard"
            icon="⌂"
            href={`/dashboard/${slug}`}
            active={active === "dashboard"}
          />

          <NavItem
            label="Recensioni"
            icon="☆"
            href={`/dashboard/${slug}/recensioni`}
            active={active === "recensioni"}
          />

          <NavItem
            label="Statistiche"
            icon="▥"
            href={`/dashboard/${slug}/statistiche`}
            active={active === "statistiche"}
          />

        </nav>

      </aside>

      <div className="lg:ml-[230px]">

        <header className="border-b border-white bg-white/70 px-6 py-5 backdrop-blur-xl">
          <div className="mx-auto max-w-[1100px] text-right">
            <span className="text-sm font-bold text-slate-500">
              {businessName}
            </span>
          </div>
        </header>

        <div className="mx-auto max-w-[1100px] px-5 py-8 sm:px-8">
          {children}
        </div>

      </div>

    </main>
  );
}

function NavItem({
  label,
  icon,
  href,
  active,
}: {
  label: string;
  icon: string;
  href: string;
  active: boolean;
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
      <span>{icon}</span>
      {label}
    </Link>
  );
}

function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div>
      <h1 className="text-4xl font-black tracking-tight">
        {title}
      </h1>

      <p className="mt-2 text-sm text-slate-400">
        {subtitle}
      </p>
    </div>
  );
}

function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f7ff]">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-200 border-t-fuchsia-500" />
    </main>
  );
}

function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f7ff]">
      <div className="rounded-3xl bg-white p-10 text-center shadow-xl">
        <h1 className="text-2xl font-black">
          Locale non trovato
        </h1>
      </div>
    </main>
  );
}