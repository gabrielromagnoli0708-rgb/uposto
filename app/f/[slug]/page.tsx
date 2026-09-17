"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function FeedbackPage() {
  const params = useParams();
  const slug = params.slug as string;

  useEffect(() => {
    async function handleScan() {
      if (!slug) return;

      // 1. Trova il locale tramite lo slug
      const { data, error } = await supabase
        .from("locali")
        .select("id, google_review_url")
        .eq("slug", slug)
        .single();

      if (error || !data) {
        console.error("Errore caricamento locale:", error);
        return;
      }

      // 2. Legge da dove arriva la scansione
      const sourceParam = new URLSearchParams(
        window.location.search
      ).get("source");

      const source =
        sourceParam === "nfc" || sourceParam === "qr"
          ? sourceParam
          : null;

      // 3. Registra la scansione
      const { error: scanError } = await supabase
        .from("scansioni")
        .insert({
          locale_id: data.id,
          source,
        });

      if (scanError) {
        console.error(
          "Errore salvataggio scansione:",
          scanError
        );
      }

      // 4. Reindirizza immediatamente a Google
      if (data.google_review_url) {
        window.location.href = data.google_review_url;
      }
    }

    handleScan();
  }, [slug]);

  // La pagina non deve mostrare nulla
  return null;
}