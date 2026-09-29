import Link from 'next/link';
import {
  GraduationCap,
  Brain,
  Waves,
  Sparkles,
  Flame,
  CheckCircle2,
} from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2 bg-background">
      {/* Left Column: Visual Showcase (Visible on lg screens) */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-card via-card to-primary/10 border-r overflow-hidden select-none">
        {/* Ambient Gradient Glow Orbs */}
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-indigo-500/15 blur-3xl" />

        {/* Brand Header */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="p-2 rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/30 group-hover:scale-105 transition-transform">
              <GraduationCap className="h-6 w-6" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-foreground">
              StudyForge
            </span>
          </Link>
        </div>

        {/* Center Hero Content & Feature Highlights */}
        <div className="relative z-10 space-y-8 my-auto max-w-lg">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="h-3.5 w-3.5" />
              The Modern Academic Operating System
            </span>
            <h2 className="text-3xl xl:text-4xl font-black tracking-tight text-foreground leading-tight">
              Master complex topics. Retain knowledge forever.
            </h2>
            <p className="text-muted-foreground text-sm xl:text-base leading-relaxed">
              An intelligent, all-in-one study platform engineered with active recall algorithms, procedural soundscapes, and AI synthesis.
            </p>
          </div>

          {/* Feature Showcase Pills */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-card/70 border backdrop-blur shadow-sm">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 shrink-0">
                <Brain className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">
                  SuperMemo SM-2 Spaced Repetition
                </p>
                <p className="text-xs text-muted-foreground">
                  Adaptive review intervals based on cognitive recall accuracy.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-card/70 border backdrop-blur shadow-sm">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500 shrink-0">
                <Waves className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">
                  Web Audio Procedural Soundscapes
                </p>
                <p className="text-xs text-muted-foreground">
                  In-browser synthesized rain, ocean waves, and 40Hz focus binaural beats.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-card/70 border backdrop-blur shadow-sm">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
                <Flame className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">
                  365-Day Study Activity Heatmap
                </p>
                <p className="text-xs text-muted-foreground">
                  GitHub-style productivity tracking and active streak algorithms.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center justify-between text-xs text-muted-foreground border-t pt-6">
          <p>© {new Date().getFullYear()} StudyForge. Built by Md Rizwan Molla.</p>
          <div className="flex items-center gap-1.5 text-emerald-500 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>100% Free & Open Architecture</span>
          </div>
        </div>
      </div>

      {/* Right Column: Auth Form */}
      <div className="flex flex-col justify-between p-6 sm:p-12 relative">
        {/* Mobile Logo Header */}
        <div className="flex lg:hidden items-center justify-between pb-6">
          <Link href="/" className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">StudyForge</span>
          </Link>
        </div>

        <div className="my-auto w-full max-w-md mx-auto">
          {children}
        </div>

        <div className="text-center text-xs text-muted-foreground pt-6">
          Need help? Return to <Link href="/" className="text-primary hover:underline font-medium">Homepage</Link>
        </div>
      </div>
    </div>
  );
}
