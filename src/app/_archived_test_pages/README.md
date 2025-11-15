# Archived Test Pages

**Date Archived**: October 16, 2025  
**Reason**: Legacy test pages from v1 survey system development

---

## What's Here

This directory contains 26+ test pages that were created during the development of the original (v1) survey system. These pages are no longer needed now that:

1. **Financial Clinic (v2)** is implemented with proper structure at `/financial-clinic/*`
2. **Backend API** is the single source of truth
3. **Proper integration testing** is in place

---

## Archived Pages

These pages were used for testing various features during development:

- `test-arabic-questions/` - Arabic translation testing
- `test-admin-api/` - Admin API testing
- `test-auth-error/` - Authentication error handling
- `test-backend-integration/` - Backend integration testing
- `test-enhanced-localization/` - Localization testing
- `test-guest-registration/` - Guest registration flow
- `test-homepage-layout/` - Homepage layout testing
- `test-logos/` - Logo display testing
- `test-production-error-handling/` - Error handling
- `test-profile-form/` - Profile form testing
- `test-question-manager/` - Question management
- `test-results-localization/` - Results page localization
- `test-results-page/` - Results page testing
- `test-rtl/` - RTL (Right-to-Left) testing
- `test-score-calculation/` - Score calculation testing
- `test-score-display-consistency/` - Score display testing
- `test-score-history/` - Score history testing
- `test-score-history-edge-cases/` - Edge case testing
- `test-score-history-fixed/` - Score history fixes
- `test-score-result-fix/` - Score result fixes
- `test-scoring-validation/` - Scoring validation
- `test-simple-auth/` - Simple authentication testing
- `test-simple-auth-integration/` - Auth integration
- `test-survey-flow/` - Survey flow testing
- `test-unified-localization/` - Unified localization testing
- `test-user-scenarios/` - User scenario testing

---

## Current Test Structure

### Production Pages
- `/financial-clinic` - Profile/Landing page
- `/financial-clinic/survey` - Survey flow (15-16 questions)
- `/financial-clinic/results` - Results display

### Testing
- Backend API tests: `/backend/test_financial_clinic_api.py`
- Frontend API tests: `/frontend/test-financial-clinic-api.js`
- Testing guide: `/FINANCIAL_CLINIC_TESTING_GUIDE.md`

---

## Can These Be Deleted?

**Yes**, but we archived them instead of deleting because:
1. **Reference**: May contain useful code snippets
2. **Documentation**: Shows development history
3. **Safety**: Easy to restore if needed

**To permanently delete:**
```bash
rm -rf /Users/clustox_1/Documents/uae-financial-health/frontend/src/app/_archived_test_pages
```

---

## Migration Notes

All functionality from these test pages has been properly implemented in:
- Production pages: `/financial-clinic/*`
- Backend API: `/backend/app/surveys/financial_clinic_*`
- Proper components: `/frontend/src/components/FinancialClinic*`

No functionality was lost - everything was properly migrated to the new structure.
