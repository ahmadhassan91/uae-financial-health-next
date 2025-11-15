# Guest Results Access - Flow Explanation

## Issue Description
Guest users are seeing a login prompt when they expect to see their results. This happens because they are clicking the wrong buttons or accessing the wrong pages.

## Correct Guest Flow

### ✅ Expected Flow for New Assessment
1. **Start Survey**: User clicks "Start Assessment" on home page
2. **Complete Profile**: User fills out demographic information
3. **Take Survey**: User answers all financial health questions
4. **View Results**: User is automatically redirected to `/results` page
5. **See Scores**: User can view their complete financial health breakdown
6. **Optional Registration**: User can create account to save results

### ❌ Incorrect Flow (Causes Login Prompt)
1. **Click "Access Previous Results"**: This button is for users who already have an account
2. **Go to `/history` directly**: This page requires authentication
3. **Try to access results without completing survey**: No score data available

## Button Clarification

### Home Page Buttons
- **"Start Assessment"** → Goes to survey (✅ Correct for new users)
- **"Access Previous Results"** → Goes to login/history (❌ Not for new users)
- **"View Previous Results"** → Goes to login/history (❌ Not for new users)

### Results Page Buttons (After Survey)
- **"Retake Assessment"** → Start new survey (✅ Works for guests)
- **"View Score History"** → Requires login (✅ Expected behavior)
- **"Create Account"** → Registration form (✅ Works for guests)
- **"Generate Report"** → Requires login (✅ Expected behavior)

## Technical Implementation

### Guest User Can Access:
- `/` - Home page
- `/consent` - Survey consent
- `/profile` - Demographic form
- `/survey` - Assessment questions
- `/results` - Current results (if localStorage has score data)

### Guest User Cannot Access (Requires Login):
- `/history` - Score history
- `/admin` - Admin dashboard
- Report generation features

### Data Storage:
- **Guest Results**: Stored in `localStorage` as `currentScore`
- **Authenticated Results**: Stored in backend database
- **Migration**: Guest data can be saved to account during registration

## Solution

The system is working correctly. The issue is user confusion about which buttons to click:

1. **For New Assessment**: Click "Start Assessment" → Complete survey → See results automatically
2. **For Previous Results**: Click "Access Previous Results" → Login required (expected)

## User Education Needed

Users need to understand:
- "Start Assessment" is for taking a new survey
- "Access Previous Results" is only for users who already have an account
- Results are shown automatically after completing a survey
- Login is only required for accessing history and generating reports