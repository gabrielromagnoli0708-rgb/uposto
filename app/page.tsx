export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <section className="w-full max-w-md text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-yellow-400 mb-4">
          The new era in your business
        </p>

        <h1 className="text-6xl font-bold tracking-tight">
          Cennyct
        </h1>

        <p className="mt-6 text-gray-400 text-lg">
          Turn every interaction into a connection.
        </p>

        <button className="mt-10 w-full rounded-full bg-yellow-400 px-6 py-4 font-semibold text-black">
          Get started
        </button>
      </section>
    </main>
  );
}