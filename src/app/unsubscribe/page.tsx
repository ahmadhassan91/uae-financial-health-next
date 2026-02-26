'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://uae-financial-health-filters-68ab0c8434cb.herokuapp.com';
// Static assets are served at the root (no /api/v1 prefix)
const ASSETS_BASE = API_BASE.replace('/api/v1', '');

function UnsubscribeContent() {
    const searchParams = useSearchParams();
    const email = searchParams.get('email') || '';

    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!email) {
            setStatus('error');
            setMessage('No email address provided.');
            return;
        }

        setStatus('loading');

        fetch(`${API_BASE}/admin/unsubscribe?email=${encodeURIComponent(email)}`, {
            method: 'GET',
        })
            .then(async (res) => {
                const data = await res.json();
                if (res.ok && data.success) {
                    setStatus('success');
                    setMessage(data.message || 'You have been unsubscribed successfully.');
                } else {
                    setStatus('error');
                    setMessage(data.detail || 'Something went wrong. Please try again.');
                }
            })
            .catch(() => {
                setStatus('error');
                setMessage('Network error. Please try again later.');
            });
    }, [email]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8 text-center">
                {/* Logo */}
                <img
                    src={`${ASSETS_BASE}/static/icons/financial.png`}
                    alt="Financial Clinic"
                    className="h-10 mx-auto mb-6"
                />

                {status === 'loading' && (
                    <>
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto mb-4" />
                        <p className="text-gray-500">Processing your request...</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="text-green-500 text-5xl mb-4">✓</div>
                        <h1 className="text-xl font-semibold text-gray-800 mb-2">Unsubscribed</h1>
                        <p className="text-gray-500 text-sm mb-4">{message}</p>
                        <p className="text-gray-400 text-xs">
                            You will no longer receive automated reminder emails at{' '}
                            <strong>{email}</strong>.
                        </p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="text-red-400 text-5xl mb-4">✗</div>
                        <h1 className="text-xl font-semibold text-gray-800 mb-2">Oops!</h1>
                        <p className="text-gray-500 text-sm">{message}</p>
                    </>
                )}

                {status === 'idle' && (
                    <p className="text-gray-400 text-sm">Loading...</p>
                )}

                <div className="mt-8 pt-6 border-t border-gray-100">
                    <a
                        href="/"
                        className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        ← Back to home
                    </a>
                </div>
            </div>
        </div>
    );
}

export default function UnsubscribePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" />
            </div>
        }>
            <UnsubscribeContent />
        </Suspense>
    );
}
