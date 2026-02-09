# CRM API Integration Plan

## Overview
This document outlines the technical plan for integrating the Financial Clinic platform with the client's Microsoft Dynamics CRM. The integration will expose a secure, pull-based API endpoint that provides "Consolidated Report" data (Submissions, Leads, Incomplete Surveys) in JSON format.

## API Specification

**Endpoint:** `GET /api/v1/crm/consolidated-data`
**Method:** `GET`
**Authentication:** Bearer Token (Service Account / API Key)
**Header:** `Authorization: Bearer <YOUR_API_TOKEN>`

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| [date_range](file:///Users/clustox_1/Documents/uae-financial-health/backend/app/admin/utils.py#24-82) | string | No | Filter by pre-defined range (e.g., `today`, `yesterday`, `last_7_days`). Default: `today` (delta updates). |
| `start_date` | date | No | Custom start date (YYYY-MM-DD). |
| `end_date` | date | No | Custom end date (YYYY-MM-DD). |
| `limit` | int | No | Max records to return (Default: 1000). |
| `offset` | int | No | Pagination offset. |

## JSON Response Structure
The response will be a JSON array of objects, where each object corresponds to a row in the Consolidated Export CSV.

```json
{
  "meta": {
    "total_count": 142,
    "timestamp": "2026-02-04T14:30:00Z"
  },
  "data": [
    {
      "id": 12345,
      "type": "Submitted", // Options: "Submitted", "Lead", "Incomplete"
      "name": "John Doe",
      "email": "john.doe@example.com",
      "mobile_number": "+971 50 123 4567",
      "age": 34,
      "gender": "Male",
      "nationality": "Pakistan",
      "emirate": "Dubai",
      "children": "2",
      "employment_status": "Employed",
      "income_range": "15,000 - 20,000",
      "company": "Microsoft",
      "unique_url": "microsoft",
      "scores": {
        "total_score": 78.5,
        "status_band": "Financially Healthy",
        "income_stream": 80,
        "savings_habit": 70,
        "debt_management": 90,
        "retirement_planning": 60,
        "financial_protection": 85,
        "financial_knowledge": 75
      },
      "engagement": {
        "questions_answered": 15,
        "total_questions": 15,
        "completion_percentage": 100,
        "leads_requested": "Y"
      },
      "action_plans": {
        "plan_1": "Start an emergency fund...",
        "plan_2": "Review debt consolidation...",
        "plan_3": "Maximize employer pension...",
        "plan_4": "Consider term life insurance...",
        "plan_5": "Read about compound interest..."
      },
      "consultation": {
        "status": "Pending",
        "source": "Survey",
        "preferred_method": "Phone",
        "preferred_time": "Morning",
        "message": "Please call me.",
        "created_at": "2026-02-04T10:00:00Z",
        "scheduled_at": null
      },
      "timestamps": {
        "submission_date": "2026-02-04T09:45:00Z"
      }
    }
  ]
}
```

## Mapping Table (CSV Header -> JSON Key)
| CSV Header | JSON Key |
|------------|----------|
| ID | [id](file:///Users/clustox_1/Documents/uae-financial-health/frontend/src/lib/admin-api.ts#542-557) |
| Name | `name` |
| Email | `email` |
| Company | [company](file:///Users/clustox_1/Documents/uae-financial-health/backend/app/companies/details_routes.py#620-647) |
| Unique URL | [unique_url](file:///Users/clustox_1/Documents/uae-financial-health/backend/app/admin/simple_routes.py#2479-2596) |
| Total Score | `scores.total_score` |
| Status Band | `scores.status_band` |
| Action Plan 1 | `action_plans.plan_1` |
| Status | `type` (Note: Mapped to 'Submitted' or 'Incomplete') |

## Implementation Steps

1.  **Define Pydantic Models:** Create schema definitions for the JSON response to ensure type safety and documentation.
2.  **Create API Router:** Add `api/v1/crm.py` router.
3.  **Implement Auth Dependency:** Create `get_api_key` dependency to validate Bearer tokens against a secure store (Env var `CRM_API_KEY` for MVP).
4.  **Refactor Export Logic:** Extract the data fetching logic from [ConsolidatedExportService](file:///Users/clustox_1/Documents/uae-financial-health/backend/app/admin/services/consolidated_export.py#15-321) into a reusable `DataService` that returns Python objects/dictionaries instead of writing directly to CSV.
5.  **Build Endpoint:** Use the `DataService` to fetch data and return it via the Pydantic models.
6.  **Test:** verify output matches CSV data exactly.
