const steps = [
  {
    n: "01",
    title: "Deposit USDC",
    desc: "Connect your Freighter wallet and deposit USDC into the NeuroWealth vault.",
  },
  {
    n: "02",
    title: "AI Deploys Funds",
    desc: "The agent detects your deposit and immediately deploys to the best protocol.",
  },
  {
    n: "03",
    title: "Yield Accumulates",
    desc: "Earnings compound 24/7. The agent rebalances hourly if better rates appear.",
  },
  {
    n: "04",
    title: "Withdraw Anytime",
    desc: "Request a withdrawal — funds arrive in your wallet within seconds.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-gray-900/40 py-24">
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="mb-14 text-center">
          <span className="inline-block rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
            How it works
          </span>
          {/* Spec: 30px heading */}
          <h2 className="mt-4 text-3xl font-bold text-slate-50">
            Four steps to passive yield
          </h2>
          <p className="mt-3 text-base text-slate-400">
            Get started in minutes, earn around the clock.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-4">
          {steps.map((s, i) => (
            <div key={s.n} className="relative flex flex-col gap-4">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="absolute left-10 top-10 hidden h-px w-full bg-linear-to-r from-sky-500/40 to-transparent md:block" />
              )}

              {/* Step badge — spec primary sky-500 */}
              <div className="flex h-[52px] w-[52px] items-center justify-center rounded-lg border border-sky-500/30 bg-sky-500/10 font-mono text-lg font-bold text-sky-400">
                {s.n}
              </div>

              <div>
                <h3 className="font-semibold text-slate-50">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
