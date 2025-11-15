import { Question, FinancialFactor } from './types';

export const SURVEY_QUESTIONS_V2: Question[] = [
  {
    id: 'q1_income_stability',
    questionNumber: 1,
    text: 'My income is stable and predictable each month.',
    type: 'likert',
    options: [
      { value: 5, label: 'Strongly Agree' },
      { value: 4, label: 'Agree' },
      { value: 3, label: 'Neutral' },
      { value: 2, label: 'Disagree' },
      { value: 1, label: 'Strongly Disagree' }
    ],
    required: true,
    factor: 'income_stream',
    weight: 10
  },
  {
    id: 'q2_income_sources',
    questionNumber: 2,
    text: 'I have more than one source of income (e.g., side business, investments).',
    type: 'likert',
    options: [
      { value: 5, label: 'Multiple consistent income streams' },
      { value: 4, label: 'Multiple inconsistent income streams' },
      { value: 3, label: 'I have a consistent side income' },
      { value: 2, label: 'A non consistent side income' },
      { value: 1, label: 'My Salary' }
    ],
    required: true,
    factor: 'income_stream',
    weight: 10
  },
  {
    id: 'q3_living_expenses',
    questionNumber: 3,
    text: 'I can cover my essential living expenses without financial strain.',
    type: 'likert',
    options: [
      { value: 5, label: 'Strongly Agree' },
      { value: 4, label: 'Agree' },
      { value: 3, label: 'Neutral' },
      { value: 2, label: 'Disagree' },
      { value: 1, label: 'Strongly Disagree' }
    ],
    required: true,
    factor: 'monthly_expenses',
    weight: 10
  },
  {
    id: 'q4_budget_tracking',
    questionNumber: 4,
    text: 'I follow a monthly budget and track my expenses.',
    type: 'likert',
    options: [
      { value: 5, label: 'Consistently every month' },
      { value: 4, label: 'Frequently but not consistently' },
      { value: 3, label: 'Occasionally' },
      { value: 2, label: 'Adhoc' },
      { value: 1, label: 'No Tracking' }
    ],
    required: true,
    factor: 'monthly_expenses',
    weight: 5
  },
  {
    id: 'q5_spending_control',
    questionNumber: 5,
    text: 'I spend less than I earn every month.',
    type: 'likert',
    options: [
      { value: 5, label: 'Consistently every month' },
      { value: 4, label: 'Frequently but not consistently' },
      { value: 3, label: 'Occasionally' },
      { value: 2, label: 'Adhoc' },
      { value: 1, label: 'Greater or all of my earnings' }
    ],
    required: true,
    factor: 'monthly_expenses',
    weight: 5
  },
  {
    id: 'q6_expense_review',
    questionNumber: 6,
    text: 'I regularly review and reduce unnecessary expenses.',
    type: 'likert',
    options: [
      { value: 5, label: 'Consistently every month' },
      { value: 4, label: 'Frequently but not consistently' },
      { value: 3, label: 'Occasionally' },
      { value: 2, label: 'Adhoc' },
      { value: 1, label: 'No Tracking' }
    ],
    required: true,
    factor: 'monthly_expenses',
    weight: 5
  },
  {
    id: 'q7_savings_rate',
    questionNumber: 7,
    text: 'I save from my income every month.',
    type: 'likert',
    options: [
      { value: 5, label: '20% or more' },
      { value: 4, label: 'Less than 20%' },
      { value: 3, label: 'Less than 10%' },
      { value: 2, label: '5% or less' },
      { value: 1, label: '0%' }
    ],
    required: true,
    factor: 'savings_habit',
    weight: 5
  },
  {
    id: 'q8_emergency_fund',
    questionNumber: 8,
    text: 'I have an emergency fund to cater for my expenses.',
    type: 'likert',
    options: [
      { value: 5, label: '6+ months' },
      { value: 4, label: '3 - 6 months' },
      { value: 3, label: '2 months' },
      { value: 2, label: '1 month' },
      { value: 1, label: 'Nil' }
    ],
    required: true,
    factor: 'savings_habit',
    weight: 5
  },
  {
    id: 'q9_savings_optimization',
    questionNumber: 9,
    text: 'I keep my savings in safe, return generating accounts or investments.',
    type: 'likert',
    options: [
      { value: 5, label: 'Safe | Seek for return optimization consistently' },
      { value: 4, label: 'Safe | Seek for return optimization most of the times' },
      { value: 3, label: 'Savings Account with minimal returns' },
      { value: 2, label: 'Current Account' },
      { value: 1, label: 'Cash' }
    ],
    required: true,
    factor: 'savings_habit',
    weight: 5
  },
  {
    id: 'q10_payment_history',
    questionNumber: 10,
    text: 'I pay all my bills and loan installments on time.',
    type: 'likert',
    options: [
      { value: 5, label: 'Consistently every month' },
      { value: 4, label: 'Frequently but not consistently' },
      { value: 3, label: 'Occasionally' },
      { value: 2, label: 'Adhoc' },
      { value: 1, label: 'Missed Payments most of the times' }
    ],
    required: true,
    factor: 'debt_management',
    weight: 5
  },
  {
    id: 'q11_debt_ratio',
    questionNumber: 11,
    text: 'My debt repayments are less than 30% of my monthly income.',
    type: 'likert',
    options: [
      { value: 5, label: 'No Debt' },
      { value: 4, label: '20% or less of monthly income' },
      { value: 3, label: 'Less than 30% of monthly income' },
      { value: 2, label: '30% or more of monthly income' },
      { value: 1, label: '50% or more of monthly income' }
    ],
    required: true,
    factor: 'debt_management',
    weight: 5
  },
  {
    id: 'q12_credit_score',
    questionNumber: 12,
    text: 'I understand my credit score and actively maintain or improve it.',
    type: 'likert',
    options: [
      { value: 5, label: '100% and monitor it consistently' },
      { value: 4, label: '100% and monitor it frequently' },
      { value: 3, label: 'somewhat understand and frequent monitoring' },
      { value: 2, label: 'somewhat understand and maintain on an adhoc basis' },
      { value: 1, label: 'No Understanding and not maintained' }
    ],
    required: true,
    factor: 'debt_management',
    weight: 5
  },
  {
    id: 'q13_retirement_planning',
    questionNumber: 13,
    text: 'I have a retirement savings plan or pension fund in place to secure a stable income at retirement.',
    type: 'likert',
    options: [
      { value: 5, label: 'Yes - I have already secured a stable income' },
      { value: 4, label: 'Yes - I am highly confident of having a stable income' },
      { value: 3, label: 'Yes - I am somewhat confident of having a stable income' },
      { value: 2, label: 'No: Planning to have one shortly | adhoc Savings' },
      { value: 1, label: 'No: not for the time being' }
    ],
    required: true,
    factor: 'retirement_planning',
    weight: 10
  },
  {
    id: 'q14_insurance_coverage',
    questionNumber: 14,
    text: 'I have adequate takaful cover (insurance) - (health, life, motor, property).',
    type: 'likert',
    options: [
      { value: 5, label: '100% adequate cover in place for the required protection' },
      { value: 4, label: '80% cover in place for the required protection' },
      { value: 3, label: '50% cover in place for the required protection' },
      { value: 2, label: '25% cover in place for the required protection' },
      { value: 1, label: 'No Coverage' }
    ],
    required: true,
    factor: 'protection',
    weight: 5
  },
  {
    id: 'q15_financial_planning',
    questionNumber: 15,
    text: 'I have a written financial plan with goals for the next 3–5 years catering.',
    type: 'likert',
    options: [
      { value: 5, label: 'Concise Financial plan in place and consistently reviewed' },
      { value: 4, label: 'Broad Financial plan in place and frequently reviewed' },
      { value: 3, label: 'High level objectives set and occasionally reviewed' },
      { value: 2, label: 'Adhoc Plan | reviews' },
      { value: 1, label: 'No Financial Plan in place' }
    ],
    required: true,
    factor: 'future_planning',
    weight: 5
  },
  {
    id: 'q16_children_planning',
    questionNumber: 16,
    text: 'I have adequately planned my children future for his school | University | Career Start Up.',
    type: 'likert',
    options: [
      { value: 5, label: '100% adequate savings in place for all 3 Aspects' },
      { value: 4, label: '80% savings in place for all 3 Aspects' },
      { value: 3, label: '50% savings in place for all 3 Aspects' },
      { value: 2, label: 'Adhoc plan in place for all 3 Aspects' },
      { value: 1, label: 'No Plan in place' }
    ],
    required: false, // Conditional based on having children
    factor: 'future_planning',
    weight: 5,
    conditional: true
  }
];

// Total weights: 15 questions × 5% + 1 question × 10% = 100%
// If Q16 applies: total possible score becomes 80 instead of 75

export const PILLAR_DEFINITIONS = {
  income_stream: {
    name: 'Income Stream',
    description: 'Stability and diversity of income sources',
    questions: ['q1_income_stability', 'q2_income_sources']
  },
  monthly_expenses: {
    name: 'Monthly Expenses Management',
    description: 'Budgeting and expense control',
    questions: ['q3_living_expenses', 'q6_expense_review']
  },
  savings_habit: {
    name: 'Savings Habit',
    description: 'Saving behavior and emergency preparedness',
    questions: ['q7_savings_rate', 'q9_savings_optimization']
  },
  debt_management: {
    name: 'Debt Management',
    description: 'Debt control and credit health',
    questions: ['q10_payment_history', 'q12_credit_score']
  },
  retirement_planning: {
    name: 'Retirement Planning',
    description: 'Long-term financial security',
    questions: ['q13_retirement_planning']
  },
  protection: {
    name: 'Protecting Your Assets | Loved Ones',
    description: 'Insurance and risk management',
    questions: ['q14_insurance_coverage']
  },
  future_planning: {
    name: 'Planning for Your Future | Siblings',
    description: 'Financial planning and family preparation',
    questions: ['q15_financial_planning', 'q16_children_planning']
  }
} as const;