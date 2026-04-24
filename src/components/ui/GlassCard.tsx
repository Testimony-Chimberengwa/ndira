import type { PropsWithChildren } from "react";

type GlassCardProps = PropsWithChildren<{
  className?: string;
}>;

export default function GlassCard({ children, className = "" }: GlassCardProps) {
  return <div className={`glass-card rounded-3xl p-6 ${className}`}>{children}</div>;
}
