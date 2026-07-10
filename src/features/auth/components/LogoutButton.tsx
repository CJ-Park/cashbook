import { logout } from "../actions/logout";
import { SubmitButton } from "@/shared/components/ui/SubmitButton";

type LogoutButtonProps = {
  compact?: boolean;
};

export function LogoutButton({ compact = false }: LogoutButtonProps) {
  return (
    <form action={logout} className={compact ? "shrink-0 lg:w-full" : undefined}>
      <SubmitButton
        pendingLabel="로그아웃 중..."
        className={`button-secondary ${compact ? "w-full px-3 text-sm" : "px-5"}`}
      >
        로그아웃
      </SubmitButton>
    </form>
  );
}
