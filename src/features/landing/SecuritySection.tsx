import { ReactNode } from "react";
import { Card } from "@/components/ui/Card";

interface SecurityFeature {
  icon: ReactNode;
  title: string;
  stat: string;
  statLabel: string;
  desc: string;
}

const features: SecurityFeature[] = [
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
    title: "Non-Custodial",
    stat: "100%",
    statLabel: "Your keys, your coins",
    desc: "Your USDC stays in audited Soroban smart contracts that only you can authorize. We never hold or access your private keys.",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <polyline points="9 15 11 17 15 13" />
      </svg>
    ),
    title: "Audited Contracts",
    stat: "0",
    statLabel: "Security incidents",
    desc: "All smart contracts undergo rigorous third-party security audits before mainnet deployment. Source code is publicly verifiable on-chain.",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    title: "Open Source",
    stat: "100%",
    statLabel: "Transparent code",
    desc: "Every line of code is open source and community-reviewed. No black boxes — verify exactly what the protocol does with your funds.",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    title: "Stellar Network",
    stat: "10+",
    statLabel: "Years of proven uptime",
    desc: "Built on Stellar's battle-tested blockchain with a decade of proven reliability, instant finality (~5s), and sub-cent transaction fees.",
  },
];

export function SecuritySection() {
  return (
    <section id="security" className="mx-auto max-w-6xl px-6 py-24">
      {/* Header */}
      <div className="mb-14 text-center">
        <span className="inline-block rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-400">
          Security
        </span>
        <h2 className="mt-4 text-3xl font-bold text-slate-50">
          Built to be trusted
        </h2>
        <p className="mt-3 text-base text-slate-400">
          Security is not an afterthought — it is the foundation.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {features.map((f) => (
          <Card key={f.title} className="flex gap-5">
            {/* Icon */}
            <div className="shrink-0 flex h-12 w-12 items-center justify-center rounded-lg border border-sky-500/30 bg-sky-500/10 text-sky-400">
              {f.icon}
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-baseline gap-3">
                <h3 className="font-semibold text-slate-50">{f.title}</h3>
                <span className="font-mono text-xs text-emerald-400">
                  {f.stat} &middot; {f.statLabel}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-slate-400">{f.desc}</p>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
