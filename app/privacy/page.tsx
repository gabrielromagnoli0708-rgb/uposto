export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#f8f7ff] px-6 py-16 text-slate-900">
      <div className="mx-auto max-w-3xl rounded-[32px] bg-white p-8 shadow-xl md:p-12">
        <a href="/" className="font-black text-fuchsia-600">← Torna a UPOSTO</a>
        <h1 className="mt-8 font-coolvetica text-5xl">Privacy Policy</h1>
        <p className="mt-4 text-sm text-slate-500">Ultimo aggiornamento: [INSERIRE DATA]</p>

        <div className="mt-10 space-y-8 text-sm leading-7 text-slate-600">
          <section>
            <h2 className="text-xl font-black text-slate-900">1. Titolare del trattamento</h2>
            <p className="mt-3">[INSERIRE NOME/DENOMINAZIONE], con sede in [INSERIRE SEDE], email [INSERIRE EMAIL].</p>
          </section>
          <section>
            <h2 className="text-xl font-black text-slate-900">2. Quali dati trattiamo</h2>
            <p className="mt-3">Il sito può trattare i dati forniti volontariamente tramite i contatti e, per i servizi UPOSTO, dati tecnici e dati relativi alle interazioni con le targhette, secondo quanto effettivamente implementato.</p>
          </section>
          <section>
            <h2 className="text-xl font-black text-slate-900">3. Finalità e basi giuridiche</h2>
            <p className="mt-3">I dati vengono trattati per rispondere alle richieste, fornire i servizi richiesti, gestire gli account dei clienti e adempiere agli obblighi di legge, sulla base giuridica applicabile caso per caso.</p>
          </section>
          <section>
            <h2 className="text-xl font-black text-slate-900">4. Conservazione e destinatari</h2>
            <p className="mt-3">I dati sono conservati per il tempo necessario alle finalità indicate e possono essere trattati da fornitori tecnici necessari al funzionamento del servizio, nei limiti applicabili.</p>
          </section>
          <section>
            <h2 className="text-xl font-black text-slate-900">5. Diritti dell'interessato</h2>
            <p className="mt-3">L'interessato può esercitare i diritti previsti dalla normativa applicabile, inclusi accesso, rettifica, cancellazione, limitazione e opposizione quando ricorrono i presupposti.</p>
          </section>
          <section>
            <h2 className="text-xl font-black text-slate-900">6. Cookie e strumenti di tracciamento</h2>
            <p className="mt-3">Questa sezione deve essere aggiornata in base agli strumenti effettivamente utilizzati dal sito. Non dichiarare strumenti o cookie che non sono realmente presenti.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
