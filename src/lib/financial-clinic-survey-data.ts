/**
 * Financial Clinic Survey Data Service
 *
 * ⚠️ BEST PRACTICE: Single Source of Truth = Backend
 *
 * Instead of hardcoding questions here, we fetch them from the backend API.
 * This ensures:
 * - Questions can be updated without deploying frontend
 * - Consistency across all clients
 * - Backend controls question logic and conditional rendering
 * - Prevents client-side score manipulation
 * - Enables backend updates without frontend redeployment
 *
 * API Endpoints:
 * - GET /financial-clinic/questions?has_children={boolean} - Fetch questions
 * - POST /financial-clinic/calculate - Calculate score, insights, products
 * - POST /financial-clinic/submit - Submit and save survey
 */

import type {
  FinancialClinicQuestion,
  FinancialClinicResult,
  FinancialClinicAnswers,
} from "./financial-clinic-types";

// Next.js environment variable (use NEXT_PUBLIC_ prefix for client-side access)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Fetch Financial Clinic questions from backend
 * @param childrenCount Number of children (0 = no children, affects Q15 conditional)
 * @returns Array of questions from backend (14 or 15 questions)
 */
export async function fetchFinancialClinicQuestions(
  childrenCount: number = 0
): Promise<FinancialClinicQuestion[]> {
  try {
    // Check if there's a company URL in the page URL parameter
    const companyUrl =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("company")
        : null;

    // Build URL with company parameter if available
    let url = `${API_BASE_URL}/financial-clinic/questions?children=${childrenCount}`;
    if (companyUrl) {
      url += `&company_url=${encodeURIComponent(companyUrl)}`;
      console.log(
        "📋 Fetching questions with company variation set:",
        companyUrl
      );
    }
    
    // Add timestamp to break caching
    url += `&_t=${Date.now()}`;

    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch questions: ${response.statusText}`);
    }

    const questions = await response.json();
    console.log(
      `✅ Loaded ${questions.length} questions${
        companyUrl ? " with company variations" : ""
      }`
    );

    return questions;
  } catch (error) {
    console.error("Error fetching Financial Clinic questions:", error);
    throw error;
  }
}

/**
 * Calculate Financial Clinic score, insights, and product recommendations
 * Backend handles all scoring logic to prevent client-side manipulation
 * @param answers User's survey answers
 * @param profile User's demographic profile
 * @returns Complete results with score, insights, and products
 */
export async function calculateFinancialClinicScore(
  answers: FinancialClinicAnswers,
  profile: {
    nationality: string;
    gender?: string;
    children: number;
  }
): Promise<FinancialClinicResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/financial-clinic/calculate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ answers, profile }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.detail || `Calculation failed: ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error calculating Financial Clinic score:", error);
    throw error;
  }
}

/**
 * Submit Financial Clinic survey and save to database
 * @param answers User's survey answers
 * @param profile User's demographic profile
 * @returns Saved survey response with ID
 */
export async function submitFinancialClinicSurvey(
  answers: FinancialClinicAnswers,
  profile: {
    nationality: string;
    gender?: string;
    children: number;
  }
): Promise<
  FinancialClinicResult & {
    survey_response_id?: number;
    company_tracked?: boolean;
  }
> {
  try {
    // Check if there's a company URL in the page URL parameter
    // This is better than sessionStorage because it survives page refresh
    const companyUrl =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("company")
        : null;

    const payload: any = {
      answers,
      profile,
    };

    // Add company tracking if available
    if (companyUrl) {
      payload.company_url = companyUrl;
      console.log("Submitting with company tracking:", companyUrl);
    }

    const response = await fetch(`${API_BASE_URL}/financial-clinic/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorMessage = `Submission failed: ${response.statusText}`;
      try {
        const errorData = await response.json();
        console.error("❌ Server error details:", errorData);
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch (parseError) {
        console.error("❌ Could not parse error response:", parseError);
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();

    // No need to clear anything - URL parameter persists naturally
    // If user wants to do another assessment for the same company, the parameter stays
    // If they navigate away normally, the parameter is gone

    return result;
  } catch (error) {
    console.error("Error submitting Financial Clinic survey:", error);
    throw error;
  }
}
