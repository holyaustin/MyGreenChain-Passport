import { createConfig, http } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { defineChain } from 'viem';

const SOMNIA_RPC = process.env.NEXT_PUBLIC_SOMNIA_RPC || 'https://dream-rpc.somnia.network';

export const somniaTestnet = defineChain({
  id: 50312,
  name: 'Somnia Testnet',
  nativeCurrency: { name: 'Somnia Test Token', symbol: 'STT', decimals: 18 },
  rpcUrls: { default: { http: [SOMNIA_RPC] } },
  blockExplorers: {
    default: { name: 'Somnia Explorer', url: 'https://shannon-explorer.somnia.network' },
  },
  testnet: true,
});

export const config = createConfig({
  chains: [somniaTestnet],
  connectors: [injected()],
  transports: { [somniaTestnet.id]: http(SOMNIA_RPC) },
  ssr: true,
});

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;