import { useAccount, useBalance } from "wagmi";

export function MaticBalance() {
  const { address } = useAccount();
  const { data, isError, isLoading } = useBalance({
    address: address,
    token: "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0",
    watch: true,
  });

  if (isLoading) return <div>Fetching balance…</div>;
  if (isError) return <div>Error fetching balance</div>;
  return (
    <div className='bg-gray-300 rounded-b-lg px-24 text-black'>
      Matic Balance: {Number(data?.formatted).toFixed(4)} {data?.symbol}
    </div>
  );
}
