import { logout } from "../actions/logout";

export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="min-h-12 rounded-md bg-zinc-900 px-5 text-base font-semibold text-white shadow-sm hover:bg-zinc-800"
      >
        로그아웃
      </button>
    </form>
  );
}
