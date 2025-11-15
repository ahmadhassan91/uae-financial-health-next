'use client';

import React from 'react';
import CompanyQuestionManager from '@/components/admin/CompanyQuestionManager';

export default function TestQuestionManagerPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Test Question Manager</h1>
        <p className="text-muted-foreground">
          Testing the enhanced company question management interface
        </p>
      </div>
      
      <CompanyQuestionManager 
        companyId={1} 
        companyName="Test Company Inc" 
      />
    </div>
  );
}