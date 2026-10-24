import { createConfig, http } from 'wagmi';
import { polygonAmoy, polygon, polygonMumbai } from 'wagmi/chains';

export const config = createConfig({
  chains: [polygonAmoy, polygonMumbai, polygon],
  transports: {
    [polygonAmoy.id]: http(process.env.NEXT_PUBLIC_POLYGON_AMOY_RPC),
    [polygonMumbai.id]: http(process.env.NEXT_PUBLIC_POLYGON_MUMBAI_RPC),
    [polygon.id]: http(),
  },
});

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;
