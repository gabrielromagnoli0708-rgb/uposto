"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

export default function ComeFunzionaPage() {
  const params = useParams();
  const slug = params.slug as string;

  return (
    <main className="min-h-screen bg-[#f8f7ff] text-[#17163a]">

      <div className="mx-auto max-w-[1000px] px-5 py-10 sm:px-8">

        <Link
          href={`/dashboard/${slug}`}
          className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-xs font-black text-slate-600 shadow-sm transition hover:-translate-x-1"
        >
          ← Torna alla dashboard
        </Link>

        <section className="mt-6 overflow-hidden rounded-[35px] bg-gradient-to-br from-fuchsia-600 via-purple-600 to-orange-400 p-8 text-white shadow-2xl sm:p-12">

          <p className="text-xs font-black uppercase tracking-[0.25em] text-white/60">
            UPOSTO
          </p>

          <h1 className="mt-5 text-5xl font-black tracking-tight">
            Come funziona?
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/75">
            UPOSTO trasforma una semplice targhetta NFC o un QR code
            in un punto di accesso diretto alle recensioni del tuo locale.
          </p>

        </section>

        <section className="mt-6 grid gap-5 md:grid-cols-3">

          <Card
            number="01"
            icon="◉"
            title="Il cliente scansiona"
            text="Il cliente avvicina lo smartphone alla targhetta NFC oppure inquadra il QR code."
          />

          <Card
            number="02"
            icon="⌁"
            title="UPOSTO registra"
            text="La scansione viene registrata nel sistema, così puoi sapere quante interazioni genera la tua targhetta."
          />

          <Card
            number="03"
            icon="★"
            title="Google"
            text="Il cliente viene portato direttamente al link Google configurato per il tuo locale."
          />

        </section>

        <section className="mt-6 rounded-[30px] bg-white p-8 shadow-[0_15px_50px_rgba(60,40,100,0.08)]">

          <h2 className="text-2xl font-black">
            Perché UPOSTO?
          </h2>

          <div className="mt-6 space-y-4">

            <Benefit
              icon="⚡"
              title="Rapido"
              text="Il percorso dalla scansione alla pagina Google è pensato per essere immediato."
            />

            <Benefit
              icon="📊"
              title="Misurabile"
              text="Le scansioni vengono registrate e visualizzate nella dashboard."
            />

            <Benefit
              icon="📱"
              title="NFC + QR"
              text="La stessa esperienza può essere raggiunta tramite NFC o QR code."
            />

          </div>

        </section>

        <Link
          href={`/dashboard/${slug}`}
          className="mt-6 flex items-center justify-center rounded-2xl bg-gradient-to-r from-fuchsia-500 to-purple-600 px-6 py-4 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5"
        >
          Torna alla dashboard →
        </Link>

      </div>

    </main>
  );
}

function Card({
  number,
  icon,
  title,
  text,
}: {
  number: string;
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[28px] bg-white p-7 shadow-[0_15px_50px_rgba(60,40,100,0.08)]">

      <div className="flex items-center justify-between">

        <span className="text-xs font-black text-fuchsia-500">
          {number}
        </span>

        <span className="text-2xl">
          {icon}
        </span>

      </div>

      <h2 className="mt-8 text-xl font-black">
        {title}
      </h2>

      <p className="mt-3 text-sm leading-6 text-slate-400">
        {text}
      </p>

    </div>
  );
}

function Benefit({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-4 rounded-2xl bg-slate-50 p-5">

      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
        {icon}
      </div>

      <div>

        <h3 className="font-black">
          {title}
        </h3>

        <p className="mt-1 text-sm leading-5 text-slate-400">
          {text}
        </p>

      </div>

    </div>
  );
}