"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function FeedbackPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [businessId, setBusinessId] = useState<string | null>(null);

  const [businessName, setBusinessName] =
    useState("NOME LOCALE");

  const [businessCategory, setBusinessCategory] =
    useState("RISTORANTE · PIZZERIA");

  const [googleReviewUrl, setGoogleReviewUrl] =
    useState("");

  const [loading, setLoading] = useState(true);

  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);

  // =========================================================
  // CARICAMENTO DATI DEL LOCALE DA SUPABASE
  // =========================================================

  useEffect(() => {
    async function loadBusiness() {
      const { data, error } = await supabase
        .from("locali")
        .select("*")
        .eq("slug", slug)
        .single();

if (error) {
  console.error(
    "ERRORE SUPABASE:",
    error.message,
    "| CODE:",
    error.code,
    "| DETAILS:",
    error.details,
    "| HINT:",
    error.hint
  );
  setLoading(false);
  return;
}

      setBusinessId(data.id);
      setBusinessName(data.nome);
      setBusinessCategory(data.categoria ?? "");
      setGoogleReviewUrl(data.google_review_url);
        setLoading(false);
    }

    if (slug) {
      loadBusiness();
    }
  }, [slug]);

  const displayRating = hoverRating || rating;

  // =========================================================
  // SALVATAGGIO RATING + REDIRECT GOOGLE
  // =========================================================

  async function handleRating(value: number) {
    setRating(value);

    if (businessId) {
      const source =
        new URLSearchParams(window.location.search).get("source");

      const { error } = await supabase
        .from("feedback")
        .insert({
          locale_id: businessId,
          rating: value,
          source:
            source === "nfc" || source === "qr"
              ? source
              : null,
        });

      if (error) {
        console.error("Errore salvataggio feedback:", error);
      }
    }

    setTimeout(() => {
      if (googleReviewUrl) {
        window.location.href = googleReviewUrl;
      }
    }, 500);
  }

  if (loading) {
  return (
    <main className="min-h-screen bg-[#050812] flex items-center justify-center text-white">
      <div className="text-sm opacity-70">
        UPOSTO
      </div>
    </main>
  );
}

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050812] text-white">

      {/* =========================================================
          BACKGROUND GLOW
      ========================================================= */}

      {/* Glow blu */}
      <div
        className="
          pointer-events-none
          absolute
          -left-32
          top-1/3
          h-96
          w-96
          rounded-full
          bg-blue-600/20
          blur-[120px]
        "
      />

      {/* Glow arancione */}
      <div
        className="
          pointer-events-none
          absolute
          -right-32
          top-0
          h-[500px]
          w-[500px]
          rounded-full
          bg-orange-500/20
          blur-[140px]
        "
      />

      {/* Glow centrale */}
      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-1/2
          h-[500px]
          w-[500px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-indigo-500/10
          blur-[160px]
        "
      />

      {/* =========================================================
          BRAND
      ========================================================= */}

      <div className="absolute left-6 top-6 z-20">
        <div className="text-sm font-semibold tracking-[0.35em] text-white">
          UPOSTO
        </div>

        <div className="mt-3 h-[2px] w-8 bg-orange-400" />
      </div>

      {/* =========================================================
          CONTENUTO
      ========================================================= */}

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-5 py-24">

        {/* =======================================================
            LOGO LOCALE
        ======================================================= */}

        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-orange-400/70 bg-black/30 shadow-[0_0_35px_rgba(249,115,22,0.25)] backdrop-blur-xl">
          <div className="text-3xl">
            🍴
          </div>
        </div>

        {/* =======================================================
            
        ======================================================= */}

        <h1 className="text-center text-4xl font-semibold tracking-tight sm:text-5xl">
          {businessName}
        </h1>

        <p className="mt-2 text-center text-xs font-medium uppercase tracking-[0.35em] text-slate-400">
          {businessCategory}
        </p>

        {/* =======================================================
            CARD
        ======================================================= */}

        <div className="relative mt-12 w-full max-w-md">

          {/* Glow dietro la card */}
          <div
            className="
              absolute
              -inset-1
              rounded-[32px]
              bg-gradient-to-r
              from-blue-500/40
              via-purple-500/20
              to-orange-500/40
              opacity-70
              blur-xl
            "
          />

          {/* Bordo gradient */}
          <div
            className="
              relative
              rounded-[32px]
              bg-gradient-to-br
              from-blue-500
              via-transparent
              to-orange-400
              p-[1px]
            "
          >

            {/* Card vera */}
            <div
              className="
                rounded-[31px]
                border
                border-white/10
                bg-[#080d18]/85
                px-6
                py-12
                text-center
                shadow-2xl
                backdrop-blur-2xl
                sm:px-10
              "
            >

              {/* =================================================
                  DOMANDA
              ================================================= */}

              <h2 className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
                COM'È STATA
                <br />
                LA TUA ESPERIENZA?
              </h2>

              <p className="mx-auto mt-5 max-w-xs text-base leading-relaxed text-slate-400">
                La tua opinione ci aiuta
                <br />
                a migliorare.
              </p>

              {/* =================================================
                  STELLE
              ================================================= */}

              <div
                className="mt-10 flex justify-center gap-1"
                onMouseLeave={() => setHoverRating(0)}
              >
                {[1, 2, 3, 4, 5].map((star) => {
                  const filled = displayRating >= star;
                  const half = displayRating === star - 0.5;

                  return (
                    <div
                      key={star}
                      className="relative h-14 w-12"
                    >

                      {/* Stella intera */}
                      <button
                        type="button"
                        aria-label={`${star} stelle`}
                        onMouseEnter={() => setHoverRating(star)}
                        onClick={() => handleRating(star)}
                        className="
                          absolute
                          inset-0
                          z-10
                          flex
                          items-center
                          justify-center
                          text-5xl
                          leading-none
                          transition-transform
                          duration-150
                          active:scale-90
                        "
                      >
                        <span
                          className={`
                            ${
                              filled
                                ? "text-orange-400"
                                : half
                                  ? "bg-gradient-to-r from-orange-400 50% to-slate-700 50% bg-clip-text text-transparent"
                                  : "text-slate-700"
                            }
                          `}
                          style={{
                            filter:
                              filled || half
                                ? "drop-shadow(0 0 10px rgba(251,146,60,0.55))"
                                : "none",
                          }}
                        >
                          ★
                        </span>
                      </button>

                      {/* Mezza stella sinistra */}
                      <button
                        type="button"
                        aria-label={`${star - 0.5} stelle`}
                        onMouseEnter={() =>
                          setHoverRating(star - 0.5)
                        }
                        onClick={() =>
                          handleRating(star - 0.5)
                        }
                        className="
                          absolute
                          left-0
                          top-0
                          z-20
                          h-full
                          w-1/2
                        "
                      />

                    </div>
                  );
                })}
              </div>

              {/* =================================================
                  RATING SELEZIONATO
              ================================================= */}

              <div className="mt-8 min-h-[50px]">

                {rating > 0 && (
                  <>
                    <div
                      className="
                        inline-flex
                        items-center
                        rounded-full
                        border
                        border-white/10
                        bg-white/5
                        px-5
                        py-2
                        text-sm
                        font-medium
                        text-slate-200
                        backdrop-blur-md
                      "
                    >
                      {rating} stelle
                    </div>

                    <p className="mt-3 text-sm text-slate-400">
                      Lascia la tua recensione su Google...
                    </p>
                  </>
                )}

                {!rating && (
                  <p className="text-sm text-slate-500">
                    Tocca una stella per continuare
                  </p>
                )}

              </div>

            </div>
          </div>
        </div>

        {/* =======================================================
            FOOTER
        ======================================================= */}

        <div className="mt-16 flex items-center gap-4 text-xs uppercase tracking-[0.3em] text-slate-500">

          <div className="h-px w-12 bg-slate-700" />

          <span>Grazie per il tuo tempo</span>

          <div className="h-px w-12 bg-slate-700" />

        </div>

      </div>
    </main>
  );
}