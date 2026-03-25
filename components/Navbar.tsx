import Link from "next/link";
import { WalletConnect } from "./WalletConnect";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-dark-900/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-white">
          <span className="text-brand-400">&#x2B21;</span> NeuroWealth
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm text-slate-400">
          <Link href="#features" className="hover:text-white transition-colors">
            Features
          </Link>
          <Link href="#how-it-works" className="hover:text-white transition-colors">
            How it works
          </Link>
          <Link href="#strategies" className="hover:text-white transition-colors">
            Strategies
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <WalletConnect />
        </div>
      </div>
    </nav>
  );
}
