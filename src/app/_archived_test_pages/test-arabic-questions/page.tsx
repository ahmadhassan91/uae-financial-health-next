'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocalizedQuestions } from '@/hooks/use-localized-questions';
import { useLocalization } from '@/contexts/LocalizationContext';

export default function TestArabicQuestionsPage() {
  const { language, setLanguage } = useLocalization();
  const { questions, loading, error, refresh } = useLocalizedQuestions();

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Test Arabic Questions</CardTitle>
          <div className="flex gap-2">
            <Button 
              variant={language === 'en' ? 'default' : 'outline'}
              onClick={() => setLanguage('en')}
            >
              English
            </Button>
            <Button 
              variant={language === 'ar' ? 'default' : 'outline'}
              onClick={() => setLanguage('ar')}
            >
              العربية
            </Button>
            <Button variant="outline" onClick={refresh}>
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <strong>Current Language:</strong> {language}
            </div>
            
            {loading && (
              <div className="text-blue-600">Loading questions...</div>
            )}
            
            {error && (
              <div className="text-red-600">Error: {error}</div>
            )}
            
            <div>
              <strong>Questions loaded:</strong> {questions.length}
            </div>
            
            {questions.slice(0, 3).map((question, index) => (
              <Card key={question.id} className="border-l-4 border-l-blue-500">
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div><strong>ID:</strong> {question.id}</div>
                    <div><strong>Text:</strong> {question.text}</div>
                    <div><strong>Options:</strong></div>
                    <ul className="list-disc list-inside ml-4">
                      {question.options.map((option) => (
                        <li key={option.value}>
                          {option.value}: {option.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {questions.length > 3 && (
              <div className="text-muted-foreground">
                ... and {questions.length - 3} more questions
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}