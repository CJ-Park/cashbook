import Link from "next/link";

type PageHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  action?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
};

export function PageHeader({
  title,
  description,
  eyebrow,
  action,
  backHref,
  backLabel = "이전 화면",
}: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {backHref ? (
          <Link
            href={backHref}
            className="mb-3 inline-flex min-h-10 items-center rounded-xl px-1 text-sm font-extrabold text-[var(--primary)] hover:underline"
          >
            <span aria-hidden="true" className="mr-1.5 text-lg">
              ←
            </span>
            {backLabel}
          </Link>
        ) : eyebrow ? (
          <p className="mb-2 text-sm font-black tracking-[0.12em] text-[var(--primary)] uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-[2rem] leading-tight font-black tracking-[-0.045em] text-[var(--text)] sm:text-[2.35rem]">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-base leading-7 text-[var(--text-soft)] sm:text-[1.05rem]">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="flex shrink-0 flex-wrap gap-2.5">{action}</div> : null}
    </header>
  );
}
