import Link from "next/link";
import { LogoutButton } from "@/features/auth/components/LogoutButton";

export type AppSection = "dashboard" | "transactions" | "new" | "categories" | "reports";

type AppShellProps = {
  activeSection: AppSection;
  children: React.ReactNode;
};

const navigation: Array<{
  id: AppSection;
  href: string;
  label: string;
  shortLabel: string;
  marker: string;
}> = [
  { id: "dashboard", href: "/dashboard", label: "한눈에 보기", shortLabel: "홈", marker: "홈" },
  { id: "transactions", href: "/transactions", label: "입출금 내역", shortLabel: "내역", marker: "내" },
  { id: "new", href: "/transactions/new", label: "새 내역 등록", shortLabel: "등록", marker: "+" },
  { id: "reports", href: "/reports", label: "통계 보기", shortLabel: "통계", marker: "통" },
  { id: "categories", href: "/categories", label: "카테고리 관리", shortLabel: "분류", marker: "분" },
];

export function AppShell({ activeSection, children }: AppShellProps) {
  return (
    <div className="min-h-screen">
      <a href="#main-content" className="skip-link">
        본문으로 바로가기
      </a>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[16.5rem] border-r border-[var(--border)] bg-white/95 px-5 py-6 backdrop-blur lg:flex lg:flex-col">
        <Brand />

        <nav aria-label="주요 메뉴" className="mt-10 space-y-2">
          {navigation.map((item) => {
            const isActive = item.id === activeSection;

            return (
              <Link
                key={item.id}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`group flex min-h-13 items-center gap-3 rounded-2xl px-3.5 py-2.5 text-[0.98rem] font-bold transition ${
                  isActive
                    ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                    : "text-[var(--text-soft)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)]"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`flex size-9 shrink-0 items-center justify-center rounded-xl text-sm font-black ${
                    isActive
                      ? "bg-[var(--primary)] text-white"
                      : "bg-[var(--surface-soft)] text-[var(--text-soft)] group-hover:bg-white"
                  }`}
                >
                  {item.marker}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-4">
          <div className="rounded-2xl bg-[var(--surface-soft)] p-4">
            <p className="text-sm font-extrabold text-[var(--text)]">오늘 내역도 간단하게</p>
            <p className="mt-1 text-sm leading-6 text-[var(--text-soft)]">
              날짜, 분류, 금액만 확인하면 바로 저장할 수 있어요.
            </p>
          </div>
          <LogoutButton compact />
        </div>
      </aside>

      <div className="lg:pl-[16.5rem]">
        <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between border-b border-[var(--border)] bg-white/92 px-4 backdrop-blur-lg lg:hidden">
          <Brand compact />
          <LogoutButton compact />
        </header>

        <main
          id="main-content"
          className="mx-auto w-full max-w-[92rem] px-4 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-6 sm:px-6 sm:pt-8 lg:px-10 lg:pb-12 lg:pt-10 xl:px-12"
        >
          {children}
        </main>
      </div>

      <nav
        aria-label="모바일 주요 메뉴"
        className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 rounded-[1.35rem] border border-[var(--border)] bg-white/96 p-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] shadow-[var(--shadow-md)] backdrop-blur-lg lg:hidden"
      >
        {navigation.map((item) => {
          const isActive = item.id === activeSection;
          const isCreate = item.id === "new";

          return (
            <Link
              key={item.id}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-2xl px-1 text-[0.7rem] font-extrabold transition ${
                isActive
                  ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                  : "text-[var(--text-soft)] hover:bg-[var(--surface-soft)]"
              }`}
            >
              <span
                aria-hidden="true"
                className={`flex size-7 items-center justify-center rounded-lg text-xs font-black ${
                  isCreate
                    ? "bg-[var(--primary)] text-base text-white shadow-sm"
                    : isActive
                      ? "bg-white text-[var(--primary)]"
                      : "bg-[var(--surface-soft)] text-[var(--text-soft)]"
                }`}
              >
                {item.marker}
              </span>
              {item.shortLabel}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/dashboard" className="flex items-center gap-3 rounded-xl">
      <span
        aria-hidden="true"
        className={`${compact ? "size-9 text-base" : "size-11 text-lg"} flex items-center justify-center rounded-[0.9rem] bg-[var(--primary)] font-black text-white shadow-[0_8px_18px_rgb(29_77_107_/_0.2)]`}
      >
        원
      </span>
      <span className="leading-tight">
        <span className="block text-[0.68rem] font-black tracking-[0.16em] text-[var(--text-faint)]">
          CASHBOOK
        </span>
        <span className={`${compact ? "text-base" : "text-lg"} block font-black tracking-[-0.03em] text-[var(--text)]`}>
          살림장부
        </span>
      </span>
    </Link>
  );
}
