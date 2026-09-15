export default function AdminPage() {
  return (
    <main className="min-h-screen bg-[#f7f7f5] text-[#111]">
      <div className="flex min-h-screen">

        {/* SIDEBAR */}
        <aside className="w-64 border-r border-black/10 bg-white px-6 py-8">
          <h1 className="text-xl font-semibold tracking-tight">
            UPOSTO
          </h1>

          <nav className="mt-12 space-y-2">
            <div className="rounded-xl bg-black px-4 py-3 text-sm text-white">
              Overview
            </div>

            <div className="px-4 py-3 text-sm text-black/50">
              Locali
            </div>

            <div className="px-4 py-3 text-sm text-black/50">
              Analytics
            </div>

            <div className="px-4 py-3 text-sm text-black/50">
              Pagamenti
            </div>

            <div className="px-4 py-3 text-sm text-black/50">
              Mappa
            </div>
          </nav>
        </aside>

        {/* CONTENUTO */}
        <section className="flex-1 px-12 py-10">

          <p className="text-sm text-black/40">
            UPOSTO · ADMIN
          </p>

          <h2 className="mt-3 text-4xl font-semibold tracking-tight">
            Ciao Gabriel.
          </h2>

          <p className="mt-2 text-lg text-black/50">
            Ecco le novità di oggi.
          </p>

          {/* STATISTICHE */}
          <div className="mt-12 grid grid-cols-4 gap-5">

            <div className="rounded-3xl border border-black/10 bg-white p-6">
              <p className="text-sm text-black/40">
                Locali attivi
              </p>
              <p className="mt-3 text-4xl font-semibold">
                0
              </p>
            </div>

            <div className="rounded-3xl border border-black/10 bg-white p-6">
              <p className="text-sm text-black/40">
                Scansioni
              </p>
              <p className="mt-3 text-4xl font-semibold">
                0
              </p>
            </div>

            <div className="rounded-3xl border border-black/10 bg-white p-6">
              <p className="text-sm text-black/40">
                Feedback
              </p>
              <p className="mt-3 text-4xl font-semibold">
                0
              </p>
            </div>

            <div className="rounded-3xl border border-black/10 bg-white p-6">
              <p className="text-sm text-black/40">
                Entrate mensili
              </p>
              <p className="mt-3 text-4xl font-semibold">
                €0
              </p>
            </div>

          </div>

        </section>
      </div>
    </main>
  );
}