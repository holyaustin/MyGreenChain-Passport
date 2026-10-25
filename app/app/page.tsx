'use client';

import Link from 'next/link';
import { Leaf, Shield, Globe, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Leaf className="h-8 w-8 text-green-600" />
              <span className="text-xl font-bold text-gray-900">MyGreenChain Passport</span>
            </div>
            <div className="flex gap-4">
              <Link
                href="/admin"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                Admin
              </Link>
              <Link
                href="/manufacturer"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-green-600 transition-colors"
              >
                For Manufacturers
              </Link>
              <Link
                href="/product/1"
                className="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                View Demo Product
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Transparent Sustainability
              <span className="block text-green-600 mt-2">Through Blockchain</span>
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
              Digital product passports powered by blockchain and AI that track environmental impact from production to recycling
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/manufacturer"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-lg hover:shadow-xl"
              >
                Register Your Product
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/product/1"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold bg-white text-green-600 border-2 border-green-600 rounded-xl hover:bg-green-50 transition-all"
              >
                View Demo
              </Link>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">
              How It Works
            </h2>
            <div className="grid md:grid-cols-3 gap-12">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Blockchain Verified</h3>
                <p className="text-gray-600">
                  Immutable product records stored on Somnia blockchain prevent greenwashing and ensure data integrity
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
                  <Globe className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">AI Sustainability Scoring</h3>
                <p className="text-gray-600">
                  Automated environmental impact analysis based on materials, origin, and carbon footprint
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-6">
                  <Leaf className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Full Lifecycle Tracking</h3>
                <p className="text-gray-600">
                  Track products from production through transport, sale, and recycling with complete transparency
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gradient-to-b from-green-50 to-green-100">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Built for IEEE ClimateChain Hackathon 2026
            </h2>
            <p className="text-lg text-gray-700 mb-8 max-w-3xl mx-auto">
              Addressing real-world climate challenges with blockchain and AI technology.
              Empowering consumers with verified sustainability data and helping manufacturers prove their environmental commitment.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
              <div className="px-4 py-2 bg-white rounded-full">🌍 Sustainable Supply Chains</div>
              <div className="px-4 py-2 bg-white rounded-full">♻️ Circular Economy</div>
              <div className="px-4 py-2 bg-white rounded-full">🔍 Transparency & Trust</div>
              <div className="px-4 py-2 bg-white rounded-full">🎯 Climate Impact</div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Leaf className="h-6 w-6 text-green-400" />
            <span className="text-lg font-semibold">MyGreenChain Passport</span>
          </div>
          <p className="text-gray-400 mb-2">
            Digital Product Passports for a Sustainable Future
          </p>
          <p className="text-sm text-gray-500">
            IEEE ClimateChain Global Hackathon 2026
          </p>
        </div>
      </footer>
    </div>
  );
}
