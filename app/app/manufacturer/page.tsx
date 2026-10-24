'use client';

import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { parseEther } from 'viem';
import { CONTRACT_ADDRESS } from '@/lib/wagmi';
import { PRODUCT_PASSPORT_ABI } from '@/lib/contract-abi';
import { calculateSustainabilityScore, generateQRCodeURL } from '@/lib/utils';
import { Leaf, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function ManufacturerPage() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { writeContract, data: hash, isPending: isWriting } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const [formData, setFormData] = useState({
    productName: '',
    manufacturer: '',
    carbonFootprint: '',
    materialComposition: '',
    originCountry: '',
    description: ''
  });

  const [mintedTokenId, setMintedTokenId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const carbonGrams = Math.round(parseFloat(formData.carbonFootprint) * 1000);
    const sustainabilityScore = calculateSustainabilityScore({
      carbonFootprint: carbonGrams,
      materialComposition: formData.materialComposition,
      originCountry: formData.originCountry
    });

    const metadata = {
      name: formData.productName,
      description: formData.description || `Sustainable product from ${formData.manufacturer}`,
      image: 'https://via.placeholder.com/400/22c55e/ffffff?text=Green+Product',
      attributes: [
        { trait_type: 'Manufacturer', value: formData.manufacturer },
        { trait_type: 'Carbon Footprint', value: `${carbonGrams}g` },
        { trait_type: 'Sustainability Score', value: sustainabilityScore },
        { trait_type: 'Material', value: formData.materialComposition },
        { trait_type: 'Origin', value: formData.originCountry }
      ]
    };

    const tokenURI = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`;

    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: PRODUCT_PASSPORT_ABI,
        functionName: 'registerProduct',
        args: [
          formData.productName,
          formData.manufacturer,
          BigInt(carbonGrams),
          BigInt(sustainabilityScore),
          formData.materialComposition,
          formData.originCountry,
          tokenURI
        ]
      });
    } catch (error) {
      console.error('Error registering product:', error);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <nav className="border-b bg-white/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center gap-2">
                <Leaf className="h-8 w-8 text-green-600" />
                <span className="text-xl font-bold text-gray-900">MyGreenChain Passport</span>
              </Link>
            </div>
          </div>
        </nav>

        <div className="flex items-center justify-center py-32 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md text-center">
            <Leaf className="h-16 w-16 text-green-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-8">
              Connect your wallet to register products and create digital passports
            </p>
            <button
              onClick={() => connect({ connector: injected() })}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
            >
              Connect Wallet
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess && mintedTokenId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <nav className="border-b bg-white/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center gap-2">
                <Leaf className="h-8 w-8 text-green-600" />
                <span className="text-xl font-bold text-gray-900">MyGreenChain Passport</span>
              </Link>
              <button
                onClick={() => disconnect()}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Disconnect
              </button>
            </div>
          </div>
        </nav>

        <div className="flex items-center justify-center py-32 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Registered!</h2>
            <p className="text-gray-600 mb-8">
              Your product passport has been minted on the blockchain
            </p>
            <div className="space-y-4">
              <Link
                href={`/product/${mintedTokenId}`}
                className="block w-full px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
              >
                View Product Passport
              </Link>
              <button
                onClick={() => {
                  setMintedTokenId(null);
                  setFormData({
                    productName: '',
                    manufacturer: '',
                    carbonFootprint: '',
                    materialComposition: '',
                    originCountry: '',
                    description: ''
                  });
                }}
                className="block w-full px-6 py-3 bg-white text-green-600 border-2 border-green-600 rounded-xl font-semibold hover:bg-green-50 transition-colors"
              >
                Register Another Product
              </button>
            </div>
            {hash && (
              <p className="mt-6 text-xs text-gray-500 break-all">
                Transaction: {hash}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <nav className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <Leaf className="h-8 w-8 text-green-600" />
              <span className="text-xl font-bold text-gray-900">MyGreenChain Passport</span>
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
              <button
                onClick={() => disconnect()}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Register Product</h1>
          <p className="text-gray-600 mb-8">Create a blockchain-verified sustainability passport</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Eco-friendly T-Shirt"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Manufacturer Name *
              </label>
              <input
                type="text"
                required
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="GreenTextiles Inc"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Carbon Footprint (kg CO₂) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.carbonFootprint}
                onChange={(e) => setFormData({ ...formData, carbonFootprint: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="5.0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Material Composition *
              </label>
              <input
                type="text"
                required
                value={formData.materialComposition}
                onChange={(e) => setFormData({ ...formData, materialComposition: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="100% Organic Cotton"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country of Origin *
              </label>
              <input
                type="text"
                required
                value={formData.originCountry}
                onChange={(e) => setFormData({ ...formData, originCountry: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Portugal"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Sustainable, ethically produced clothing..."
              />
            </div>

            <button
              type="submit"
              disabled={isWriting || isConfirming}
              className="w-full px-6 py-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {(isWriting || isConfirming) && <Loader2 className="h-5 w-5 animate-spin" />}
              {isWriting ? 'Confirming Transaction...' : isConfirming ? 'Minting NFT...' : 'Register Product'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
