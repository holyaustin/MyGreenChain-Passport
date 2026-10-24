'use client';

import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useConnect, useDisconnect, useReadContract } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { CONTRACT_ADDRESS } from '@/lib/wagmi';
import { PRODUCT_PASSPORT_ABI } from '@/lib/contract-abi';
import { Leaf, Loader2, CheckCircle, Shield, UserPlus, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { isAddress } from 'viem';

export default function AdminAuthorizePage() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { writeContract, data: hash, isPending: isWriting } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Check if user is the contract owner
  const { data: owner, isLoading: checkingOwner } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: PRODUCT_PASSPORT_ABI,
    functionName: 'owner',
  });

  const isOwner = address && owner && address.toLowerCase() === (owner as string).toLowerCase();

  const [manufacturerAddress, setManufacturerAddress] = useState('');
  const [addressError, setAddressError] = useState('');
  const [authorizedAddress, setAuthorizedAddress] = useState('');

  // Check if an address is already authorized
  const { data: isManufacturerAuthorized, refetch: refetchAuthStatus } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: PRODUCT_PASSPORT_ABI,
    functionName: 'authorizedManufacturers',
    args: manufacturerAddress && isAddress(manufacturerAddress) ? [manufacturerAddress as `0x${string}`] : undefined,
  });

  const handleAuthorize = async () => {
    // Validate address
    if (!manufacturerAddress) {
      setAddressError('Please enter a wallet address');
      return;
    }

    if (!isAddress(manufacturerAddress)) {
      setAddressError('Invalid Ethereum address format');
      return;
    }

    setAddressError('');

    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: PRODUCT_PASSPORT_ABI,
        functionName: 'authorizeManufacturer',
        args: [manufacturerAddress as `0x${string}`]
      });
      setAuthorizedAddress(manufacturerAddress);
    } catch (error) {
      console.error('Authorization error:', error);
      setAddressError('Failed to authorize manufacturer');
    }
  };

  // Reset form after success
  if (isSuccess && authorizedAddress) {
    setTimeout(() => {
      setManufacturerAddress('');
      setAuthorizedAddress('');
      refetchAuthStatus();
    }, 3000);
  }

  // Not connected
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
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
            <Shield className="h-16 w-16 text-blue-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Admin Authorization</h2>
            <p className="text-gray-600 mb-8">
              Connect your wallet to manage manufacturer authorizations
            </p>
            <button
              onClick={() => connect({ connector: injected() })}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Connect Wallet
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Checking owner status
  if (checkingOwner) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
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
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Verifying admin access...</p>
          </div>
        </div>
      </div>
    );
  }

  // Not owner - access denied
  if (!isOwner) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
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
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-6">
              Only the contract owner can authorize manufacturers.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800">
                <strong>Contract Owner:</strong><br />
                <code className="text-xs">{owner as string}</code>
              </p>
            </div>
            <Link
              href="/"
              className="block w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success screen
  if (isSuccess && authorizedAddress) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <nav className="border-b bg-white/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center gap-2">
                <Leaf className="h-8 w-8 text-green-600" />
                <span className="text-xl font-bold text-gray-900">MyGreenChain Passport</span>
              </Link>
              <div className="flex items-center gap-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                  Owner
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

        <div className="flex items-center justify-center py-32 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Manufacturer Authorized!</h2>
            <p className="text-gray-600 mb-6">
              The wallet has been successfully authorized to register products.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-900 break-all">
                <strong>Authorized:</strong><br />
                <code className="text-xs">{authorizedAddress}</code>
              </p>
            </div>
            {hash && (
              <p className="text-xs text-gray-500 mb-6 break-all">
                Transaction: {hash}
              </p>
            )}
            <p className="text-sm text-gray-600 mb-4">
              Redirecting back to authorization page...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Owner - authorization page
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <nav className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <Leaf className="h-8 w-8 text-green-600" />
              <span className="text-xl font-bold text-gray-900">MyGreenChain Passport</span>
            </Link>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                Owner
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
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Authorize Manufacturer</h1>
          </div>
          <p className="text-gray-600 mb-8">
            Grant permission to a wallet address to register products and mint sustainability passports
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <h3 className="font-semibold text-blue-900 mb-2">Contract Owner Privileges</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Authorize new manufacturers</li>
              <li>Revoke manufacturer access</li>
              <li>Automatically authorized to register products</li>
            </ul>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Manufacturer Wallet Address *
              </label>
              <input
                type="text"
                value={manufacturerAddress}
                onChange={(e) => {
                  setManufacturerAddress(e.target.value);
                  setAddressError('');
                }}
                placeholder="0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm ${
                  addressError ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {addressError && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {addressError}
                </p>
              )}
              {manufacturerAddress && isAddress(manufacturerAddress) && (
                <div className="mt-2 text-sm">
                  {isManufacturerAuthorized ? (
                    <p className="text-green-600 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      This address is already authorized
                    </p>
                  ) : (
                    <p className="text-gray-600">
                      Valid address - ready to authorize
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2 text-sm">Quick Actions:</h4>
              <button
                onClick={() => setManufacturerAddress(address || '')}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Use my address ({address?.slice(0, 6)}...{address?.slice(-4)})
              </button>
            </div>

            <button
              onClick={handleAuthorize}
              disabled={isWriting || isConfirming || !manufacturerAddress || !!addressError || isManufacturerAuthorized}
              className="w-full px-6 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {(isWriting || isConfirming) && <Loader2 className="h-5 w-5 animate-spin" />}
              <UserPlus className="h-5 w-5" />
              {isWriting ? 'Confirming Transaction...' : isConfirming ? 'Authorizing...' : 'Authorize Manufacturer'}
            </button>
          </div>

          <div className="mt-8 pt-6 border-t">
            <h3 className="font-semibold text-gray-900 mb-3">What happens after authorization?</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Manufacturer can access the product registration page</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>They can mint NFT product passports with sustainability data</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>They can add lifecycle events to their products</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Authorization is permanent (until revoked by owner)</span>
              </li>
            </ul>
          </div>

          <div className="mt-6">
            <Link
              href="/manufacturer"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              → Go to Manufacturer Page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
