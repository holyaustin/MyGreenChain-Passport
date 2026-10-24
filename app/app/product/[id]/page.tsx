'use client';

import { use, useState } from 'react';
import { useReadContract, useAccount } from 'wagmi';
import { CONTRACT_ADDRESS } from '@/lib/wagmi';
import { PRODUCT_PASSPORT_ABI } from '@/lib/contract-abi';
import { formatCO2, formatDate, getSustainabilityMetrics } from '@/lib/utils';
import { Leaf, Package, MapPin, Recycle, Calendar, TrendingUp, AlertCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import type { ProductData, LifecycleEvent } from '@/lib/types';

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const tokenId = BigInt(id);
  const { address } = useAccount();

  const { data: product, isLoading: loadingProduct } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: PRODUCT_PASSPORT_ABI,
    functionName: 'getProduct',
    args: [tokenId],
  }) as { data: ProductData | undefined; isLoading: boolean };

  const { data: events, isLoading: loadingEvents } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: PRODUCT_PASSPORT_ABI,
    functionName: 'getLifecycleEvents',
    args: [tokenId],
  }) as { data: LifecycleEvent[] | undefined; isLoading: boolean };

  const [showQR, setShowQR] = useState(false);

  if (loadingProduct) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product passport...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-xl p-12 max-w-md">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-6">This product passport does not exist</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const metrics = getSustainabilityMetrics(Number(product.sustainabilityScore));
  const qrUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <Leaf className="h-8 w-8 text-green-600" />
              <span className="text-xl font-bold text-gray-900">MyGreenChain Passport</span>
            </Link>
            <button
              onClick={() => setShowQR(!showQR)}
              className="px-4 py-2 text-sm font-medium text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            >
              {showQR ? 'Hide' : 'Show'} QR Code
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto py-8 px-4">
        {showQR && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Scan to View Passport</h3>
            <div className="inline-block p-4 bg-white rounded-lg shadow-inner">
              <QRCodeSVG value={qrUrl} size={200} level="H" />
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-12 text-white">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">{product.productName}</h1>
                <p className="text-green-100 text-lg">{product.manufacturer}</p>
              </div>
              <div className="text-right">
                <div className={`text-5xl font-bold ${metrics.color.replace('text-', 'text-white opacity-')}`}>
                  {metrics.grade}
                </div>
                <p className="text-sm text-green-100 mt-1">Sustainability</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-green-50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                  <h3 className="font-semibold text-gray-900">Score</h3>
                </div>
                <p className="text-3xl font-bold text-green-600">{Number(product.sustainabilityScore)}</p>
                <p className="text-sm text-gray-600 mt-1">{metrics.message}</p>
              </div>

              <div className="bg-blue-50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Package className="h-6 w-6 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Carbon Footprint</h3>
                </div>
                <p className="text-3xl font-bold text-blue-600">{formatCO2(product.carbonFootprint)}</p>
                <p className="text-sm text-gray-600 mt-1">Total CO₂ emissions</p>
              </div>

              <div className="bg-purple-50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="h-6 w-6 text-purple-600" />
                  <h3 className="font-semibold text-gray-900">Produced</h3>
                </div>
                <p className="text-lg font-bold text-purple-600">{formatDate(product.productionDate)}</p>
                <p className="text-sm text-gray-600 mt-1">Manufacturing date</p>
              </div>
            </div>

            <div className="border-t pt-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Details</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="h-5 w-5 text-gray-600" />
                    <h3 className="font-semibold text-gray-900">Materials</h3>
                  </div>
                  <p className="text-gray-700">{product.materialComposition}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-5 w-5 text-gray-600" />
                    <h3 className="font-semibold text-gray-900">Origin</h3>
                  </div>
                  <p className="text-gray-700">{product.originCountry}</p>
                </div>
              </div>
            </div>

            {product.isRecycled && (
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-3">
                  <Recycle className="h-8 w-8 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-green-900">Recycled Product</h3>
                    <p className="text-sm text-green-700">
                      Recycled on {formatDate(product.recycledDate)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="border-t pt-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Lifecycle Journey</h2>
              {loadingEvents ? (
                <p className="text-gray-600">Loading events...</p>
              ) : events && events.length > 0 ? (
                <div className="space-y-4">
                  {events.map((event, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <div className="w-4 h-4 rounded-full bg-green-600"></div>
                        </div>
                        {index < events.length - 1 && (
                          <div className="w-0.5 flex-1 bg-green-200 mt-2"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-8">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-gray-900 capitalize">{event.eventType}</h3>
                            <span className="text-sm text-gray-600">{formatDate(event.timestamp)}</span>
                          </div>
                          <p className="text-gray-700 mb-1">{event.description}</p>
                          {event.location && (
                            <p className="text-sm text-gray-600">📍 {event.location}</p>
                          )}
                          {Number(event.additionalCO2) > 0 && (
                            <p className="text-sm text-gray-600">
                              +{formatCO2(event.additionalCO2)} CO₂
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No lifecycle events recorded yet</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 text-sm text-gray-600">
          <h3 className="font-semibold text-gray-900 mb-2">Blockchain Verification</h3>
          <p className="mb-2">This product passport is permanently recorded on the Polygon blockchain.</p>
          <div className="flex items-center gap-2 text-xs">
            <span>Token ID: #{id}</span>
            <span>•</span>
            <span>Owner: {product.currentOwner.slice(0, 6)}...{product.currentOwner.slice(-4)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
