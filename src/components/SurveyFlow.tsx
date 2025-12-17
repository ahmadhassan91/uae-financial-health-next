import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowRight } from '@phosphor-icons/react';
import { PILLAR_DEFINITIONS } from '../lib/survey-data';
import { Question, CustomerProfile } from '../lib/types';
import { useLocalization } from '@/contexts/LocalizationContext';
import { useLocalizedQuestions } from '@/hooks/use-localized-questions';
import { LanguageSelector } from './LanguageSelector';

interface SurveyFlowProps {
  currentStep: number;
  customerProfile: CustomerProfile;
  onStepChange: (step: number) => void;
  onResponse: (questionId: string, value: number) => void;
  getResponse: (questionId: string) => number | undefined;
  onComplete: () => void;
}

export function SurveyFlow({ currentStep, customerProfile, onStepChange, onResponse, getResponse, onComplete }: SurveyFlowProps) {
  const { t, isRTL } = useLocalization();
  const { questions: localizedQuestions, loading: questionsLoading, error: questionsError } = useLocalizedQuestions();
  
  // Filter questions based on conditional logic (Q16 only shows if user has children)
  const availableQuestions = localizedQuestions.filter(question => {
    if (question.id === 'q16_children_planning') {
      return customerProfile.children === 'Yes';
    }
    return true;
  });

  const totalSteps = availableQuestions.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const currentQuestion = availableQuestions[currentStep];
  const currentResponse = getResponse(currentQuestion?.id);

  const canContinue = currentResponse !== undefined;
  const isLastQuestion = currentStep === totalSteps - 1;

  // Show loading state while questions are being loaded
  if (questionsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
        <div className="container mx-auto max-w-2xl py-8">
          <Card className="shadow-lg border-none">
            <CardContent className="p-8">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5E5E5E] mr-3"></div>
                <span>{t('loading')}...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show error state if questions failed to load
  if (questionsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
        <div className="container mx-auto max-w-2xl py-8">
          <Card className="shadow-lg border-none">
            <CardContent className="p-8">
              <div className="text-center">
                <p className="text-red-600 mb-4">{t('error_loading_questions')}</p>
                <p className="text-sm text-muted-foreground">{questionsError}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Return early if no questions available
  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
        <div className="container mx-auto max-w-2xl py-8">
          <Card className="shadow-lg border-none">
            <CardContent className="p-8">
              <div className="text-center">
                <p className="text-muted-foreground">No questions available</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleNext = (e?: React.MouseEvent) => {
    e?.preventDefault(); // Prevent any form submission
    
    if (isLastQuestion) {
      onComplete();
    } else {
      onStepChange(currentStep + 1);
    }
  };

  const handlePrevious = (e?: React.MouseEvent) => {
    e?.preventDefault(); // Prevent any form submission
    
    if (currentStep > 0) {
      onStepChange(currentStep - 1);
    }
  };  const renderQuestionInput = (question: Question) => {
    const value = getResponse(question.id);

    return (
      <div className="space-y-4">
        <RadioGroup
          value={value?.toString() || ''}
          onValueChange={(val) => onResponse(question.id, parseInt(val))}
          className="space-y-2"
        >
          {question.options.map((option) => (
            <div key={option.value} className={`flex items-center p-3 rounded-lg border border-border hover:bg-accent/30 transition-colors group ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
              <RadioGroupItem 
                value={option.value.toString()} 
                id={`${question.id}-${option.value}`}
                className="shrink-0"
              />
              <Label 
                htmlFor={`${question.id}-${option.value}`} 
                className={`text-sm leading-relaxed cursor-pointer flex-1 group-hover:text-accent-foreground ${isRTL ? 'text-right' : 'text-left'}`}
              >
                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs ${isRTL ? 'ml-3' : 'mr-3'}`}>
                  {option.value}
                </span>
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
        
        {/* Compact Likert Scale Legend */}
        <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-dashed">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span><strong>1</strong> Strongly Disagree</span>
            <span><strong>2</strong> Disagree</span>
            <span><strong>3</strong> Neutral</span>
            <span><strong>4</strong> Agree</span>
            <span><strong>5</strong> Strongly Agree</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
      <div className="container mx-auto max-w-2xl py-8">
        {/* Progress Header */}
        <div className="mb-8">
          <div className={`flex justify-between items-center mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <h1 className={`text-2xl font-bold ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('financial_health_assessment')}
            </h1>
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <LanguageSelector variant="icon-only" />
              <span className="text-sm text-muted-foreground">
                {currentStep + 1} {t('of')} {totalSteps}
              </span>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="shadow-lg border-none">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shrink-0">
                  {currentQuestion.id.match(/Q(\d+)/)?.[1] || (currentStep + 1)}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg leading-tight">
                    {currentQuestion.text}
                  </CardTitle>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-primary/60"></div>
                      {PILLAR_DEFINITIONS[currentQuestion.factor]?.name || 'General'}
                    </span>
                    <span>Weight: {currentQuestion.weight}%</span>
                  </div>
                </div>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                {currentStep + 1} / {totalSteps}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {renderQuestionInput(currentQuestion)}
            
            {/* Navigation */}
            <div className={`flex justify-between pt-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <ArrowLeft className={`w-4 h-4 ${isRTL ? 'transform-rtl' : ''}`} />
                {t('previous_question')}
              </Button>
              
              <Button
                type="button"
                onClick={handleNext}
                disabled={!canContinue}
                className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                {isLastQuestion ? t('complete_assessment') : t('next_question')}
                {!isLastQuestion && <ArrowRight className={`w-4 h-4 ${isRTL ? 'transform-rtl' : ''}`} />}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Progress Overview */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Progress Overview</CardTitle>
              <CardDescription>
                {availableQuestions.length} questions total
                {customerProfile.children === 'No' && ' (Q16 skipped - no children)'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                {availableQuestions.map((question, index) => {
                  const isCompleted = getResponse(question.id) !== undefined;
                  const isCurrent = index === currentStep;
                  const questionNumber = question.id.match(/Q(\d+)/)?.[1] || (index + 1).toString();
                  
                  return (
                    <div key={question.id} className="flex flex-col items-center">
                      <button
                        onClick={() => onStepChange(index)}
                        className={`
                          w-10 h-10 rounded-full text-sm font-bold transition-all duration-200 flex items-center justify-center relative
                          ${isCurrent 
                            ? 'bg-primary text-primary-foreground shadow-lg scale-110' 
                            : isCompleted 
                              ? 'bg-green-500 text-white hover:bg-green-600' 
                              : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:scale-105'
                          }
                        `}
                      >
                        {isCompleted && !isCurrent && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-600 text-white rounded-full flex items-center justify-center text-xs">
                            ✓
                          </div>
                        )}
                        {questionNumber}
                      </button>
                      <span className="text-xs text-muted-foreground mt-1 text-center">
                        {PILLAR_DEFINITIONS[question.factor]?.name.split(' ')[0] || 'General'}
                      </span>
                    </div>
                  );
                })}
              </div>
              
              {/* Legend */}
              <div className="flex justify-center gap-6 mt-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  <span>Current</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>Completed</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-muted"></div>
                  <span>Pending</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}