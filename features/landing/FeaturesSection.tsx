import { Card } from "@/components/ui/Card";

const features = [
  {
    icon: "🤖",
    title: "AI Agent",
    desc: "Autonomous 24/7 yield optimization across Stellar DeFi protocols.",
    accent: "text-sky-400",
    bg: "bg-sky-500/10",
  },
  {
    icon: "💬",
    title: "Natural Language",
    desc: "Chat to deposit, withdraw, and check balances — no DeFi knowledge needed.",
    accent: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    icon: "📈",
    title: "Auto-Rebalancing",
    desc: "The agent shifts funds to the best opportunities automatically, hourly.",
    accent: "text-sky-400",
    bg: "bg-sky-500/10",
  },
  {
    icon: "🔐",
    title: "Non-Custodial",
    desc: "Your funds live in audited Soroban smart contracts. Always yours.",
    accent: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    icon: "⚡",
    title: "Instant Withdrawals",
    desc: "No lock-ups, no penalties. Withdraw anytime in seconds.",
    accent: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    icon: "🌍",
    title: "Global Access",
    desc: "No geographic restrictions, no bank account required.",
    accent: "text-sky-400",
    bg: "bg-sky-500/10",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-24">
      {/* Section header */}
      <div className="mb-14 text-center">
        <span className="inline-block rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-400">
          Features
        </span>
        {/* Spec: 30px heading */}
        <h2 className="mt-4 text-3xl font-bold text-slate-50">
          Everything you need
        </h2>
        <p className="mt-3 text-base text-slate-400">
          Simple on the surface, powerful underneath.
        </p>
      </div>

      {/* Spec: Card — border #1F2937 (gray-800), shadow, radius 12px */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <Card key={f.title} className="flex flex-col gap-4">
            {/* Icon badge */}
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-lg text-xl ${f.bg}`}
            >
              {f.icon}
            </div>
            <div>
              <h3 className={`font-semibold ${f.accent}`}>{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
                {f.desc}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
