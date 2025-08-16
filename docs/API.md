# SIVY Application Architecture

**Important Notice:** SIVY does not use traditional REST API endpoints. Instead, it uses **Inertia.js** architecture for seamless integration between Laravel backend and React frontend.

## Architecture Overview

SIVY is built using the Inertia.js stack, which provides:
- **Single Page Application (SPA)** experience without API complexity
- **Server-side routing** with client-side navigation
- **Shared data** between backend and frontend
- **Form handling** with automatic CSRF protection

### Technology Stack

- **Backend:** Laravel 12 with Inertia.js adapter
- **Frontend:** React 18 with TypeScript
- **Routing:** Web routes only (no API routes)
- **Authentication:** Laravel's built-in session-based auth
- **Data Transfer:** Inertia.js responses (JSON-like but not REST API)

## Authentication

SIVY uses Laravel's built-in session-based authentication. All requests are handled through web routes with automatic CSRF protection.

### Authentication Flow

1. **Login**: User submits credentials via login form (`POST /login`)
2. **Session Creation**: Laravel creates authenticated session
3. **Automatic Protection**: All subsequent requests are automatically authenticated
4. **CSRF Protection**: Forms include CSRF tokens automatically

#### Login Process

```typescript
// Frontend (React)
import { router } from '@inertiajs/react';

const handleLogin = (data) => {
  router.post('/login', data, {
    onSuccess: () => {
      // Automatically redirected to dashboard
    },
    onError: (errors) => {
      // Handle validation errors
    }
  });
};
```

#### Session Management

- **No API tokens needed** - Sessions handled automatically
- **CSRF protection** - Built into all forms
- **Automatic redirects** - Handled by Inertia.js
- **Middleware protection** - Routes protected by `auth` middleware

## Data Transfer Format

Inertia.js handles data transfer between backend and frontend automatically. Instead of JSON API responses, data is passed through Inertia responses.

### Page Responses
```typescript
// Backend (Laravel Controller)
return Inertia::render('Dashboard', [
    'roles' => $roles,
    'analyses' => $analyses,
    'stats' => $stats
]);
```

```typescript
// Frontend (React Component)
interface Props {
  roles: Role[];
  analyses: Analysis[];
  stats: Stats;
}

export default function Dashboard({ roles, analyses, stats }: Props) {
  // Data is automatically available as props
}
```

### Form Submissions
```typescript
// Frontend form submission
router.post('/resumes', formData, {
  onSuccess: (page) => {
    // Success - page data updated automatically
  },
  onError: (errors) => {
    // Validation errors available in errors object
  }
});
```

### Error Handling
- **Validation errors** - Automatically passed to frontend
- **Flash messages** - Available via `usePage().props.flash`
- **Redirects** - Handled automatically by Inertia.js

## Web Routes

SIVY uses web routes instead of API endpoints. All routes are protected by authentication middleware and return Inertia.js responses.

### Available Routes

#### Dashboard
```http
GET /dashboard
```
**Purpose:** Main dashboard with statistics and recent analyses  
**Returns:** Inertia page with roles, analyses, and stats data

#### Role Management
```http
GET /roles              # List all roles
POST /roles             # Create new role
GET /roles/{id}         # Show role details
PUT /roles/{id}         # Update role
DELETE /roles/{id}      # Delete role
```
**Purpose:** Manage job roles and their requirements  
**Returns:** Inertia pages with role data and forms

#### Resume Management
```http
POST /resumes           # Upload resume files
```
**Purpose:** Upload PDF resumes for analysis  
**Returns:** Redirect with success/error messages

#### Analysis Management
```http
GET /analyses                    # List all analyses
GET /analyses/{id}               # Show analysis details
POST /roles/{role}/start-analysis # Start new analysis
```
**Purpose:** View and manage resume analyses  
**Returns:** Inertia pages with analysis data

#### Candidate Management
```http
GET /candidates         # List candidates for roles
```
**Purpose:** View candidates and their analysis results  
**Returns:** Inertia page with candidate data

## Form Data Examples

### Creating a Role
```typescript
// Frontend form submission
const formData = {
  name: "Senior Frontend Developer",
  requirement: "5+ years React experience, TypeScript proficiency...",
  culture: "Collaborative team player, mentoring junior developers..."
};

router.post('/roles', formData);
```

### Uploading Resumes
```typescript
// Frontend file upload
const formData = new FormData();
formData.append('resumes[]', file1);
formData.append('resumes[]', file2);

router.post('/resumes', formData, {
  forceFormData: true,
  onSuccess: () => {
    // Handle success
  },
  onError: (errors) => {
    // Handle validation errors
  }
});
```

### Starting Analysis
```typescript
// Frontend analysis start
router.post(`/roles/${roleId}/start-analysis`, {}, {
  onSuccess: (page) => {
    // Redirected to analysis page
  }
});
```

## Data Models

### Role Model
```typescript
interface Role {
  id: number;
  name: string;
  slug: string;
  requirement: string;
  culture: string;
  analyses_count: number;
  created_at: string;
  updated_at: string;
}
```

### Analysis Model
```typescript
interface Analysis {
  id: number;
  status: 'processing' | 'completed' | 'failed';
  role_id: number;
  role: Role;
  candidates_count: number;
  created_at: string;
  completed_at?: string;
}
```

### Candidate Model
```typescript
interface Candidate {
  id: number;
  name: string;
  email: string;
  phone: string;
  resume_filename: string;
  scores: {
    technical_fit: number;
    cultural_fit: number;
    overall_score: number;
  };
  analysis: {
    strengths: string[];
    weaknesses: string[];
    recommendations: string;
  };
  role: Role;
  created_at: string;
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