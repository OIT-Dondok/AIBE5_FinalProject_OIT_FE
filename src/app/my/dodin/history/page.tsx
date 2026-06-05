import { Header } from "@/components/common/Header";
import { DodinHistoryList } from "@/components/domain/point/DodinHistoryList";
import { createWalletViewModel } from "@/components/domain/point/pointViewModel";
import { mockPointAccount, mockPointHistory } from "@/mocks/data/points";

export default function DodinHistoryPage() {
  const walletHistory = createWalletViewModel(mockPointAccount, mockPointHistory.items);

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-transparent">
      <div className="mx-auto flex w-full max-w-[430px] flex-col pb-10">
        <Header title="도딘 내역" showBackButton />

        <div className="px-5 pt-5">
          <DodinHistoryList historyItems={walletHistory.historyItems} />
        </div>
      </div>
    </main>
  );
}
