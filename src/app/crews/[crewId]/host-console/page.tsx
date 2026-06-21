import { Suspense } from "react";
import HostConsoleClient from "./HostConsoleClient";

export default function HostConsolePage() {
  return (
    <Suspense>
      <HostConsoleClient />
    </Suspense>
  );
}
