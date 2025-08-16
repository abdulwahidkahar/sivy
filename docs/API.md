# SIVY API Documentation

## Overview

SIVY provides a RESTful API for managing resume analysis, job roles, and candidate data. The API is built with Laravel and uses JSON for data exchange.

## Base URL

```
Production: https://your-domain.com/api
Development: http://localhost:8000/api
```

## Authentication

SIVY uses Laravel Sanctum for API authentication. All API requests require authentication except for public endpoints.

### Authentication Flow

1. **Login to get session cookie:**
   ```http
   POST /login
   Content-Type: application/json
   
   {
     "email": "user@example.com",
     "password": "password"
   }
   ```

2. **Include CSRF token in subsequent requests:**
   ```http
   X-CSRF-TOKEN: your-csrf-token
   ```

3. **Logout:**
   ```http
   POST /logout
   ```

## Response Format

All API responses follow a consistent JSON format:

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {
      // Additional error details
    }
  }
}
```

### Validation Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The given data was invalid.",
    "details": {
      "field_name": [
        "Validation error message"
      ]
    }
  }
}
```

## HTTP Status Codes

| Code | Description |
|------|-------------|
| 200  | OK - Request successful |
| 201  | Created - Resource created successfully |
| 204  | No Content - Request successful, no content returned |
| 400  | Bad Request - Invalid request data |
| 401  | Unauthorized - Authentication required |
| 403  | Forbidden - Access denied |
| 404  | Not Found - Resource not found |
| 422  | Unprocessable Entity - Validation failed |
| 429  | Too Many Requests - Rate limit exceeded |
| 500  | Internal Server Error - Server error |

## Endpoints

### Roles

#### List All Roles
```http
GET /roles
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Senior Frontend Developer",
      "slug": "senior-frontend-developer",
      "requirement": "5+ years React experience...",
      "culture": "Collaborative team player...",
      "analyses_count": 15,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### Create Role
```http
POST /roles
Content-Type: application/json

{
  "name": "Senior Backend Developer",
  "requirement": "5+ years PHP/Laravel experience, strong database skills",
  "culture": "Team player with strong communication skills"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Senior Backend Developer",
    "slug": "senior-backend-developer",
    "requirement": "5+ years PHP/Laravel experience...",
    "culture": "Team player with strong communication skills",
    "created_at": "2024-01-15T11:00:00Z",
    "updated_at": "2024-01-15T11:00:00Z"
  },
  "message": "Role created successfully"
}
```

#### Get Role
```http
GET /roles/{id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Senior Frontend Developer",
    "slug": "senior-frontend-developer",
    "requirement": "5+ years React experience...",
    "culture": "Collaborative team player...",
    "analyses": [
      {
        "id": 1,
        "status": "completed",
        "technical_score": 85,
        "culture_score": 78,
        "resume": {
          "id": 1,
          "original_filename": "john_doe_resume.pdf"
        }
      }
    ],
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

#### Update Role
```http
PUT /roles/{id}
Content-Type: application/json

{
  "name": "Senior Frontend Developer (Updated)",
  "requirement": "Updated requirements...",
  "culture": "Updated culture criteria..."
}
```

#### Delete Role
```http
DELETE /roles/{id}
```

**Response:**
```json
{
  "success": true,
  "message": "Role deleted successfully"
}
```

### Resumes

#### Upload Resume
```http
POST /resumes
Content-Type: multipart/form-data

file: [PDF file]
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "original_filename": "john_doe_resume.pdf",
    "storage_path": "resumes/2024/01/15/abc123.pdf",
    "user_id": 1,
    "created_at": "2024-01-15T12:00:00Z",
    "updated_at": "2024-01-15T12:00:00Z"
  },
  "message": "Resume uploaded successfully"
}
```

### Analyses

#### List All Analyses
```http
GET /analyses
```

**Query Parameters:**
- `role_id` (optional): Filter by role ID
- `status` (optional): Filter by status (pending, processing, completed, failed)
- `recruitment_status` (optional): Filter by recruitment status
- `page` (optional): Page number for pagination
- `per_page` (optional): Items per page (default: 15)

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "status": "completed",
        "recruitment_status": "new",
        "technical_score": 85,
        "culture_score": 78,
        "summary": "Strong technical background with good cultural fit...",
        "resume": {
          "id": 1,
          "original_filename": "john_doe_resume.pdf",
          "user": {
            "id": 1,
            "name": "John Doe",
            "email": "john@example.com"
          }
        },
        "role": {
          "id": 1,
          "name": "Senior Frontend Developer"
        },
        "skills": [
          {
            "id": 1,
            "name": "React"
          },
          {
            "id": 2,
            "name": "TypeScript"
          }
        ],
        "created_at": "2024-01-15T12:30:00Z",
        "updated_at": "2024-01-15T13:00:00Z"
      }
    ],
    "current_page": 1,
    "last_page": 3,
    "per_page": 15,
    "total": 42
  }
}
```

#### Get Analysis
```http
GET /analyses/{id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "completed",
    "recruitment_status": "new",
    "technical_score": 85,
    "culture_score": 78,
    "summary": "Strong technical background with excellent React skills...",
    "justification": {
      "technical": {
        "strengths": [
          "5+ years React experience",
          "Strong TypeScript skills",
          "Experience with modern tooling"
        ],
        "weaknesses": [
          "Limited backend experience",
          "No mobile development experience"
        ]
      },
      "cultural": {
        "strengths": [
          "Team collaboration experience",
          "Open source contributions"
        ],
        "concerns": [
          "Limited leadership experience"
        ]
      }
    },
    "resume": {
      "id": 1,
      "original_filename": "john_doe_resume.pdf",
      "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com"
      }
    },
    "role": {
      "id": 1,
      "name": "Senior Frontend Developer",
      "requirement": "5+ years React experience...",
      "culture": "Collaborative team player..."
    },
    "skills": [
      {
        "id": 1,
        "name": "React"
      },
      {
        "id": 2,
        "name": "TypeScript"
      }
    ],
    "created_at": "2024-01-15T12:30:00Z",
    "updated_at": "2024-01-15T13:00:00Z"
  }
}
```

#### Start Analysis
```http
POST /roles/{role_id}/start-analysis
Content-Type: application/json

{
  "resume_ids": [1, 2, 3]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "analyses_created": 3,
    "analyses": [
      {
        "id": 1,
        "status": "pending",
        "resume_id": 1,
        "role_id": 1
      },
      {
        "id": 2,
        "status": "pending",
        "resume_id": 2,
        "role_id": 1
      },
      {
        "id": 3,
        "status": "pending",
        "resume_id": 3,
        "role_id": 1
      }
    ]
  },
  "message": "Analysis started for 3 resumes"
}
```

### Candidates

#### List All Candidates
```http
GET /candidates
```

**Query Parameters:**
- `role_id` (optional): Filter by role ID
- `min_technical_score` (optional): Minimum technical score
- `min_culture_score` (optional): Minimum culture score
- `recruitment_status` (optional): Filter by recruitment status
- `search` (optional): Search by candidate name or email
- `page` (optional): Page number for pagination
- `per_page` (optional): Items per page (default: 15)

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "analyses": [
          {
            "id": 1,
            "technical_score": 85,
            "culture_score": 78,
            "recruitment_status": "new",
            "role": {
              "id": 1,
              "name": "Senior Frontend Developer"
            }
          }
        ]
      }
    ],
    "current_page": 1,
    "last_page": 2,
    "per_page": 15,
    "total": 25
  }
}
```

## Rate Limiting

API requests are rate limited to prevent abuse:

- **Authenticated users**: 60 requests per minute
- **Guest users**: 10 requests per minute
- **File uploads**: 5 requests per minute

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1642248000
```

## Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `AUTHENTICATION_REQUIRED` | User must be authenticated |
| `AUTHORIZATION_DENIED` | User lacks required permissions |
| `RESOURCE_NOT_FOUND` | Requested resource does not exist |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `FILE_UPLOAD_ERROR` | File upload failed |
| `PDF_PROCESSING_ERROR` | PDF text extraction failed |
| `AI_ANALYSIS_ERROR` | AI analysis service error |
| `QUEUE_ERROR` | Background job processing error |
| `SERVER_ERROR` | Internal server error |

## Webhooks

### Analysis Completion Webhook

SIVY can send webhooks when analysis is completed:

```http
POST {your_webhook_url}
Content-Type: application/json
X-SIVY-Signature: sha256=signature

{
  "event": "analysis.completed",
  "data": {
    "analysis_id": 1,
    "status": "completed",
    "technical_score": 85,
    "culture_score": 78,
    "role_id": 1,
    "resume_id": 1
  },
  "timestamp": "2024-01-15T13:00:00Z"
}
```

### Webhook Verification

Verify webhook authenticity using the signature:

```php
$signature = hash_hmac('sha256', $payload, $webhook_secret);
$expected = 'sha256=' . $signature;

if (!hash_equals($expected, $received_signature)) {
    // Invalid signature
}
```

## SDKs and Libraries

### JavaScript/TypeScript
```javascript
import { SivyClient } from '@sivy/js-sdk';

const client = new SivyClient({
  baseUrl: 'https://your-domain.com/api',
  apiKey: 'your-api-key'
});

// Create a role
const role = await client.roles.create({
  name: 'Senior Developer',
  requirement: 'Requirements...',
  culture: 'Culture...'
});

// Start analysis
const analysis = await client.analyses.start(role.id, [resumeId]);
```

### PHP
```php
use Sivy\Client\SivyClient;

$client = new SivyClient([
    'base_url' => 'https://your-domain.com/api',
    'api_key' => 'your-api-key'
]);

// Create a role
$role = $client->roles()->create([
    'name' => 'Senior Developer',
    'requirement' => 'Requirements...',
    'culture' => 'Culture...'
]);

// Start analysis
$analysis = $client->analyses()->start($role['id'], [$resumeId]);
```

## Testing

### Postman Collection

A Postman collection is available for testing the API:

```bash
# Import the collection
curl -o sivy-api.postman_collection.json \
  https://raw.githubusercontent.com/your-repo/sivy/main/docs/postman/sivy-api.postman_collection.json
```

### Example Requests

#### cURL Examples

```bash
# Login
curl -X POST http://localhost:8000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  -c cookies.txt

# Create role
curl -X POST http://localhost:8000/api/roles \
  -H "Content-Type: application/json" \
  -H "X-CSRF-TOKEN: your-csrf-token" \
  -b cookies.txt \
  -d '{"name":"Developer","requirement":"Requirements","culture":"Culture"}'

# Upload resume
curl -X POST http://localhost:8000/api/resumes \
  -H "X-CSRF-TOKEN: your-csrf-token" \
  -b cookies.txt \
  -F "file=@resume.pdf"
```

## Support

For API support:

- **Documentation Issues**: Open an issue on GitHub
- **API Questions**: Use GitHub Discussions
- **Bug Reports**: Create a detailed issue with reproduction steps
- **Feature Requests**: Submit enhancement requests on GitHub

---

**API Version**: 1.0  
**Last Updated**: January 2024