type SummaryTone = "income" | "expense" | "balance" | "neutral";

type SummaryCardProps = {
  label: string;
  value: string;
  tone?: SummaryTone;
  hint?: string;
  featured?: boolean;
};

const toneStyles: Record<SummaryTone, { accent: string; soft: string; text: string }> = {
  income: {
    accent: "bg-[var(--income)]",
    soft: "bg-[var(--income-soft)]",
    text: "text-[var(--income)]",
  },
  expense: {
    accent: "bg-[var(--expense)]",
    soft: "bg-[var(--expense-soft)]",
    text: "text-[var(--expense)]",
  },
  balance: {
    accent: "bg-[var(--primary)]",
    soft: "bg-[var(--primary-soft)]",
    text: "text-[var(--primary)]",
  },
  neutral: {
    accent: "bg-[var(--text-soft)]",
    soft: "bg-[var(--surface-soft)]",
    text: "text-[var(--text)]",
  },
};

export function SummaryCard({ label, value, tone = "neutral", hint, featured = false }: SummaryCardProps) {
  const style = toneStyles[tone];

  return (
    <article
      className={`surface-card relative overflow-hidden ${featured ? "p-6 sm:p-7" : "p-5 sm:p-6"}`}
    >
      <span aria-hidden="true" className={`absolute inset-y-0 left-0 w-1.5 ${style.accent}`} />
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-extrabold text-[var(--text-soft)] sm:text-[0.95rem]">{label}</p>
        <span aria-hidden="true" className={`size-2.5 rounded-full ${style.accent}`} />
      </div>
      <p
        className={`money mt-3 break-words font-black ${style.text} ${featured ? "text-[2rem] sm:text-[2.55rem]" : "text-[1.65rem] sm:text-[1.9rem]"}`}
      >
        {value}
      </p>
      {hint ? (
        <p className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-bold ${style.soft} ${style.text}`}>
          {hint}
        </p>
      ) : null}
    </article>
  );
}
