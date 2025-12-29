/**
 * FINANCIAL CLINIC API SERVICE - USAGE GUIDE
 * 
 * This guide shows how to use the new API service functions
 * in your React components.
 */

// ==================== IMPORT ====================

import {
  fetchFinancialClinicQuestions,
  calculateFinancialClinicScore,
  submitFinancialClinicSurvey
} from '@/lib/financial-clinic-survey-data';

import type {
  FinancialClinicQuestion,
  FinancialClinicResult,
  FinancialClinicAnswers,
  FinancialClinicProfile
} from '@/lib/financial-clinic-types';


// ==================== EXAMPLE 1: Load Questions ====================

async function loadQuestions(hasChildren: boolean) {
  try {
    const questions = await fetchFinancialClinicQuestions(hasChildren);
    
    console.log(`Loaded ${questions.length} questions`);
    // hasChildren = false → 15 questions (Q16 excluded)
    // hasChildren = true → 16 questions (Q16 included)
    
    return questions;
  } catch (error) {
    console.error('Failed to load questions:', error);
    // Handle error (show toast, retry, etc.)
  }
}


// ==================== EXAMPLE 2: Calculate Score ====================

async function calculateScore(
  answers: FinancialClinicAnswers,
  profile: FinancialClinicProfile
) {
  try {
    const result = await calculateFinancialClinicScore(answers, profile);
    
    console.log('Score:', result.total_score); // 0-100
    console.log('Status:', result.status_band); // "Excellent", "Good", etc.
    console.log('Insights:', result.insights.length); // Max 5
    console.log('Products:', result.products.length); // Max 3
    
    return result;
  } catch (error) {
    console.error('Failed to calculate score:', error);
    // Handle error
  }
}


// ==================== EXAMPLE 3: Submit Survey ====================

async function submitSurvey(
  answers: FinancialClinicAnswers,
  profile: FinancialClinicProfile
) {
  try {
    const result = await submitFinancialClinicSurvey(answers, profile);
    
    console.log('Survey saved with ID:', result.survey_response_id);
    console.log('Score:', result.total_score);
    
    return result;
  } catch (error) {
    console.error('Failed to submit survey:', error);
    // Handle error
  }
}


// ==================== EXAMPLE 4: Complete Survey Flow ====================

export function FinancialClinicSurveyExample() {
  const [questions, setQuestions] = useState<FinancialClinicQuestion[]>([]);
  const [answers, setAnswers] = useState<FinancialClinicAnswers>({});
  const [result, setResult] = useState<FinancialClinicResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Profile from form or context
  const profile: FinancialClinicProfile = {
    nationality: "Emirati",
    gender: "Female",
    children: 2
  };
  
  // Step 1: Load questions on mount
  useEffect(() => {
    const loadQs = async () => {
      setLoading(true);
      try {
        const qs = await fetchFinancialClinicQuestions(profile.children > 0);
        setQuestions(qs);
      } catch (err) {
        setError('Failed to load questions');
      } finally {
        setLoading(false);
      }
    };
    
    loadQs();
  }, [profile.children]);
  
  // Step 2: Handle answer selection
  const handleAnswer = (questionId: string, value: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };
  
  // Step 3: Submit and calculate
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Option A: Just calculate (doesn't save)
      // const res = await calculateFinancialClinicScore(answers, profile);
      
      // Option B: Submit and save to database
      const res = await submitFinancialClinicSurvey(answers, profile);
      
      setResult(res);
      
      // Navigate to results page
      // router.push('/financial-clinic/results');
      
    } catch (err) {
      setError('Failed to submit survey. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <h1>Financial Clinic Survey</h1>
      
      {questions.map((q, index) => (
        <div key={q.id}>
          <h3>Question {q.number} of {questions.length}</h3>
          <p>{q.text_en}</p>
          
          {q.options.map(opt => (
            <label key={opt.value}>
              <input
                type="radio"
                name={q.id}
                value={opt.value}
                checked={answers[q.id] === opt.value}
                onChange={() => handleAnswer(q.id, opt.value)}
              />
              {opt.label_en}
            </label>
          ))}
        </div>
      ))}
      
      <button
        onClick={handleSubmit}
        disabled={Object.keys(answers).length !== questions.length}
      >
        Submit Survey
      </button>
      
      {result && (
        <div>
          <h2>Your Score: {result.total_score}/100</h2>
          <p>Status: {result.status_band}</p>
        </div>
      )}
    </div>
  );
}


// ==================== EXAMPLE 5: Type-Safe Answers ====================

// Build answers object
const answers: FinancialClinicAnswers = {
  "fc_q1": 4,
  "fc_q2": 5,
  "fc_q3": 3,
  // ... rest of answers
};

// Type checking ensures:
// ✅ Keys are strings (question IDs)
// ✅ Values are numbers (1-5)


// ==================== EXAMPLE 6: Error Handling ====================

async function robustCalculate(
  answers: FinancialClinicAnswers,
  profile: FinancialClinicProfile
) {
  try {
    const result = await calculateFinancialClinicScore(answers, profile);
    return { success: true, data: result };
    
  } catch (error: any) {
    // API returned error response
    if (error.message.includes('Failed to fetch')) {
      return { success: false, error: 'Network error. Check your connection.' };
    }
    
    if (error.message.includes('Calculation failed')) {
      return { success: false, error: 'Invalid answers. Please check your responses.' };
    }
    
    return { success: false, error: 'Unexpected error. Please try again.' };
  }
}


// ==================== EXAMPLE 7: Loading States ====================

function SurveyWithLoading() {
  const [state, setState] = useState<{
    questions: FinancialClinicQuestion[];
    loading: boolean;
    error: string | null;
  }>({
    questions: [],
    loading: true,
    error: null
  });
  
  useEffect(() => {
    fetchFinancialClinicQuestions(true)
      .then(questions => setState({ questions, loading: false, error: null }))
      .catch(err => setState({ questions: [], loading: false, error: err.message }));
  }, []);
  
  if (state.loading) {
    return <LoadingSpinner />;
  }
  
  if (state.error) {
    return <ErrorMessage message={state.error} />;
  }
  
  return <QuestionList questions={state.questions} />;
}


// ==================== EXAMPLE 8: Conditional Q16 ====================

function ConditionalQuestion({ children }: { children: number }) {
  const [questions, setQuestions] = useState<FinancialClinicQuestion[]>([]);
  
  useEffect(() => {
    // Backend automatically includes/excludes Q16 based on children > 0
    fetchFinancialClinicQuestions(children > 0)
      .then(setQuestions)
      .catch(console.error);
  }, [children]);
  
  return (
    <div>
      <p>Questions: {questions.length}</p>
      <p>Has Q16: {questions.some(q => q.id === 'fc_q16') ? 'Yes' : 'No'}</p>
    </div>
  );
}


// ==================== NOTES ====================

/**
 * ⚠️ IMPORTANT NOTES:
 * 
 * 1. Backend as Single Source of Truth
 *    - Questions come from backend API (not hardcoded)
 *    - Backend calculates all scores (prevents manipulation)
 *    - Backend controls Q16 conditional logic
 * 
 * 2. Environment Variables
 *    - Set NEXT_PUBLIC_API_URL in .env.local
 *    - Default: http://localhost:8000
 *    - Production: https://your-api.herokuapp.com
 * 
 * 3. Error Handling
 *    - Network errors (backend down)
 *    - Validation errors (invalid answers)
 *    - API errors (server issues)
 * 
 * 4. Response Format
 *    - total_score (not overall_score)
 *    - status_band (not status)
 *    - products (not recommended_products)
 * 
 * 5. Conditional Q16
 *    - Automatically handled by backend
 *    - Pass has_children parameter
 *    - Frontend just renders what backend returns
 */
