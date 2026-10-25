'use client';

import { useEffect, useState } from 'react';
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
  useConnect,
  useDisconnect,
  useReadContract,
  useChainId,
  useSwitchChain,
} from 'wagmi';
import { injected } from 'wagmi/connectors';
import { CONTRACT_ADDRESS, somniaTestnet } from '@/lib/wagmi';
import { PRODUCT_PASSPORT_ABI } from '@/lib/contract-abi';
import { Leaf, Loader2, CheckCircle, Shield, UserPlus, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { isAddress } from 'viem';

function Nav({
  address,
  isOwner,
  onDisconnect,
}: {
  address?: string;
  isOwner?: boolean;
  onDisconnect?: () => void;
}) {
  return (
    <nav className="border-b bg-white/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <Leaf className="h-8 w-8 text-green-600" />
            <span className="text-xl font-bold text-gray-900">MyGreenChain Passport</span>
          </Link>
          {onDisconnect && (
            <div className="flex items-center gap-4">
              {isOwner && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                  Owner
                </span>
              )}
              {address && (
                <span className="text-sm text-gray-600">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
              )}
              <button
                onClick={onDisconnect}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default function AdminAuthorizePage() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  const {
    writeContract,
    data: hash,
    isPending: isWriting,
    error: writeError,
    reset: resetWrite,
  } = useWriteContract();
  const {
    isLoading: isConfirming,
    isSuccess,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash, chainId: somniaTestnet.id });

  const [manufacturerAddress, setManufacturerAddress] = useState('');
  const [addressError, setAddressError] = useState('');
  const [authorizedAddress, setAuthorizedAddress] = useState('');

  const wrongNetwork = isConnected && chainId !== somniaTestnet.id;

  // Owner check, pinned to Somnia so it works regardless of wallet network
  const {
    data: owner,
    isLoading: checkingOwner,
    error: ownerError,
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: PRODUCT_PASSPORT_ABI,
    functionName: 'owner',
    chainId: somniaTestnet.id,
    query: { enabled: !!CONTRACT_ADDRESS },
  });

  const isOwner =
    !!address && !!owner && address.toLowerCase() === (owner as string).toLowerCase();

  // Is the entered address already authorized?
  const { data: isManufacturerAuthorized, refetch: refetchAuthStatus } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: PRODUCT_PASSPORT_ABI,
    functionName: 'authorizedManufacturers',
    chainId: somniaTestnet.id,
    args:
      manufacturerAddress && isAddress(manufacturerAddress)
        ? [manufacturerAddress as `0x${string}`]
        : undefined,
    query: { enabled: !!manufacturerAddress && isAddress(manufacturerAddress) },
  });

  const handleAuthorize = () => {
    if (!manufacturerAddress) {
      setAddressError('Please enter a wallet address');
      return;
    }
    if (!isAddress(manufacturerAddress)) {
      setAddressError('Invalid Ethereum address format');
      return;
    }
    setAddressError('');
    setAuthorizedAddress(manufacturerAddress);
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: PRODUCT_PASSPORT_ABI,
      functionName: 'authorizeManufacturer',
      args: [manufacturerAddress as `0x${string}`],
      chainId: somniaTestnet.id,
    });
  };

  // If the transaction is rejected or fails, clear the pending "authorized" address
  useEffect(() => {
    if ((writeError || receiptError) && authorizedAddress) {
      setAuthorizedAddress('');
    }
  }, [writeError, receiptError, authorizedAddress]);

  // Reset the form after success (in an effect, not during render)
  useEffect(() => {
    if (isSuccess && authorizedAddress) {
      const t = setTimeout(() => {
        setManufacturerAddress('');
        setAuthorizedAddress('');
        resetWrite();
        refetchAuthStatus();
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [isSuccess, authorizedAddress, resetWrite, refetchAuthStatus]);

  // 1. Not connected
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <Nav />
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

  // 2. Wrong network
  if (wrongNetwork) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white">
        <Nav address={address} onDisconnect={() => disconnect()} />
        <div className="flex items-center justify-center py-32 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md text-center">
            <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Wrong Network</h2>
            <p className="text-gray-600 mb-6">
              Please switch your wallet to Somnia Testnet (chain ID {somniaTestnet.id}).
            </p>
            <button
              onClick={() => switchChain({ chainId: somniaTestnet.id })}
              disabled={isSwitching}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {isSwitching ? 'Switching...' : 'Switch to Somnia Testnet'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Checking owner
  if (checkingOwner) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <Nav address={address} onDisconnect={() => disconnect()} />
        <div className="flex items-center justify-center py-32 px-4">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Verifying admin access...</p>
          </div>
        </div>
      </div>
    );
  }

  // 4. Couldn't read the owner (config or contract problem, not an access problem)
  if (!CONTRACT_ADDRESS || ownerError || !owner) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white">
        <Nav address={address} onDisconnect={() => disconnect()} />
        <div className="flex items-center justify-center py-32 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md text-center">
            <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Can&apos;t Read Contract</h2>
            <p className="text-gray-600 mb-6">
              Couldn&apos;t read the contract owner on Somnia Testnet. Check your contract
              address, RPC and ABI.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-xs text-yellow-900 break-all">
                <strong>Contract:</strong> {CONTRACT_ADDRESS || '(NEXT_PUBLIC_CONTRACT_ADDRESS not set)'}
              </p>
              {ownerError && (
                <p className="text-xs text-red-700 mt-2 break-all">
                  <strong>Error:</strong> {ownerError.message}
                </p>
              )}
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

  // 5. Connected to the right chain but not the owner
  if (!isOwner) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
        <Nav address={address} onDisconnect={() => disconnect()} />
        <div className="flex items-center justify-center py-32 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-6">
              Only the contract owner can authorize manufacturers.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-red-800 break-all">
                <strong>Contract Owner:</strong>
                <br />
                <code className="text-xs">{owner as string}</code>
              </p>
              <p className="text-sm text-red-800 break-all mt-3">
                <strong>Your Wallet:</strong>
                <br />
                <code className="text-xs">{address}</code>
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

  // 6. Success
  if (isSuccess && authorizedAddress) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <Nav address={address} isOwner onDisconnect={() => disconnect()} />
        <div className="flex items-center justify-center py-32 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Manufacturer Authorized!</h2>
            <p className="text-gray-600 mb-6">
              The wallet has been successfully authorized to register products.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-900 break-all">
                <strong>Authorized:</strong>
                <br />
                <code className="text-xs">{authorizedAddress}</code>
              </p>
            </div>
            {hash && (
              <a
                href={`${somniaTestnet.blockExplorers.default.url}/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs text-blue-600 hover:text-blue-800 mb-6 break-all"
              >
                View transaction: {hash}
              </a>
            )}
            <p className="text-sm text-gray-600">Returning to the authorization form...</p>
          </div>
        </div>
      </div>
    );
  }

  // 7. Owner: authorization form
  const txError = writeError || receiptError;
  const txErrorMessage = txError
    ? ('shortMessage' in txError && (txError as any).shortMessage) || txError.message
    : '';

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Nav address={address} isOwner onDisconnect={() => disconnect()} />

      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Authorize Manufacturer</h1>
          </div>
          <p className="text-gray-600 mb-8">
            Grant permission to a wallet address to register products and mint sustainability
            passports
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
                  setManufacturerAddress(e.target.value.trim());
                  setAddressError('');
                }}
                placeholder="0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
                className={`w-full text-gray-900 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm ${
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
                    <p className="text-gray-600">Valid address - ready to authorize</p>
                  )}
                </div>
              )}
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2 text-sm">Quick Actions:</h4>
              <button
                onClick={() => {
                  setManufacturerAddress(address || '');
                  setAddressError('');
                }}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Use my address ({address?.slice(0, 6)}...{address?.slice(-4)})
              </button>
            </div>

            {txErrorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span className="break-all">Transaction failed: {txErrorMessage}</span>
                </p>
              </div>
            )}

            <button
              onClick={handleAuthorize}
              disabled={
                isWriting ||
                isConfirming ||
                !manufacturerAddress ||
                !!addressError ||
                !!isManufacturerAuthorized
              }
              className="w-full px-6 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {(isWriting || isConfirming) && <Loader2 className="h-5 w-5 animate-spin" />}
              <UserPlus className="h-5 w-5" />
              {isWriting
                ? 'Confirm in Wallet...'
                : isConfirming
                ? 'Authorizing...'
                : 'Authorize Manufacturer'}
            </button>
          </div>

          <div className="mt-8 pt-6 border-t">
            <h3 className="font-semibold text-gray-900 mb-3">What happens after authorization?</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              {[
                'Manufacturer can access the product registration page',
                'They can mint NFT product passports with sustainability data',
                'They can add lifecycle events to their products',
                'Authorization is permanent (until revoked by owner)',
              ].map((text) => (
                <li key={text} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>{text}</span>
                </li>
              ))}
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