import HostConsoleClient from "./HostConsoleClient";
import { MOCK_CREWS } from "@/mocks/data/crews";

export function generateStaticParams() {
  return MOCK_CREWS.map((crew) => ({
    crewId: String(crew.crew_id),
  }));
}

export default function HostConsolePage() {
  return <HostConsoleClient />;
}
