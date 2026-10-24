'use client';

import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useConnect, useDisconnect, useReadContract } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { CONTRACT_ADDRESS } from '@/lib/wagmi';
import { PRODUCT_PASSPORT_ABI } from '@/lib/contract-abi';
import { calculateSustainabilityScore, generateQRCodeURL } from '@/lib/utils';
import { Leaf, Loader2, CheckCircle, AlertCircle, Shield } from 'lucide-react';
import Link from 'next/link';

export default function ManufacturerPage() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { writeContract, data: hash, isPending: isWriting } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Check if user is authorized manufacturer
  const { data: isAuthorized, isLoading: checkingAuth, refetch: refetchAuth } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: PRODUCT_PASSPORT_ABI,
    functionName: 'authorizedManufacturers',
    args: address ? [address] : undefined,
  });

  // Check if user is the contract owner
  const { data: owner } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: PRODUCT_PASSPORT_ABI,
    functionName: 'owner',
  });

  const isOwner = address && owner && address.toLowerCase() === owner.toLowerCase();

  const [formData, setFormData] = useState({
    productName: '',
    manufacturer: '',
    carbonFootprint: '',
    materialComposition: '',
    originCountry: '',
    description: ''
  });

  const [mintedTokenId, setMintedTokenId] = useState<string | null>(null);
  const [authRequesting, setAuthRequesting] = useState(false);

  // Request authorization from owner
  const handleRequestAuthorization = async () => {
    if (!isOwner) {
      alert('Only the contract owner can authorize manufacturers. Please contact the platform administrator.');
      return;
    }

    setAuthRequesting(true);
    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: PRODUCT_PASSPORT_ABI,
        functionName: 'authorizeManufacturer',
        args: [address]
      });
    } catch (error) {
      console.error('Authorization error:', error);
      setAuthRequesting(false);
    }
  };

  // Wait for authorization transaction
  const { isSuccess: authSuccess } = useWaitForTransactionReceipt({
    hash: authRequesting ? hash : undefined
  });

  // Refetch auth status when authorization succeeds
  if (authSuccess && authRequesting) {
    setAuthRequesting(false);
    refetchAuth();
  }

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

  // Not connected - show connect wallet
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

  // Connected but checking authorization
  if (checkingAuth) {
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
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-green-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Checking authorization status...</p>
          </div>
        </div>
      </div>
    );
  }

  // Connected but NOT authorized - show authorization request
  if (!isAuthorized && !isOwner) {
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

        <div className="flex items-center justify-center py-32 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md text-center">
            <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Authorization Required</h2>
            <p className="text-gray-600 mb-6">
              Your wallet is not authorized to register products. Only verified manufacturers can create product passports.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-blue-900 mb-2">
                <strong>To get authorized:</strong>
              </p>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Contact the platform administrator</li>
                <li>Provide your wallet address: <code className="bg-blue-100 px-2 py-0.5 rounded text-xs">{address?.slice(0, 8)}...{address?.slice(-6)}</code></li>
                <li>Wait for authorization approval</li>
              </ol>
            </div>
            <div className="flex gap-3">
              <Link
                href="/"
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
              >
                Go Home
              </Link>
              <button
                onClick={() => refetchAuth()}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
              >
                Check Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Owner but not self-authorized - redirect to admin page to authorize
  if (isOwner && !isAuthorized) {
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

        <div className="flex items-center justify-center py-32 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md text-center">
            <Shield className="h-16 w-16 text-blue-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome, Contract Owner!</h2>
            <p className="text-gray-600 mb-6">
              You're the contract owner. To register products, you need to authorize yourself as a manufacturer first.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-900">
                Click below to go to the authorization page where you can authorize yourself with one click.
              </p>
            </div>
            <Link
              href="/admin"
              className="block w-full px-6 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Go to Authorization Page
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success screen after product registration
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

  // Authorized - show product registration form
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
              {isOwner && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                  Owner
                </span>
              )}
              <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                ✓ Authorized
              </span>
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
