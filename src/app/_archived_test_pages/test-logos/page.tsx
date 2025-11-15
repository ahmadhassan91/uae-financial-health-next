'use client';

import React from 'react';
import { NationalBondsLogo } from '@/components/NationalBondsLogo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestLogosPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center mb-8">National Bonds Corporation Logos</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Primary Logo</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center items-center p-8 bg-white">
              <NationalBondsLogo variant="primary" width={280} height={110} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Secondary Logo</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center items-center p-8 bg-white">
              <NationalBondsLogo variant="secondary" width={280} height={110} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Full Logo</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center items-center p-8 bg-white">
              <NationalBondsLogo variant="full" width={280} height={110} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Different Sizes - Primary Logo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 bg-white">
              <div className="flex items-center gap-4">
                <span className="w-20 text-sm">Small:</span>
                <NationalBondsLogo variant="primary" width={160} height={64} />
              </div>
              <div className="flex items-center gap-4">
                <span className="w-20 text-sm">Medium:</span>
                <NationalBondsLogo variant="primary" width={220} height={88} />
              </div>
              <div className="flex items-center gap-4">
                <span className="w-20 text-sm">Large:</span>
                <NationalBondsLogo variant="primary" width={320} height={128} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dark Background Test</CardTitle>
            </CardHeader>
            <CardContent className="p-8 bg-gray-900 rounded-lg">
              <div className="flex justify-center">
                <NationalBondsLogo variant="primary" width={280} height={110} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <a 
            href="/" 
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}