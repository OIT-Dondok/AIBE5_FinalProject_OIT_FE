import { api } from "@/lib/axios";
import type { MemberPublicProfile } from "@/types/domain";

export const getMemberProfile = (memberUuid: string) =>
  api.get<MemberPublicProfile>(`/members/${memberUuid}/profile`);
