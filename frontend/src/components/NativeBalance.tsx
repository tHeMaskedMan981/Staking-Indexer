import { useAccount, useBalance } from 'wagmi'
import { ethers } from "ethers";

export function NativeBalance() {
  const { address } = useAccount()
  const { data, isError, isLoading } = useBalance({
    address: address,
    watch: true
  })
 
  if (isLoading) return <div>Fetching balance…</div>
  if (isError) return <div>Error fetching balance</div>
  return (
    <div className='bg-gray-300 rounded-t-lg px-24 text-black'>
      Eth Balance: {Number(data?.formatted).toFixed(4)} {data?.symbol}
    </div>
  )
}
