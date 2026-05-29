import { redirect } from "next/navigation";

// TODO: 백엔드 연동 시 로그인 여부 + 참여 크루 여부에 따라 분기
// 로그인 안 됨 → /login
// 로그인 + 크루 없음 → /crews
// 로그인 + 크루 있음 → /feed
export default function RootPage() {
  redirect("/login");
}
