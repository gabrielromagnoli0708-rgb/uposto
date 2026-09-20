"use client";

import {
  PointerEvent,
  useEffect,
  useRef,
  useState,
} from "react";

type PhonePosition = {
  x: number;
  y: number;
};

export default function Home() {
  const [started, setStarted] = useState(false);
  const [nfcConnected, setNfcConnected] = useState(false);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [reviewOpened, setReviewOpened] = useState(false);
  const [reviewNotifications, setReviewNotifications] = useState(0);
  const [dashboardVisible, setDashboardVisible] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  const [phonePosition, setPhonePosition] =
    useState<PhonePosition>({
      x: 0,
      y: 0,
    });

  const [dragging, setDragging] = useState(false);

  const sceneRef = useRef<HTMLDivElement | null>(null);
  const phoneRef = useRef<HTMLDivElement | null>(null);
  const tagRef = useRef<HTMLDivElement | null>(null);

  const experienceRef = useRef<HTMLElement | null>(null);
  const servicesRef = useRef<HTMLElement | null>(null);
  const dashboardRef = useRef<HTMLElement | null>(null);
  const pricingRef = useRef<HTMLElement | null>(null);
  const contactRef = useRef<HTMLElement | null>(null);

  const dragOffset = useRef({
    x: 0,
    y: 0,
  });

  function handleStart() {
    setStarted(true);

    setTimeout(() => {
      experienceRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }, 350);
  }

  function handlePhonePointerDown(
    event: PointerEvent<HTMLDivElement>
  ) {
    if (nfcConnected) return;

    const phone = phoneRef.current;

    if (!phone) return;

    const rect = phone.getBoundingClientRect();

    dragOffset.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };

    phone.setPointerCapture(event.pointerId);

    setDragging(true);
  }

  function handlePhonePointerMove(
    event: PointerEvent<HTMLDivElement>
  ) {
    if (!dragging || nfcConnected) return;

    const scene = sceneRef.current;

    if (!scene) return;

    const sceneRect = scene.getBoundingClientRect();

    const newX =
      event.clientX -
      sceneRect.left -
      sceneRect.width / 2 -
      dragOffset.current.x +
      110;

    const newY =
      event.clientY -
      sceneRect.top -
      sceneRect.height / 2 -
      dragOffset.current.y +
      215;

    setPhonePosition({
      x: newX,
      y: newY,
    });
  }

  function handlePhonePointerUp() {
    if (!dragging) return;

    setDragging(false);

    setTimeout(checkCollision, 50);
  }

  function checkCollision() {
    const phone = phoneRef.current;
    const tag = tagRef.current;

    if (!phone || !tag) return;

    const phoneRect = phone.getBoundingClientRect();
    const tagRect = tag.getBoundingClientRect();

    const overlap =
      phoneRect.left < tagRect.right &&
      phoneRect.right > tagRect.left &&
      phoneRect.top < tagRect.bottom &&
      phoneRect.bottom > tagRect.top;

    if (overlap) {
      activateNfc();
    }
  }

  function activateNfc() {
    if (nfcConnected) return;

    setNfcConnected(true);

    setTimeout(() => {
      setNotificationVisible(true);
    }, 900);
  }

  function openReview() {
    setNotificationVisible(false);
    setReviewOpened(true);

    setTimeout(() => {
      let current = 0;

      const interval = setInterval(() => {
        current += 1;

        setReviewNotifications(current);

        if (current >= 6) {
          clearInterval(interval);
        }
      }, 380);
    }, 400);

    setTimeout(() => {
      dashboardRef.current?.scrollIntoView({
        behavior: "smooth",
      });

      setDashboardVisible(true);
    }, 3600);
  }

  function scrollToServices() {
    servicesRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }

  function scrollToDashboard() {
    dashboardRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }

  function scrollToPricing() {
    pricingRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  function scrollToContact() {
    contactRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  function resetExperience() {
    setNfcConnected(false);
    setNotificationVisible(false);
    setReviewOpened(false);
    setReviewNotifications(0);
    setDashboardVisible(false);

    setPhonePosition({
      x: 0,
      y: 0,
    });

    setTimeout(() => {
      experienceRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }, 100);
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileMenu(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, []);

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-slate-900">
      {/* ===================================================== */}
      {/* NAVBAR */}
      {/* ===================================================== */}

      <header
        className={`fixed left-0 right-0 top-0 z-[100] px-5 py-5 transition-all duration-700 ${
          started
            ? "translate-y-0 opacity-100"
            : "-translate-y-10 opacity-0"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/70 bg-white/80 px-5 py-3 shadow-[0_15px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <button
            type="button"
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }
            className="font-coolvetica text-2xl tracking-tight text-slate-950"
          >
            UPOSTO
          </button>

          <nav className="hidden items-center gap-7 text-xs font-black uppercase tracking-wider text-slate-500 md:flex">
            <button
              type="button"
              onClick={() =>
                experienceRef.current?.scrollIntoView({
                  behavior: "smooth",
                })
              }
              className="transition hover:text-fuchsia-500"
            >
              Esperienza
            </button>

            <button
              type="button"
              onClick={scrollToDashboard}
              className="transition hover:text-fuchsia-500"
            >
              Dashboard
            </button>

            <button
              type="button"
              onClick={scrollToServices}
              className="transition hover:text-fuchsia-500"
            >
              Servizi
            </button>

            <button
              type="button"
              onClick={scrollToPricing}
              className="transition hover:text-fuchsia-500"
            >
              Prezzi
            </button>

            <button
              type="button"
              onClick={scrollToContact}
              className="transition hover:text-fuchsia-500"
            >
              Contatti
            </button>
          </nav>

          <button
            type="button"
            onClick={() => setMobileMenu(!mobileMenu)}
            className="rounded-full bg-slate-950 px-4 py-2 text-xs font-black text-white md:hidden"
          >
            MENU
          </button>

          <button
            type="button"
            onClick={handleStart}
            className="hidden rounded-full bg-gradient-to-r from-fuchsia-500 to-purple-600 px-5 py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg md:block"
          >
            Metti a posto →
          </button>
        </div>

        {mobileMenu && (
          <div className="mx-auto mt-3 max-w-7xl rounded-3xl border border-white/70 bg-white/95 p-5 shadow-2xl backdrop-blur-xl md:hidden">
            <div className="flex flex-col gap-3 text-sm font-black text-slate-700">
              <button
                type="button"
                onClick={() => {
                  setMobileMenu(false);
                  experienceRef.current?.scrollIntoView({
                    behavior: "smooth",
                  });
                }}
                className="rounded-2xl bg-slate-50 px-4 py-4 text-left"
              >
                Esperienza
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenu(false);
                  scrollToDashboard();
                }}
                className="rounded-2xl bg-slate-50 px-4 py-4 text-left"
              >
                Dashboard
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenu(false);
                  scrollToServices();
                }}
                className="rounded-2xl bg-slate-50 px-4 py-4 text-left"
              >
                Servizi
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenu(false);
                  scrollToPricing();
                }}
                className="rounded-2xl bg-slate-50 px-4 py-4 text-left"
              >
                Prezzi
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenu(false);
                  scrollToContact();
                }}
                className="rounded-2xl bg-slate-50 px-4 py-4 text-left"
              >
                Contatti
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ===================================================== */}
      {/* HERO */}
      {/* ===================================================== */}

      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
        <div className="pointer-events-none absolute left-[-180px] top-[-180px] h-[500px] w-[500px] rounded-full bg-fuchsia-300/30 blur-3xl" />

        <div className="pointer-events-none absolute bottom-[-200px] right-[-150px] h-[500px] w-[500px] rounded-full bg-purple-300/30 blur-3xl" />

        <div
          className={`relative z-10 flex max-w-6xl flex-col items-center text-center transition-all duration-1000 ${
            started
              ? "pointer-events-none -translate-y-24 scale-90 opacity-0"
              : "translate-y-0 scale-100 opacity-100"
          }`}
        >
          <div className="mb-5 text-sm font-black uppercase tracking-[0.4em] text-fuchsia-500">
            Digitalizzazione per locali
          </div>

          <h1 className="font-coolvetica text-[clamp(5rem,16vw,13rem)] leading-[0.75] tracking-[-0.05em] text-slate-950">
            UPOSTO
          </h1>

          <p className="mt-9 font-coolvetica text-4xl text-fuchsia-500 md:text-6xl">
            Il tuo locale. A posto.
          </p>

          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-500 md:text-lg">
            Tecnologia, design e strumenti digitali per rendere
            il tuo locale più semplice, moderno e riconoscibile.
          </p>

          <button
            type="button"
            onClick={handleStart}
            className="group mt-11 rounded-full bg-gradient-to-r from-fuchsia-500 to-purple-600 px-10 py-5 text-sm font-black uppercase tracking-[0.12em] text-white shadow-[0_20px_60px_rgba(217,70,239,0.3)] transition duration-300 hover:-translate-y-1 hover:scale-105 hover:shadow-[0_25px_80px_rgba(217,70,239,0.4)]"
          >
            Metti il tuo locale a posto

            <span className="ml-3 inline-block transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </button>

          <div className="mt-14 animate-bounce text-slate-300">
            ↓
          </div>
        </div>
      </section>

      {/* ===================================================== */}
      {/* INTERACTIVE EXPERIENCE */}
      {/* ===================================================== */}

      <section
        ref={experienceRef}
        className="relative min-h-screen px-6 py-28"
      >
        <div className="mx-auto flex max-w-7xl flex-col items-center">
          <div className="text-center">
            <p className="text-sm font-black uppercase tracking-[0.3em] text-fuchsia-500">
              Scopri cosa facciamo
            </p>

            <h2 className="mt-4 font-coolvetica text-5xl leading-none md:text-7xl">
              Un semplice gesto.
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-slate-500">
              Porta il telefono sulla targhetta e scopri
              cosa succede.
            </p>
          </div>

          <div
            ref={sceneRef}
            className="relative mt-14 h-[650px] w-full max-w-6xl overflow-hidden rounded-[45px] border border-slate-100 bg-gradient-to-br from-slate-50 via-white to-fuchsia-50 shadow-[0_35px_120px_rgba(15,23,42,0.09)]"
          >
            <div className="pointer-events-none absolute left-[-100px] top-[-100px] h-80 w-80 rounded-full bg-fuchsia-200/30 blur-3xl" />

            <div className="pointer-events-none absolute bottom-[-120px] right-[-120px] h-96 w-96 rounded-full bg-purple-200/30 blur-3xl" />

            {!nfcConnected && (
              <div className="absolute left-1/2 top-9 z-30 -translate-x-1/2 text-center">
                <p className="animate-pulse text-xs font-black uppercase tracking-[0.25em] text-slate-400 md:text-sm">
                  Avvicina il telefono alla targhetta
                </p>
              </div>
            )}

            {/* TAG */}

            <div
              ref={tagRef}
              className={`absolute left-[10%] top-1/2 z-20 -translate-y-1/2 transition-all duration-500 md:left-[15%] ${
                nfcConnected ? "scale-110" : ""
              }`}
            >
              <div
                className={`relative flex h-48 w-48 flex-col items-center justify-center rounded-[34px] bg-gradient-to-br from-fuchsia-500 to-purple-600 text-white shadow-[0_30px_70px_rgba(217,70,239,0.3)] transition-all duration-500 ${
                  nfcConnected
                    ? "rotate-0 scale-110 shadow-[0_0_100px_rgba(217,70,239,0.65)]"
                    : "rotate-[-6deg]"
                }`}
              >
                <div className="text-5xl font-black">
                  U
                </div>

                <div className="mt-2 text-xs font-black uppercase tracking-[0.25em]">
                  UPOSTO
                </div>

                <div className="absolute bottom-5 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/70 text-xs font-black">
                  N
                </div>

                {nfcConnected && (
                  <>
                    <div className="absolute inset-[-15px] animate-ping rounded-[40px] border-2 border-fuchsia-400/60" />

                    <div className="absolute inset-[-38px] rounded-[55px] border border-fuchsia-300/30" />

                    <div className="absolute inset-[-65px] rounded-[70px] border border-purple-300/20" />
                  </>
                )}
              </div>

              <p className="mt-5 text-center text-xs font-black uppercase tracking-widest text-slate-400">
                Tag UPOSTO
              </p>
            </div>

            {/* PHONE */}

            <div
              ref={phoneRef}
              onPointerDown={handlePhonePointerDown}
              onPointerMove={handlePhonePointerMove}
              onPointerUp={handlePhonePointerUp}
              onPointerCancel={handlePhonePointerUp}
              style={{
                transform: `translate(calc(-50% + ${phonePosition.x}px), calc(-50% + ${phonePosition.y}px))`,
              }}
              className={`absolute left-[70%] top-1/2 z-30 h-[430px] w-[215px] touch-none select-none ${
                dragging
                  ? "cursor-grabbing"
                  : nfcConnected
                    ? ""
                    : "cursor-grab"
              }`}
            >
              <div
                className={`relative h-full w-full rounded-[42px] border-[7px] border-slate-950 bg-slate-950 p-2 shadow-2xl transition-all duration-300 ${
                  nfcConnected
                    ? "animate-[phoneShake_0.45s_ease-in-out_2]"
                    : "hover:scale-[1.02]"
                }`}
              >
                <div className="relative flex h-full flex-col overflow-hidden rounded-[32px] bg-white">
                  <div className="absolute left-1/2 top-2 h-6 w-24 -translate-x-1/2 rounded-full bg-slate-950" />

                  {!reviewOpened ? (
                    <div className="mt-16 px-5">
                      <div className="text-xs font-black uppercase tracking-widest text-fuchsia-500">
                        UPOSTO
                      </div>

                      <div className="mt-5">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          La Lanterna
                        </p>

                        <h3 className="mt-2 text-2xl font-black leading-tight">
                          Racconta la tua esperienza.
                        </h3>
                      </div>

                      <div className="mt-6 rounded-3xl bg-gradient-to-br from-fuchsia-50 to-purple-50 p-5">
                        <div className="text-3xl">
                          ⭐
                        </div>

                        <div className="mt-3 text-sm font-black">
                          Lascia una recensione
                        </div>

                        <div className="mt-1 text-xs leading-5 text-slate-400">
                          Il tuo feedback conta.
                        </div>
                      </div>

                      <div className="mt-5 h-11 rounded-2xl bg-gradient-to-r from-fuchsia-500 to-purple-600" />
                    </div>
                  ) : (
                    <div className="mt-16 px-5">
                      <div className="text-xs font-black uppercase tracking-widest text-fuchsia-500">
                        Google
                      </div>

                      <h3 className="mt-4 text-2xl font-black">
                        La Lanterna
                      </h3>

                      <div className="mt-4 flex gap-1 text-2xl">
                        ⭐⭐⭐⭐⭐
                      </div>

                      <div className="mt-5 rounded-3xl bg-slate-50 p-4">
                        <div className="h-3 w-3/4 rounded-full bg-slate-200" />
                        <div className="mt-3 h-3 w-full rounded-full bg-slate-200" />
                        <div className="mt-3 h-3 w-2/3 rounded-full bg-slate-200" />
                      </div>

                      <div className="mt-5 h-11 rounded-2xl bg-slate-950" />
                    </div>
                  )}
                </div>

                {nfcConnected && (
                  <div className="pointer-events-none absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2">
                    <div className="absolute inset-0 animate-ping rounded-full border-2 border-fuchsia-400" />

                    <div className="absolute inset-3 animate-pulse rounded-full border-2 border-purple-400" />
                  </div>
                )}
              </div>
            </div>

            {/* NFC NOTIFICATION */}

            {notificationVisible && (
              <button
                type="button"
                onClick={openReview}
                className="absolute right-[5%] top-[22%] z-50 w-72 animate-[notificationIn_0.6s_ease-out] rounded-3xl border border-white/80 bg-white/95 p-4 text-left shadow-[0_25px_70px_rgba(15,23,42,0.18)] backdrop-blur-xl transition hover:-translate-y-1 hover:scale-[1.02]"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-purple-600 text-lg text-white">
                    ★
                  </div>

                  <div>
                    <p className="text-xs font-black text-slate-400">
                      UPOSTO
                    </p>

                    <p className="mt-1 text-sm font-black">
                      Apri la pagina
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      Tocca per continuare.
                    </p>
                  </div>
                </div>
              </button>
            )}

            {/* SUCCESS */}

            {nfcConnected &&
              !reviewOpened &&
              !notificationVisible && (
                <div className="absolute bottom-8 left-1/2 z-40 -translate-x-1/2 text-center">
                  <p className="text-sm font-black uppercase tracking-[0.2em] text-fuchsia-500">
                    NFC rilevato
                  </p>
                </div>
              )}

            {/* REVIEW NOTIFICATIONS */}

            {reviewOpened && (
              <div className="pointer-events-none absolute inset-0 z-40">
                {reviewNotifications >= 1 && (
                  <ReviewNotification
                    className="left-[3%] top-[12%]"
                  />
                )}

                {reviewNotifications >= 2 && (
                  <ReviewNotification
                    className="right-[3%] top-[12%]"
                  />
                )}

                {reviewNotifications >= 3 && (
                  <ReviewNotification
                    className="left-[4%] top-[68%]"
                  />
                )}

                {reviewNotifications >= 4 && (
                  <ReviewNotification
                    className="right-[4%] top-[70%]"
                  />
                )}

                {reviewNotifications >= 5 && (
                  <ReviewNotification
                    className="left-[28%] top-[7%]"
                  />
                )}

                {reviewNotifications >= 6 && (
                  <ReviewNotification
                    className="right-[27%] bottom-[7%]"
                  />
                )}
              </div>
            )}
          </div>

          {/* AFTER EXPERIENCE */}

          {reviewOpened && (
            <div className="mt-10 flex flex-col items-center gap-4">
              <p className="text-center text-sm font-bold text-slate-400">
                Una semplice interazione può diventare un'esperienza
                digitale.
              </p>

              <button
                type="button"
                onClick={scrollToDashboard}
                className="animate-bounce text-sm font-black uppercase tracking-[0.2em] text-fuchsia-500"
              >
                Scopri cosa c'è dietro ↓
              </button>

              <button
                type="button"
                onClick={resetExperience}
                className="mt-3 text-xs font-bold text-slate-300 transition hover:text-slate-500"
              >
                Ripeti esperienza
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ===================================================== */}
      {/* DASHBOARD */}
      {/* ===================================================== */}

      <section
        ref={dashboardRef}
        className="relative overflow-hidden bg-slate-50 px-6 py-32"
      >
        <div className="pointer-events-none absolute left-[-200px] top-[-150px] h-[450px] w-[450px] rounded-full bg-fuchsia-200/30 blur-3xl" />

        <div className="pointer-events-none absolute bottom-[-200px] right-[-150px] h-[500px] w-[500px] rounded-full bg-purple-200/30 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="grid items-center gap-16 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.3em] text-fuchsia-500">
                E non finisce qui
              </p>

              <h2 className="mt-5 font-coolvetica text-5xl leading-none md:text-7xl">
                Tutto sotto controllo.
              </h2>

              <p className="mt-7 max-w-xl text-lg leading-8 text-slate-500">
                Dietro una semplice targhetta c'è un sistema che
                permette al proprietario di capire come viene
                utilizzato il proprio strumento.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <div className="rounded-full bg-white px-5 py-3 text-xs font-black text-slate-600 shadow-sm">
                  NFC
                </div>

                <div className="rounded-full bg-white px-5 py-3 text-xs font-black text-slate-600 shadow-sm">
                  QR
                </div>

                <div className="rounded-full bg-white px-5 py-3 text-xs font-black text-slate-600 shadow-sm">
                  Analytics
                </div>
              </div>
            </div>

            {/* DASHBOARD MOCKUP */}

            <div
              className={`transition-all duration-1000 ${
                dashboardVisible
                  ? "translate-y-0 scale-100 opacity-100"
                  : "translate-y-10 scale-95 opacity-100"
              }`}
            >
              <div className="overflow-hidden rounded-[35px] border border-slate-200 bg-white shadow-[0_35px_100px_rgba(15,23,42,0.12)]">
                {/* top bar */}

                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                  <div>
                    <p className="font-coolvetica text-2xl">
                      UPOSTO
                    </p>

                    <p className="text-xs text-slate-400">
                      La Lanterna
                    </p>
                  </div>

                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600" />
                </div>

                <div className="p-6">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <DashboardMetric
                      label="Scansioni"
                      value="184"
                    />

                    <DashboardMetric
                      label="NFC"
                      value="127"
                    />

                    <DashboardMetric
                      label="QR"
                      value="57"
                    />
                  </div>

                  <div className="mt-5 rounded-3xl border border-slate-100 bg-slate-50 p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                          Attività
                        </p>

                        <p className="mt-1 font-coolvetica text-2xl">
                          Ultimi 30 giorni
                        </p>
                      </div>

                      <div className="rounded-full bg-fuchsia-50 px-3 py-2 text-xs font-black text-fuchsia-500">
                        +24%
                      </div>
                    </div>

                    <div className="mt-8 flex h-40 items-end gap-2">
                      {[
                        25,
                        38,
                        31,
                        52,
                        44,
                        65,
                        58,
                        78,
                        63,
                        88,
                        72,
                        96,
                        82,
                        100,
                      ].map((height, index) => (
                        <div
                          key={index}
                          className="group relative flex-1"
                        >
                          <div
                            className="absolute bottom-0 left-0 right-0 rounded-t-xl bg-gradient-to-t from-fuchsia-500 to-purple-400 transition-all duration-700 group-hover:from-fuchsia-400 group-hover:to-purple-300"
                            style={{
                              height: `${height}%`,
                              animationDelay: `${index * 80}ms`,
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div className="rounded-3xl border border-slate-100 p-5">
                      <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                        Distribuzione
                      </p>

                      <div className="mt-5 flex items-center gap-5">
                        <div
                          className="h-24 w-24 rounded-full"
                          style={{
                            background:
                              "conic-gradient(#d946ef 0 69%, #a855f7 69% 100%)",
                          }}
                        >
                          <div className="m-[9px] flex h-[78px] w-[78px] items-center justify-center rounded-full bg-white">
                            <span className="font-black">
                              69%
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2 text-xs font-bold text-slate-500">
                          <p>
                            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-fuchsia-500" />
                            NFC 69%
                          </p>

                          <p>
                            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-purple-500" />
                            QR 31%
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-slate-100 p-5">
                      <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                        Attività recente
                      </p>

                      <div className="mt-5 space-y-3">
                        <ActivityItem source="NFC" />
                        <ActivityItem source="QR" />
                        <ActivityItem source="NFC" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================== */}
      {/* SERVICES */}
      {/* ===================================================== */}

      <section
        ref={servicesRef}
        className="relative px-6 py-32"
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.3em] text-fuchsia-500">
              Il mondo UPOSTO
            </p>

            <h2 className="mt-5 font-coolvetica text-5xl leading-none md:text-7xl">
              Non solo una targhetta.
            </h2>

            <p className="mt-7 text-lg leading-8 text-slate-500">
              La targhetta è il nostro punto di partenza.
              L'obiettivo è aiutare i locali a costruire una presenza
              digitale più completa.
            </p>
          </div>

          <div className="mt-20 grid gap-6 md:grid-cols-3">
            <ServiceCard
              number="01"
              title="NFC + QR"
              description="Porta il tuo locale nel digitale attraverso un gesto semplice, immediato e riconoscibile."
              active
            />

            <ServiceCard
              number="02"
              title="Dashboard"
              description="Visualizza le interazioni e scopri come viene utilizzato il tuo strumento UPOSTO."
              active
            />

            <ServiceCard
              number="03"
              title="Siti & Menù"
              description="Siti web, menù digitali e altre soluzioni costruite intorno alle esigenze del tuo locale."
              future
            />
          </div>
        </div>
      </section>

      {/* ===================================================== */}
      {/* PRICING */}
      {/* ===================================================== */}

      <section
        ref={pricingRef}
        className="relative overflow-hidden bg-white px-6 py-32"
      >
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="text-sm font-black uppercase tracking-[0.3em] text-fuchsia-500">
              Prezzi
            </p>

            <h2 className="mt-5 font-coolvetica text-5xl leading-none md:text-7xl">
              Semplice anche qui.
            </h2>

            <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-slate-500">
              Un'offerta chiara per partire senza complicazioni.
              Il prezzo viene definito in base alla soluzione e alle esigenze del locale.
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-2xl rounded-[40px] border border-fuchsia-100 bg-gradient-to-br from-fuchsia-50 via-white to-purple-50 p-8 shadow-[0_30px_100px_rgba(217,70,239,0.10)] md:p-10">
            <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-fuchsia-500">
                  UPOSTO
                </p>
                <h3 className="mt-4 font-coolvetica text-5xl">
                  Soluzione su misura
                </h3>
                <p className="mt-4 max-w-lg text-sm leading-6 text-slate-500">
                  Targhetta NFC/QR, accesso alla dashboard e servizio UPOSTO per il periodo concordato.
                </p>
              </div>

              <div className="shrink-0 rounded-3xl bg-white px-6 py-5 text-center shadow-sm">
                <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Prezzo
                </p>
                <p className="mt-1 font-coolvetica text-4xl text-slate-950">
                  Su richiesta
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={scrollToContact}
              className="mt-9 w-full rounded-2xl bg-gradient-to-r from-fuchsia-500 to-purple-600 px-6 py-4 text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-fuchsia-300/30 transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              Parliamone →
            </button>
          </div>
        </div>
      </section>

      {/* ===================================================== */}
      {/* CONTACT */}
      {/* ===================================================== */}

      <section
        ref={contactRef}
        className="relative overflow-hidden bg-slate-50 px-6 py-32"
      >
        <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-fuchsia-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-purple-200/40 blur-3xl" />

        <div className="relative mx-auto max-w-5xl text-center">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-fuchsia-500">
            Contatti
          </p>

          <h2 className="mt-5 font-coolvetica text-5xl leading-none md:text-7xl">
            Hai un locale? Parliamone.
          </h2>

          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-slate-500">
            Raccontaci cosa vorresti migliorare e vediamo insieme quale soluzione UPOSTO può avere senso per te.
          </p>

          <div className="mx-auto mt-12 grid max-w-3xl gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-white bg-white p-7 text-left shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                Email
              </p>
              <p className="mt-3 text-sm font-bold text-slate-700">
                Inserisci qui la tua email UPOSTO
              </p>
              <p className="mt-2 text-xs leading-5 text-slate-400">
                Sostituisci questo testo con l'indirizzo reale prima della pubblicazione.
              </p>
            </div>

            <div className="rounded-3xl border border-white bg-white p-7 text-left shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                Social / WhatsApp
              </p>
              <p className="mt-3 text-sm font-bold text-slate-700">
                Aggiungi qui i tuoi canali
              </p>
              <p className="mt-2 text-xs leading-5 text-slate-400">
                Meglio inserire solo contatti che controlli davvero e che vuoi usare per i clienti.
              </p>
            </div>
          </div>

          <p className="mt-8 text-xs text-slate-400">
            I dati aziendali, l'indirizzo e gli altri riferimenti legali vanno inseriti nel footer prima della pubblicazione.
          </p>
        </div>
      </section>

      {/* ===================================================== */}
      {/* VISION */}
      {/* ===================================================== */}

      <section className="relative overflow-hidden bg-slate-950 px-6 py-36 text-white">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-fuchsia-600/20 blur-3xl" />

        <div className="relative mx-auto max-w-5xl text-center">
          <p className="text-sm font-black uppercase tracking-[0.35em] text-fuchsia-400">
            Questo è solo l'inizio
          </p>

          <h2 className="mt-7 font-coolvetica text-6xl leading-[0.9] md:text-9xl">
            Il digitale
            <br />
            <span className="text-fuchsia-400">
              a posto.
            </span>
          </h2>

          <p className="mx-auto mt-10 max-w-2xl text-lg leading-8 text-white/50">
            Partiamo da un piccolo strumento e costruiamo,
            passo dopo passo, qualcosa di più grande.
          </p>

          <div className="mt-14 flex flex-wrap justify-center gap-3">
            <span className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-xs font-black text-white/60">
              Tecnologia
            </span>

            <span className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-xs font-black text-white/60">
              Design
            </span>

            <span className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-xs font-black text-white/60">
              Web
            </span>

            <span className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-xs font-black text-white/60">
              Automazione
            </span>
          </div>
        </div>
      </section>

      {/* ===================================================== */}
      {/* FINAL CTA */}
      {/* ===================================================== */}

      <section className="relative overflow-hidden px-6 py-36">
        <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500 to-purple-700" />

        <div className="relative mx-auto max-w-5xl text-center text-white">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-white/70">
            UPOSTO
          </p>

          <h2 className="mt-7 font-coolvetica text-6xl leading-[0.9] md:text-9xl">
            Il tuo locale.
            <br />
            A posto.
          </h2>

          <p className="mx-auto mt-9 max-w-2xl text-lg leading-8 text-white/80">
            Se il tuo locale ha bisogno di un posto nel digitale,
            cominciamo da qui.
          </p>

          <button
            type="button"
            onClick={handleStart}
            className="mt-11 rounded-full bg-white px-10 py-5 text-sm font-black uppercase tracking-[0.12em] text-fuchsia-600 shadow-2xl transition duration-300 hover:-translate-y-1 hover:scale-105"
          >
            Metti il tuo locale a posto →
          </button>
        </div>
      </section>

      {/* ===================================================== */}
      {/* FOOTER */}
      {/* ===================================================== */}

      <footer className="bg-slate-950 px-6 py-14 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="font-coolvetica text-3xl">UPOSTO</div>
              <p className="mt-1 text-sm text-white/30">Il tuo locale. A posto.</p>
              <p className="mt-5 max-w-sm text-xs leading-5 text-white/35">
                UPOSTO — strumenti digitali per locali e attività.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-xs font-black uppercase tracking-wider text-white/45">
              <button type="button" onClick={scrollToServices} className="text-left transition hover:text-white">Servizi</button>
              <button type="button" onClick={scrollToPricing} className="text-left transition hover:text-white">Prezzi</button>
              <button type="button" onClick={scrollToContact} className="text-left transition hover:text-white">Contatti</button>
              <a href="/privacy" className="transition hover:text-white">Privacy</a>
              <a href="/termini" className="transition hover:text-white">Termini</a>
            </div>
          </div>

          <div className="mt-10 border-t border-white/10 pt-6 text-xs leading-5 text-white/30">
            <p>
              Inserisci qui, prima della pubblicazione, denominazione/titolare, sede, email e gli eventuali dati fiscali richiesti per la tua attività.
            </p>
            <p className="mt-2">© {new Date().getFullYear()} UPOSTO. Tutti i diritti riservati.</p>
          </div>
        </div>
      </footer>

      {/* ===================================================== */}
      {/* ANIMATIONS */}
      {/* ===================================================== */}

      <style jsx global>{`
        @keyframes phoneShake {
          0% {
            transform: rotate(0deg);
          }

          15% {
            transform: rotate(-4deg) translateX(-3px);
          }

          30% {
            transform: rotate(4deg) translateX(3px);
          }

          45% {
            transform: rotate(-3deg) translateX(-2px);
          }

          60% {
            transform: rotate(3deg) translateX(2px);
          }

          75% {
            transform: rotate(-1deg);
          }

          100% {
            transform: rotate(0deg);
          }
        }

        @keyframes notificationIn {
          0% {
            opacity: 0;
            transform: translateY(30px) scale(0.85);
          }

          70% {
            transform: translateY(-4px) scale(1.02);
          }

          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes reviewNotification {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.9);
          }

          70% {
            transform: translateY(-3px) scale(1.02);
          }

          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </main>
  );
}

function ReviewNotification({
  className,
}: {
  className: string;
}) {
  return (
    <div
      className={`absolute ${className} w-56 animate-[reviewNotification_0.5s_ease-out] rounded-2xl border border-white/70 bg-white/95 p-3 shadow-xl backdrop-blur-xl`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-purple-600 text-sm text-white">
          ★
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-fuchsia-500">
            UPOSTO
          </p>

          <p className="mt-1 text-xs font-black text-slate-800">
            Nuova recensione ricevuta
          </p>

          <p className="mt-1 text-[10px] text-slate-400">
            Adesso
          </p>
        </div>
      </div>
    </div>
  );
}

function DashboardMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
      <p className="text-xs font-black uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-3 font-coolvetica text-4xl text-slate-950">
        {value}
      </p>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-fuchsia-500 to-purple-500" />
      </div>
    </div>
  );
}

function ActivityItem({
  source,
}: {
  source: "NFC" | "QR";
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-fuchsia-50 text-xs font-black text-fuchsia-500">
          {source === "NFC" ? "N" : "Q"}
        </div>

        <div>
          <p className="text-xs font-black text-slate-700">
            Scansione {source}
          </p>

          <p className="text-[10px] text-slate-400">
            La Lanterna
          </p>
        </div>
      </div>

      <span className="text-[10px] font-bold text-slate-300">
        Adesso
      </span>
    </div>
  );
}

function ServiceCard({
  number,
  title,
  description,
  future = false,
  active = false,
}: {
  number: string;
  title: string;
  description: string;
  future?: boolean;
  active?: boolean;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[35px] border border-slate-100 bg-white p-9 shadow-[0_20px_60px_rgba(15,23,42,0.06)] transition duration-500 hover:-translate-y-3 hover:shadow-[0_35px_90px_rgba(217,70,239,0.15)]">
      <div className="absolute right-[-70px] top-[-70px] h-52 w-52 rounded-full bg-fuchsia-100 opacity-0 blur-3xl transition duration-500 group-hover:opacity-100" />

      <div className="relative">
        <div className="font-mono text-sm font-black text-fuchsia-500">
          {number}
        </div>

        <h3 className="mt-9 font-coolvetica text-4xl">
          {title}
        </h3>

        <p className="mt-5 leading-7 text-slate-500">
          {description}
        </p>

        {active && (
          <div className="mt-7 inline-flex rounded-full bg-fuchsia-50 px-4 py-2 text-xs font-black uppercase tracking-wider text-fuchsia-500">
            Disponibile
          </div>
        )}

        {future && (
          <div className="mt-7 inline-flex rounded-full bg-slate-100 px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-500">
            In evoluzione
          </div>
        )}
      </div>
    </div>
  );
}