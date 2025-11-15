import { useState, useEffect } from 'react';
import { Question } from '@/lib/types';
import { SURVEY_QUESTIONS_V2 } from '@/lib/survey-data';
import { useLocalization } from '@/contexts/LocalizationContext';

interface LocalizedQuestion {
  id: string;
  text: string;
  options?: Array<{ value: number; label: string }>;
  type: string;
  factor: string;
  weight: number;
  questionNumber: number;
  required: boolean;
}

export function useLocalizedQuestions() {
  const { language } = useLocalization();
  const [questions, setQuestions] = useState<Question[]>(SURVEY_QUESTIONS_V2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (language === 'en') {
      // Use default English questions
      setQuestions(SURVEY_QUESTIONS_V2);
      return;
    }

    // Load Arabic questions from API
    loadLocalizedQuestions();
  }, [language]);

  const loadLocalizedQuestions = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/localization/questions/${language}`);
      
      if (!response.ok) {
        throw new Error(`Failed to load questions: ${response.status}`);
      }

      const localizedQuestions: LocalizedQuestion[] = await response.json();
      
      // Map API response to frontend Question format
      const mappedQuestions: Question[] = localizedQuestions.map(apiQuestion => {
        // Find the corresponding original question for metadata
        const originalQuestion = SURVEY_QUESTIONS_V2.find(
          oq => oq.id === apiQuestion.id
        );

        if (originalQuestion) {
          return {
            ...originalQuestion,
            text: apiQuestion.text,
            options: apiQuestion.options || originalQuestion.options
          };
        }

        // If no original found, create from API data
        return {
          id: apiQuestion.id,
          questionNumber: apiQuestion.questionNumber,
          text: apiQuestion.text,
          type: apiQuestion.type as 'likert',
          options: apiQuestion.options || [],
          required: apiQuestion.required,
          factor: apiQuestion.factor as any,
          weight: apiQuestion.weight
        };
      });

      setQuestions(mappedQuestions);
      console.log(`Loaded ${localizedQuestions.length} localized questions for ${language}`);
      
    } catch (err) {
      console.error('Error loading localized questions:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      // Fallback to English questions
      setQuestions(SURVEY_QUESTIONS_V2);
    } finally {
      setLoading(false);
    }
  };

  return {
    questions,
    loading,
    error,
    refresh: loadLocalizedQuestions
  };
}