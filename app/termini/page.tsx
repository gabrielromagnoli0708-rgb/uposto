export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#f8f7ff] px-6 py-16 text-slate-900">
      <div className="mx-auto max-w-3xl rounded-[32px] bg-white p-8 shadow-xl md:p-12">
        <a href="/" className="font-black text-fuchsia-600">← Torna a UPOSTO</a>
        <h1 className="mt-8 font-coolvetica text-5xl">Termini e condizioni</h1>
        <p className="mt-4 text-sm text-slate-500">Ultimo aggiornamento: [INSERIRE DATA]</p>

        <div className="mt-10 space-y-8 text-sm leading-7 text-slate-600">
          <section><h2 className="text-xl font-black text-slate-900">1. Servizio</h2><p className="mt-3">UPOSTO fornisce strumenti e servizi digitali per locali e attività. Le caratteristiche effettivamente incluse dipendono dalla soluzione acquistata.</p></section>
          <section><h2 className="text-xl font-black text-slate-900">2. Attivazione e durata</h2><p className="mt-3">La durata, il prezzo, le targhette incluse e gli eventuali servizi ricorrenti devono essere indicati nell'offerta o nel contratto concordato con il cliente.</p></section>
          <section><h2 className="text-xl font-black text-slate-900">3. Pagamenti</h2><p className="mt-3">Le condizioni di pagamento vengono comunicate prima dell'acquisto e accettate dal cliente.</p></section>
          <section><h2 className="text-xl font-black text-slate-900">4. Uso del servizio</h2><p className="mt-3">Il cliente è responsabile dell'uso dei propri account e dei contenuti o collegamenti forniti a UPOSTO.</p></section>
          <section><h2 className="text-xl font-black text-slate-900">5. Contatti</h2><p className="mt-3">Per assistenza o informazioni: [INSERIRE EMAIL/CONTATTO UPOSTO].</p></section>
        </div>
      </div>
    </main>
  );
}
