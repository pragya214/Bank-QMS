import { Link } from "react-router-dom";
import {
  ArrowRight,
  BellRing,
  CheckCircle2,
  Clock3,
  Landmark,
  Search,
  ShieldCheck,
  Smartphone,
  Ticket,
  Users,
} from "lucide-react";
import CustomerHeader from "./CustomerHeader";

function CustomerLandingPage() {
  return (
    <>
      <CustomerHeader />

      <main className="min-h-[calc(100vh-80px)] bg-[#F4F6FA] px-4 py-5 md:px-8 md:py-8">
        <section className="relative mx-auto max-w-7xl overflow-hidden rounded-[36px] bg-[#0B1736] shadow-[0_30px_100px_rgba(11,23,54,0.28)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(87,119,178,0.45),transparent_32%),radial-gradient(circle_at_85%_15%,rgba(230,199,144,0.22),transparent_28%),radial-gradient(circle_at_70%_90%,rgba(255,255,255,0.12),transparent_30%)]" />
          <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:42px_42px]" />

          <div className="relative grid items-center gap-8 px-5 py-10 md:px-10 md:py-14 lg:grid-cols-[1.02fr_0.98fr]">
            <div className="text-white">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold text-white/90 backdrop-blur-xl">
                <ShieldCheck size={16} className="text-[#E6C790]" />
                Secure Bank Queue Experience
              </div>

              <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.05] tracking-tight md:text-6xl">
                Get Your Token.
                <span className="block text-[#E6C790]">
                  Track Your Turn Live.
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/70 md:text-lg">
                No crowd. No confusion. Generate your bank token from your
                phone and get live updates before your turn arrives.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/customer/join-queue"
                  className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 text-base font-black text-[#0B1736] shadow-xl shadow-black/20 transition hover:-translate-y-1 hover:shadow-2xl"
                >
                  Join Queue Now
                  <ArrowRight
                    size={18}
                    className="transition group-hover:translate-x-1"
                  />
                </Link>

                <Link
                  to="/customer/token-status"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-6 py-4 text-base font-black text-white backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/15"
                >
                  <Search size={18} />
                  Track Existing Token
                </Link>
              </div>

              <div className="mt-9 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-3xl border border-white/12 bg-white/10 p-4 backdrop-blur-xl">
                  <p className="text-3xl font-black text-white">30s</p>
                  <p className="mt-1 text-sm text-white/60">
                    Token generation
                  </p>
                </div>

                <div className="rounded-3xl border border-white/12 bg-white/10 p-4 backdrop-blur-xl">
                  <p className="text-3xl font-black text-white">Live</p>
                  <p className="mt-1 text-sm text-white/60">Queue tracking</p>
                </div>

                <div className="rounded-3xl border border-white/12 bg-white/10 p-4 backdrop-blur-xl">
                  <p className="text-3xl font-black text-white">Smart</p>
                  <p className="mt-1 text-sm text-white/60">Turn alerts</p>
                </div>
              </div>
            </div>

            <div className="relative min-h-[520px]">
              <div className="absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#5777B2]/30 blur-3xl" />

              <div className="absolute left-1/2 top-8 w-[86%] max-w-[420px] -translate-x-1/2 rounded-[36px] border border-white/15 bg-white p-5 text-[#0B1736] shadow-[0_30px_90px_rgba(0,0,0,0.32)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#5777B2] text-white">
                      <Landmark />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-400">
                        Main Branch
                      </p>
                      <p className="font-black">Bank Queue Live</p>
                    </div>
                  </div>

                  <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-700">
                    ACTIVE
                  </span>
                </div>

                <div className="mt-6 rounded-[28px] bg-gradient-to-br from-[#11274D] to-[#5777B2] p-6 text-center text-white">
                  <p className="text-sm font-bold text-white/60">
                    Now Serving
                  </p>
                  <p className="mt-2 text-7xl font-black tracking-tight">
                    A-21
                  </p>
                  <p className="mt-2 text-sm text-white/70">
                    Counter 03 • Cash Deposit
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="rounded-2xl bg-slate-50 p-3 text-center">
                    <Users className="mx-auto text-[#5777B2]" size={20} />
                    <p className="mt-2 text-xs text-slate-400">Ahead</p>
                    <p className="text-xl font-black">02</p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-3 text-center">
                    <Clock3 className="mx-auto text-[#5777B2]" size={20} />
                    <p className="mt-2 text-xs text-slate-400">Wait</p>
                    <p className="text-xl font-black">8m</p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-3 text-center">
                    <BellRing className="mx-auto text-[#5777B2]" size={20} />
                    <p className="mt-2 text-xs text-slate-400">Alert</p>
                    <p className="text-xl font-black">ON</p>
                  </div>
                </div>
              </div>

              <div className="absolute left-0 top-28 hidden rounded-[28px] border border-slate-200 bg-white p-4 text-[#0B1736] shadow-[0_20px_60px_rgba(0,0,0,0.22)] md:block">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-50 text-green-600">
                    <CheckCircle2 />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400">
                      Token Created
                    </p>
                    <p className="text-xl font-black">A-23</p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-12 right-0 hidden rounded-[28px] border border-slate-200 bg-white p-4 text-[#0B1736] shadow-[0_20px_60px_rgba(0,0,0,0.22)] md:block">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <Smartphone />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400">
                      Mobile Tracking
                    </p>
                    <p className="text-xl font-black">Live Status</p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-6 left-1/2 w-[78%] max-w-[360px] -translate-x-1/2 rounded-[30px] border border-white/15 bg-white/10 p-4 text-white backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E6C790] text-[#0B1736]">
                    <Ticket />
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Your next token</p>
                    <p className="text-2xl font-black">A-23 is coming soon</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-6 grid max-w-7xl gap-4 md:grid-cols-3">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_15px_45px_rgba(17,39,77,0.08)]">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#5777B2]">
              <Landmark />
            </div>
            <h3 className="mt-4 text-xl font-black text-slate-900">
              Choose Branch
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Select your bank branch and service in a simple mobile-friendly
              form.
            </p>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_15px_45px_rgba(17,39,77,0.08)]">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-600">
              <Ticket />
            </div>
            <h3 className="mt-4 text-xl font-black text-slate-900">
              Get Token
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Generate your queue token instantly with your mobile number.
            </p>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_15px_45px_rgba(17,39,77,0.08)]">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <BellRing />
            </div>
            <h3 className="mt-4 text-xl font-black text-slate-900">
              Get Alerts
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Receive visual alerts when your token is near or currently being
              served.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}

export default CustomerLandingPage;


