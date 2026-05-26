import { lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { DelayedSuspenseFallback } from "../../lib/loadingUtils";
import {
  ShieldAlert,
  Clock,
  Store,
  CheckCircle2,
  ArrowRight,
  Mail,
  MapPin,
  Calendar,
  Lock,
  Loader2,
  HelpCircle,
  Activity,
  FileCheck
} from "lucide-react";


const SellerOverview = lazy(() => import("./seller/SellerOverview"));
const SellerProducts = lazy(() => import("./seller/SellerProducts"));
const SellerOrders   = lazy(() => import("./seller/SellerOrders"));
const SellerAnalytics = lazy(() => import("./seller/SellerAnalytics"));
const SellerSettings = lazy(() => import("./seller/SellerSettings"));

const pageTransition = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
  exit: { opacity: 0, y: -15, transition: { duration: 0.25 } }
};

export default function SellerDashboard({ view = "overview" }) {
  const { user } = useSelector((state) => state.auth);


  if (user?.role === "seller" && !user?.isVendorApproved) {
    const registryHash = user?._id
      ? `VH-${user._id.substring(0, 8).toUpperCase()}-${(user.createdAt || "2026-05-21").substring(0, 10)}`
      : "VH-CORE-UNSECURED";

    const formattedDate = user?.createdAt
      ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
      : "Under Review";

    return (
      <div className="container mx-auto px-4 md:px-6 py-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-10"
        >

          <div className="relative overflow-hidden rounded-[2rem] border border-[#e1dcc9]/10 bg-gradient-to-r from-[#1f150c]/40 via-[#0c0804]/50 to-[#000000]/60 p-8 sm:p-10 shadow-[0_24px_60px_rgba(0,0,0,0.8)] backdrop-blur-xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#412d15]/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-[#e1dcc9]/2 rounded-full blur-[90px] pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3.5 max-w-2xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#e1dcc9]/12 bg-[#412d15]/25 px-3 py-1 text-[9px] uppercase tracking-[0.25em] text-[#e1dcc9]/85 font-semibold">
                  <Activity className="w-3 h-3 text-[#e1dcc9] animate-pulse" />
                  Pending Approval
                </span>
                <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white font-oswald leading-none">
                  Seller Activation <span className="gradient-text">Pending</span>
                </h1>
                <p className="text-sm leading-relaxed text-[#e1dcc9]/60 font-light">
                  Your seller profile is being reviewed by our admin team. This usually takes 12–24 hours.
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-3 bg-black/60 border border-[#412d15]/60 rounded-2xl p-4 shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)]">
                <div className="w-12 h-12 rounded-xl bg-[#412d15]/40 flex items-center justify-center border border-[#e1dcc9]/10">
                  <Clock className="w-6 h-6 text-[#e1dcc9] animate-[spin_10s_linear_infinite]" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[#e1dcc9]/50">Review Time</p>
                  <p className="text-sm font-bold text-white font-oswald tracking-[0.05em]">12–24 HOURS</p>
                </div>
              </div>
            </div>
          </div>


          <div className="space-y-6">
            <h2 className="text-xs uppercase tracking-[0.3em] font-black text-[#e1dcc9]/70 font-oswald">
              Activation Steps
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">

              <div className="relative rounded-2xl border border-emerald-500/20 bg-gradient-to-b from-[#111810]/40 to-[#070b06]/65 p-6 shadow-md backdrop-blur-md">
                <div className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="space-y-3 mt-4">
                  <span className="text-[9px] uppercase tracking-[0.2em] text-emerald-400/80 font-bold font-mono">Step 01 / Done</span>
                  <h3 className="text-base font-bold uppercase tracking-wide text-white font-oswald">Profile Created</h3>
                  <p className="text-xs text-[#e1dcc9]/50 leading-relaxed font-light">
                    Your store details and account credentials have been saved to the platform.
                  </p>
                </div>
              </div>


              <div className="relative rounded-2xl border border-[#e1dcc9]/20 bg-gradient-to-b from-[#1f150c]/30 to-[#0f0b07]/50 p-6 shadow-md backdrop-blur-md ring-1 ring-[#e1dcc9]/5">
                <div className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 rounded-full bg-[#412d15]/40 text-[#e1dcc9] border border-[#e1dcc9]/15 animate-pulse shadow-[0_0_15px_rgba(225,220,201,0.15)]">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="space-y-3 mt-4">
                  <span className="text-[9px] uppercase tracking-[0.2em] text-[#e1dcc9]/80 font-bold font-mono animate-pulse">Step 02 / In Review</span>
                  <h3 className="text-base font-bold uppercase tracking-wide text-white font-oswald">Admin Review</h3>
                  <p className="text-xs text-[#e1dcc9]/50 leading-relaxed font-light">
                    Our admin team is reviewing your profile and verifying your store details.
                  </p>
                </div>
              </div>


              <div className="relative rounded-2xl border border-[#412d15]/50 bg-black/45 p-6 shadow-sm opacity-60">
                <div className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 rounded-full bg-black/55 text-[#e1dcc9]/25 border border-[#412d15]/40">
                  <Lock className="w-4 h-4" />
                </div>
                <div className="space-y-3 mt-4">
                  <span className="text-[9px] uppercase tracking-[0.2em] text-[#e1dcc9]/30 font-bold font-mono">Step 03 / Locked</span>
                  <h3 className="text-base font-bold uppercase tracking-wide text-[#e1dcc9]/40 font-oswald">Store Goes Live</h3>
                  <p className="text-xs text-[#e1dcc9]/30 leading-relaxed font-light">
                    Once approved, your store dashboard, products, orders, and analytics will all be unlocked.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            <div className="lg:col-span-5 space-y-6">
              <h2 className="text-xs uppercase tracking-[0.3em] font-black text-[#e1dcc9]/70 font-oswald">
              Your Store Details
            </h2>
              <div className="relative overflow-hidden rounded-[2rem] border border-[#e1dcc9]/10 bg-gradient-to-br from-[#1b120a]/60 via-black to-[#130d07]/50 p-7 shadow-2xl backdrop-blur-2xl group">

                <div
                  className="absolute -inset-y-12 -left-36 w-24 bg-gradient-to-r from-transparent via-[#e1dcc9]/3 to-transparent -skew-x-12 group-hover:translate-x-[40rem] transition-transform ease-out pointer-events-none"
                  style={{ transitionDuration: "2200ms" }}
                />

                <div className="flex justify-between items-start mb-10">
                  <div className="space-y-1">
                    <p className="text-[8px] uppercase tracking-[0.25em] text-[#e1dcc9]/40 font-mono">Store Name</p>
                    <h3 className="text-lg font-black uppercase text-white font-oswald tracking-[0.05em] truncate max-w-[200px]">
                      {user?.storeName || "Unnamed Account"}
                    </h3>
                  </div>
                </div>

                <div className="space-y-4">

                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-[#e1dcc9]/45 shrink-0" />
                    <div>
                      <p className="text-[8px] uppercase tracking-wider text-[#e1dcc9]/35">Location</p>
                      <p className="text-xs font-medium text-white truncate max-w-[250px]">
                        {user?.vendorLocation || "Not specified"}
                      </p>
                    </div>
                  </div>


                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-[#e1dcc9]/45 shrink-0" />
                    <div>
                      <p className="text-[8px] uppercase tracking-wider text-[#e1dcc9]/35">Email</p>
                      <p className="text-xs font-medium text-white truncate max-w-[250px]">
                        {user?.email || "N/A"}
                      </p>
                    </div>
                  </div>


                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-[#e1dcc9]/45 shrink-0" />
                    <div>
                      <p className="text-[8px] uppercase tracking-wider text-[#e1dcc9]/35">Member Since</p>
                      <p className="text-xs font-medium text-white">
                        {formattedDate}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#412d15]/50 mt-8 pt-6 flex justify-between items-center text-[9px] font-mono">
                  <div className="text-[#e1dcc9]/30">
                    <p className="uppercase tracking-wider">Account ID</p>
                    <p className="text-[#e1dcc9]/50 tracking-tight mt-0.5">{registryHash}</p>
                  </div>
                  <div className="shrink-0 flex items-center justify-center w-7 h-7 rounded bg-[#412d15]/20 border border-[#e1dcc9]/10">
                    <Store className="w-3.5 h-3.5 text-[#e1dcc9]/70" />
                  </div>
                </div>
              </div>
            </div>


            <div className="lg:col-span-7 space-y-6">
              <h2 className="text-xs uppercase tracking-[0.3em] font-black text-[#e1dcc9]/70 font-oswald">
              Common Questions
            </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-[#412d15]/60 bg-black/35 p-5 space-y-2">
                  <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider font-oswald">
                    <HelpCircle className="w-4 h-4 text-[#e1dcc9]/75 shrink-0" />
                    Why are reviews required?
                  </div>
                  <p className="text-[11px] text-[#e1dcc9]/50 leading-relaxed font-light">
                    We review every seller before they go live to ensure quality products and a safe shopping experience for buyers.
                  </p>
                </div>

                <div className="rounded-2xl border border-[#412d15]/60 bg-black/35 p-5 space-y-2">
                  <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider font-oswald">
                    <FileCheck className="w-4 h-4 text-[#e1dcc9]/75 shrink-0" />
                    Listing Guidelines
                  </div>
                  <p className="text-[11px] text-[#e1dcc9]/50 leading-relaxed font-light">
                    List genuine, well-described products with clear, high-quality photos. Avoid misleading details or low-quality images.
                  </p>
                </div>

                <div className="rounded-2xl border border-[#412d15]/60 bg-black/35 p-5 space-y-2">
                  <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider font-oswald">
                    <Clock className="w-4 h-4 text-[#e1dcc9]/75 shrink-0" />
                    SLA Verification Windows
                  </div>
                  <p className="text-[11px] text-[#e1dcc9]/50 leading-relaxed font-light">
                    Most reviews are done within 12–24 hours. You'll get an email once your account is approved.
                  </p>
                </div>

                <div className="rounded-2xl border border-[#412d15]/60 bg-black/35 p-5 space-y-2">
                  <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider font-oswald">
                    <Mail className="w-4 h-4 text-[#e1dcc9]/75 shrink-0" />
                    Gateway Support
                  </div>
                  <p className="text-[11px] text-[#e1dcc9]/50 leading-relaxed font-light">
                    Have questions? Email us at{" "}
                    <a href="mailto:support@vendorhub.com" className="text-white hover:underline font-semibold">support@vendorhub.com</a>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const renderView = () => {
    switch (view) {
      case "overview":
        return <SellerOverview />;
      case "products":
        return <SellerProducts />;
      case "orders":
        return <SellerOrders />;
      case "analytics":
        return <SellerAnalytics />;
      case "settings":
        return <SellerSettings />;
      default:
        return <SellerOverview />;
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-6 max-w-7xl">
      <Suspense
        fallback={
          <DelayedSuspenseFallback text="Loading..." fullScreen={false} />
        }
      >
        <motion.div
          key={view}
          variants={pageTransition}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {renderView()}
        </motion.div>
      </Suspense>
    </div>
  );
}
