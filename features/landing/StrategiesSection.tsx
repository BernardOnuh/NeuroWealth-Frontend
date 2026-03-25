import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const strategies = [
  {
    name: "Conservative",
    apy: "3–6%",
    risk: "Low",
    desc: "Stablecoin lending on Blend. Steady, predictable returns with minimal exposure.",
    accentText: "text-sky-400",
    border: "border-sky-500/20",
    btnVariant: "secondary" as const,
  },
  {
    name: "Balanced",
    apy: "6–10%",
    risk: "Medium",
    desc: "Mix of lending and DEX liquidity provision for better yield without excessive risk.",
    accentText: "text-emerald-400",
    border: "border-emerald-500/30",
    btnVariant: "primary" as const,
    featured: true,
  },
  {
    name: "Growth",
    apy: "10–15%",
    risk: "Higher",
    desc: "Aggressive multi-protocol deployment for maximum returns.",
    accentText: "text-amber-400",
    border: "border-amber-500/20",
    btnVariant: "secondary" as const,
  },
];

export function StrategiesSection() {
  return (
    <section id="strategies" className="mx-auto max-w-6xl px-6 py-24">
      {/* Header */}
      <div className="mb-14 text-center">
        <span className="inline-block rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
          Strategies
        </span>
        <h2 className="mt-4 text-3xl font-bold text-slate-50">
          Choose your strategy
        </h2>
        <p className="mt-3 text-base text-slate-400">
          Pick your risk appetite. The AI handles the rest.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 md:items-start">
        {strategies.map((s) => (
          <Card
            key={s.name}
            glow={s.featured}
            className={`flex flex-col gap-5 border ${s.border} ${
              s.featured ? "md:-mt-3 md:pb-9 md:pt-9" : ""
            }`}
          >
            {s.featured && (
              <span className="self-start rounded-full bg-emerald-500/20 px-3 py-0.5 text-xs font-medium text-emerald-400">
                Most popular
              </span>
            )}

            <div>
              <h3 className={`text-xl font-bold ${s.accentText}`}>{s.name}</h3>
              {/* Spec: font-mono for numeric APY */}
              <p className="mt-1 font-mono text-3xl font-bold text-slate-50">
                {s.apy}
              </p>
              <p className="text-xs text-slate-500">APY &middot; {s.risk} risk</p>
            </div>

            <p className="flex-1 text-sm leading-relaxed text-slate-400">
              {s.desc}
            </p>

            <Button variant={s.btnVariant} className="w-full">
              Select {s.name}
            </Button>
          </Card>
        ))}
      </div>
    </section>
  );
}
