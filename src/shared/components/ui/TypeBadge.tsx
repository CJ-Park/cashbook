type TypeBadgeProps = {
  type: "INCOME" | "EXPENSE";
  compact?: boolean;
};

export function TypeBadge({ type, compact = false }: TypeBadgeProps) {
  const isIncome = type === "INCOME";

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full font-extrabold ${
        compact ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm"
      } ${
        isIncome
          ? "bg-[var(--income-soft)] text-[var(--income)]"
          : "bg-[var(--expense-soft)] text-[var(--expense)]"
      }`}
    >
      <span
        aria-hidden="true"
        className={`size-1.5 rounded-full ${isIncome ? "bg-[var(--income)]" : "bg-[var(--expense)]"}`}
      />
      {isIncome ? "입금" : "출금"}
    </span>
  );
}
