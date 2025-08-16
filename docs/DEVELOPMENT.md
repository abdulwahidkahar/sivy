# SIVY Development Guide

This guide provides comprehensive information for developers working on SIVY, including setup, architecture, coding standards, and contribution guidelines.

## Table of Contents

- [Development Environment Setup](#development-environment-setup)
- [Project Architecture](#project-architecture)
- [Database Design](#database-design)
- [Frontend Architecture](#frontend-architecture)
- [Backend Architecture](#backend-architecture)
- [AI Integration](#ai-integration)
- [Testing Strategy](#testing-strategy)
- [Coding Standards](#coding-standards)
- [Development Workflow](#development-workflow)
- [Debugging and Profiling](#debugging-and-profiling)
- [Performance Considerations](#performance-considerations)
- [Security Guidelines](#security-guidelines)
- [Contributing](#contributing)

## Development Environment Setup

### Prerequisites

- **PHP**: 8.2 or higher
- **Node.js**: 18.x or higher
- **Composer**: Latest version
- **MySQL**: 8.0+ or **PostgreSQL**: 13+
- **Redis**: 6.x or higher
- **Git**: Latest version
- **IDE**: VS Code, PhpStorm, or similar

### Local Setup

#### 1. Clone and Install

```bash
# Clone repository
git clone https://github.com/your-username/sivy.git
cd sivy

# Install PHP dependencies
composer install

# Install Node.js dependencies
npm install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate
```

#### 2. Database Setup

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE sivy_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Configure .env file
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=sivy_dev
DB_USERNAME=root
DB_PASSWORD=your_password

# Run migrations
php artisan migrate

# Seed database (optional)
php artisan db:seed
```

#### 3. Redis Setup

```bash
# Install Redis (macOS)
brew install redis
brew services start redis

# Install Redis (Ubuntu)
sudo apt install redis-server
sudo systemctl start redis-server

# Configure .env
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis
```

#### 4. AI Service Setup

```bash
# Get Google Gemini API key from https://makersuite.google.com/app/apikey
# Add to .env
GEMINI_API_KEY=your_gemini_api_key
```

#### 5. Start Development Servers

```bash
# Terminal 1: Laravel development server
php artisan serve

# Terminal 2: Vite development server
npm run dev

# Terminal 3: Queue worker
php artisan queue:work
```

### Docker Development Environment

#### 1. Docker Compose Setup

```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    container_name: sivy-app-dev
    volumes:
      - ./:/var/www
      - /var/www/node_modules
    ports:
      - "8000:8000"
      - "5173:5173"
    networks:
      - sivy-dev
    depends_on:
      - database
      - redis

  database:
    image: mysql:8.0
    container_name: sivy-db-dev
    environment:
      MYSQL_DATABASE: sivy_dev
      MYSQL_ROOT_PASSWORD: password
    ports:
      - "3306:3306"
    volumes:
      - db-data:/var/lib/mysql
    networks:
      - sivy-dev

  redis:
    image: redis:7-alpine
    container_name: sivy-redis-dev
    ports:
      - "6379:6379"
    networks:
      - sivy-dev

  mailhog:
    image: mailhog/mailhog
    container_name: sivy-mail-dev
    ports:
      - "1025:1025"
      - "8025:8025"
    networks:
      - sivy-dev

volumes:
  db-data:

networks:
  sivy-dev:
    driver: bridge
```

#### 2. Development Dockerfile

```dockerfile
# Dockerfile.dev
FROM php:8.2-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    nodejs \
    npm

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd
RUN pecl install redis xdebug && docker-php-ext-enable redis xdebug

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Configure Xdebug
RUN echo "xdebug.mode=debug" >> /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini \
    && echo "xdebug.client_host=host.docker.internal" >> /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini \
    && echo "xdebug.client_port=9003" >> /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini

WORKDIR /var/www

EXPOSE 8000 5173

CMD ["php", "artisan", "serve", "--host=0.0.0.0"]
```

#### 3. Start Development Environment

```bash
# Start containers
docker-compose -f docker-compose.dev.yml up -d

# Install dependencies
docker-compose exec app composer install
docker-compose exec app npm install

# Run migrations
docker-compose exec app php artisan migrate

# Start Vite dev server
docker-compose exec app npm run dev
```

## Project Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   External      │
│   (React)       │◄──►│   (Laravel)     │◄──►│   Services      │
│                 │    │                 │    │                 │
│ • Components    │    │ • Controllers   │    │ • Gemini AI     │
│ • Pages         │    │ • Models        │    │ • File Storage  │
│ • Hooks         │    │ • Jobs          │    │ • Email         │
│ • Services      │    │ • Middleware    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Build Tools   │    │   Database      │    │   Queue System  │
│                 │    │                 │    │                 │
│ • Vite          │    │ • MySQL/PgSQL   │    │ • Redis         │
│ • TypeScript    │    │ • Migrations    │    │ • Workers       │
│ • Tailwind      │    │ • Seeders       │    │ • Jobs          │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Directory Structure

```
sivy/
├── app/
│   ├── Http/
│   │   ├── Controllers/          # API and web controllers
│   │   ├── Middleware/           # Custom middleware
│   │   └── Requests/             # Form request validation
│   ├── Jobs/                     # Background jobs
│   ├── Models/                   # Eloquent models
│   └── Providers/                # Service providers
├── database/
│   ├── factories/                # Model factories
│   ├── migrations/               # Database migrations
│   └── seeders/                  # Database seeders
├── resources/
│   ├── css/                      # Stylesheets
│   ├── js/                       # Frontend application
│   │   ├── components/           # Reusable React components
│   │   ├── hooks/                # Custom React hooks
│   │   ├── layouts/              # Page layouts
│   │   ├── pages/                # Page components
│   │   ├── services/             # API services
│   │   └── types/                # TypeScript type definitions
│   └── views/                    # Blade templates
├── routes/                       # Route definitions
├── tests/                        # Test files
└── docs/                         # Documentation
```

## Database Design

### Entity Relationship Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    Users    │     │   Resumes   │     │    Roles    │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ id          │◄────┤ user_id     │     │ id          │
│ name        │     │ filename    │     │ user_id     │◄──┐
│ email       │     │ storage_path│     │ name        │   │
│ password    │     │ created_at  │     │ slug        │   │
│ created_at  │     │ updated_at  │     │ requirement │   │
│ updated_at  │     └─────────────┘     │ culture     │   │
└─────────────┘            │            │ created_at  │   │
       │                   │            │ updated_at  │   │
       │                   │            └─────────────┘   │
       │                   │                   │          │
       │                   ▼                   ▼          │
       │            ┌─────────────┐     ┌─────────────┐   │
       │            │  Analyses   │     │   Skills    │   │
       │            ├─────────────┤     ├─────────────┤   │
       │            │ id          │     │ id          │   │
       └────────────┤ resume_id   │     │ name        │   │
                    │ role_id     │────►│ created_at  │   │
                    │ status      │     │ updated_at  │   │
                    │ tech_score  │     └─────────────┘   │
                    │ culture_score│           │          │
                    │ summary     │           │          │
                    │ justification│          │          │
                    │ raw_result  │           │          │
                    │ created_at  │           │          │
                    │ updated_at  │           │          │
                    └─────────────┘           │          │
                           │                  │          │
                           │                  │          │
                           ▼                  ▼          │
                    ┌─────────────────────────────────┐  │
                    │      analysis_skill             │  │
                    │  (Many-to-Many Pivot Table)     │  │
                    ├─────────────────────────────────┤  │
                    │ analysis_id                     │  │
                    │ skill_id                        │  │
                    └─────────────────────────────────┘  │
                                                         │
                                                         │
                    ┌─────────────────────────────────┐  │
                    │           Users                 │──┘
                    │      (Self-Reference)           │
                    └─────────────────────────────────┘
```

### Key Relationships

1. **User → Resumes**: One-to-Many (A user can upload multiple resumes)
2. **User → Roles**: One-to-Many (A user can create multiple job roles)
3. **Resume + Role → Analysis**: Many-to-Many through Analysis (Each resume can be analyzed against multiple roles)
4. **Analysis → Skills**: Many-to-Many (An analysis can identify multiple skills)

### Database Indexes

```sql
-- Performance indexes
CREATE INDEX idx_analyses_status ON analyses(status);
CREATE INDEX idx_analyses_scores ON analyses(technical_score, culture_score);
CREATE INDEX idx_analyses_created ON analyses(created_at);
CREATE INDEX idx_resumes_user ON resumes(user_id);
CREATE INDEX idx_roles_user ON roles(user_id);
CREATE INDEX idx_roles_slug ON roles(slug);

-- Unique constraints
ALTER TABLE analyses ADD CONSTRAINT unique_resume_role UNIQUE(resume_id, role_id);
ALTER TABLE roles ADD CONSTRAINT unique_user_slug UNIQUE(user_id, slug);
```

## Frontend Architecture

### Technology Stack

- **Framework**: React 18 with TypeScript
- **Routing**: Inertia.js for SPA experience
- **Styling**: Tailwind CSS with custom components
- **UI Components**: Radix UI primitives
- **Icons**: Tabler Icons
- **Build Tool**: Vite
- **State Management**: React Context + useReducer

### Component Architecture

```
components/
├── ui/                          # Base UI components
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   ├── Table.tsx
│   └── ...
├── forms/                       # Form components
│   ├── RoleForm.tsx
│   ├── ResumeUpload.tsx
│   └── ...
├── analysis/                    # Analysis-specific components
│   ├── AnalysisCard.tsx
│   ├── ScoreDisplay.tsx
│   ├── SkillsList.tsx
│   └── ...
└── layout/                      # Layout components
    ├── Header.tsx
    ├── Sidebar.tsx
    ├── Navigation.tsx
    └── ...
```

### State Management Pattern

```typescript
// types/index.ts
export interface AppState {
  user: User | null;
  roles: Role[];
  analyses: Analysis[];
  loading: boolean;
  error: string | null;
}

export type AppAction =
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_ROLES'; payload: Role[] }
  | { type: 'ADD_ANALYSIS'; payload: Analysis }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

// hooks/useAppState.ts
export const useAppState = () => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  const actions = {
    setUser: (user: User) => dispatch({ type: 'SET_USER', payload: user }),
    setRoles: (roles: Role[]) => dispatch({ type: 'SET_ROLES', payload: roles }),
    addAnalysis: (analysis: Analysis) => dispatch({ type: 'ADD_ANALYSIS', payload: analysis }),
    setLoading: (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading }),
    setError: (error: string | null) => dispatch({ type: 'SET_ERROR', payload: error }),
  };
  
  return { state, actions };
};
```

### API Service Layer

```typescript
// services/api.ts
class ApiService {
  private baseUrl = '/api';
  
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Accept': 'application/json',
        'X-CSRF-TOKEN': this.getCsrfToken(),
      },
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-CSRF-TOKEN': this.getCsrfToken(),
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  private getCsrfToken(): string {
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (!token) {
      throw new Error('CSRF token not found');
    }
    return token;
  }
}

export const api = new ApiService();
```

## Backend Architecture

### Laravel Structure

#### Controllers

```php
// app/Http/Controllers/BaseController.php
abstract class BaseController extends Controller
{
    protected function successResponse($data = null, string $message = 'Success', int $status = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $data,
            'message' => $message,
        ], $status);
    }
    
    protected function errorResponse(string $message, int $status = 400, $errors = null): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors' => $errors,
        ], $status);
    }
}

// app/Http/Controllers/AnalysisController.php
class AnalysisController extends BaseController
{
    public function index(Request $request): Response
    {
        $analyses = Analysis::with(['resume.user', 'role', 'skills'])
            ->when($request->role_id, fn($q) => $q->where('role_id', $request->role_id))
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->latest()
            ->paginate(15);
            
        return Inertia::render('Analyses/Index', [
            'analyses' => $analyses,
            'filters' => $request->only(['role_id', 'status']),
        ]);
    }
}
```

#### Models

```php
// app/Models/Analysis.php
class Analysis extends Model
{
    use HasFactory;
    
    public const STATUS_PENDING = 'pending';
    public const STATUS_PROCESSING = 'processing';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_FAILED = 'failed';
    
    protected $fillable = [
        'resume_id',
        'role_id',
        'status',
        'recruitment_status',
        'technical_score',
        'culture_score',
        'summary',
        'justification',
        'raw_result',
    ];
    
    protected $casts = [
        'justification' => 'array',
        'raw_result' => 'array',
        'technical_score' => 'integer',
        'culture_score' => 'integer',
    ];
    
    // Relationships
    public function resume(): BelongsTo
    {
        return $this->belongsTo(Resume::class);
    }
    
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }
    
    public function skills(): BelongsToMany
    {
        return $this->belongsToMany(Skill::class);
    }
    
    // Scopes
    public function scopeCompleted(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_COMPLETED);
    }
    
    public function scopeByScore(Builder $query, int $minScore): Builder
    {
        return $query->where(function ($q) use ($minScore) {
            $q->where('technical_score', '>=', $minScore)
              ->orWhere('culture_score', '>=', $minScore);
        });
    }
    
    // Mutators & Accessors
    public function getOverallScoreAttribute(): ?int
    {
        if ($this->technical_score && $this->culture_score) {
            return round(($this->technical_score + $this->culture_score) / 2);
        }
        
        return null;
    }
    
    // Methods
    public function markAsProcessing(): void
    {
        $this->update(['status' => self::STATUS_PROCESSING]);
    }
    
    public function markAsCompleted(): void
    {
        $this->update(['status' => self::STATUS_COMPLETED]);
    }
    
    public function markAsFailed(): void
    {
        $this->update(['status' => self::STATUS_FAILED]);
    }
}
```

#### Jobs

```php
// app/Jobs/AnalyzeResumeJob.php
class AnalyzeResumeJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
    
    public int $tries = 3;
    public int $timeout = 300;
    
    public function __construct(public Analysis $analysis)
    {
    }
    
    public function handle(): void
    {
        try {
            $this->analysis->markAsProcessing();
            
            $resumeText = $this->extractTextFromPdf();
            $analysisResult = $this->analyzeWithAI($resumeText);
            
            $this->analysis->update([
                'status' => Analysis::STATUS_COMPLETED,
                'technical_score' => $analysisResult['technical_score'],
                'culture_score' => $analysisResult['culture_score'],
                'summary' => $analysisResult['summary'],
                'justification' => $analysisResult['justification'],
                'raw_result' => $analysisResult,
            ]);
            
            $this->syncSkills($analysisResult['skills'] ?? []);
            
            Log::info("Analysis completed", ['analysis_id' => $this->analysis->id]);
            
        } catch (Throwable $e) {
            $this->analysis->markAsFailed();
            Log::error("Analysis failed", [
                'analysis_id' => $this->analysis->id,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }
    
    private function extractTextFromPdf(): string
    {
        $parser = new Parser();
        $pdf = $parser->parseFile(Storage::path($this->analysis->resume->storage_path));
        return $pdf->getText();
    }
    
    private function analyzeWithAI(string $resumeText): array
    {
        $prompt = $this->buildPrompt($resumeText);
        
        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
        ])->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" . config('services.gemini.api_key'), [
            'contents' => [[
                'parts' => [['text' => $prompt]]
            ]]
        ]);
        
        if (!$response->successful()) {
            throw new Exception('AI analysis failed: ' . $response->body());
        }
        
        $result = $response->json();
        return $this->parseAIResponse($result['candidates'][0]['content']['parts'][0]['text']);
    }
}
```

## AI Integration

### Google Gemini Integration

#### Prompt Engineering

```php
private function buildPrompt(string $resumeText): string
{
    $role = $this->analysis->role;
    
    return """
    You are an expert HR analyst. Analyze the following resume against the job requirements and company culture.
    
    JOB ROLE: {$role->name}
    
    TECHNICAL REQUIREMENTS:
    {$role->requirement}
    
    COMPANY CULTURE:
    {$role->culture}
    
    RESUME CONTENT:
    {$resumeText}
    
    Please provide a detailed analysis in the following JSON format:
    {
        "technical_score": <score from 0-100>,
        "culture_score": <score from 0-100>,
        "summary": "<brief 2-3 sentence summary>",
        "justification": {
            "technical": {
                "strengths": ["<strength 1>", "<strength 2>"],
                "weaknesses": ["<weakness 1>", "<weakness 2>"]
            },
            "cultural": {
                "strengths": ["<strength 1>", "<strength 2>"],
                "concerns": ["<concern 1>", "<concern 2>"]
            }
        },
        "skills": ["<skill 1>", "<skill 2>", "<skill 3>"],
        "recommendations": ["<recommendation 1>", "<recommendation 2>"]
    }
    
    Ensure scores are realistic and justified. Be specific in your analysis.
    """;
}
```

#### Response Parsing

```php
private function parseAIResponse(string $response): array
{
    // Clean the response to extract JSON
    $jsonStart = strpos($response, '{');
    $jsonEnd = strrpos($response, '}') + 1;
    
    if ($jsonStart === false || $jsonEnd === false) {
        throw new Exception('Invalid AI response format');
    }
    
    $jsonString = substr($response, $jsonStart, $jsonEnd - $jsonStart);
    $data = json_decode($jsonString, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Failed to parse AI response JSON: ' . json_last_error_msg());
    }
    
    // Validate required fields
    $required = ['technical_score', 'culture_score', 'summary', 'justification'];
    foreach ($required as $field) {
        if (!isset($data[$field])) {
            throw new Exception("Missing required field: {$field}");
        }
    }
    
    // Validate score ranges
    if ($data['technical_score'] < 0 || $data['technical_score'] > 100) {
        throw new Exception('Technical score must be between 0 and 100');
    }
    
    if ($data['culture_score'] < 0 || $data['culture_score'] > 100) {
        throw new Exception('Culture score must be between 0 and 100');
    }
    
    return $data;
}
```

### Error Handling and Retry Logic

```php
public function retryUntil(): DateTime
{
    return now()->addMinutes(10);
}

public function failed(Throwable $exception): void
{
    $this->analysis->markAsFailed();
    
    Log::error('Analysis job failed permanently', [
        'analysis_id' => $this->analysis->id,
        'exception' => $exception->getMessage(),
        'trace' => $exception->getTraceAsString(),
    ]);
    
    // Notify user of failure
    Mail::to($this->analysis->resume->user)
        ->send(new AnalysisFailedMail($this->analysis));
}
```

## Testing Strategy

### Test Structure

```
tests/
├── Feature/                     # Integration tests
│   ├── Auth/
│   │   ├── LoginTest.php
│   │   └── RegistrationTest.php
│   ├── Analysis/
│   │   ├── AnalysisCreationTest.php
│   │   ├── AnalysisDisplayTest.php
│   │   └── AnalysisJobTest.php
│   ├── Role/
│   │   ├── RoleManagementTest.php
│   │   └── RoleValidationTest.php
│   └── Resume/
│       ├── ResumeUploadTest.php
│       └── ResumeProcessingTest.php
├── Unit/                        # Unit tests
│   ├── Models/
│   │   ├── AnalysisTest.php
│   │   ├── RoleTest.php
│   │   └── ResumeTest.php
│   ├── Jobs/
│   │   └── AnalyzeResumeJobTest.php
│   └── Services/
│       └── AIAnalysisServiceTest.php
└── Browser/                     # E2E tests (Laravel Dusk)
    ├── AnalysisWorkflowTest.php
    └── UserJourneyTest.php
```

### Example Tests

#### Feature Test

```php
// tests/Feature/Analysis/AnalysisCreationTest.php
class AnalysisCreationTest extends TestCase
{
    use RefreshDatabase;
    
    public function test_user_can_start_analysis_for_role(): void
    {
        $user = User::factory()->create();
        $role = Role::factory()->for($user)->create();
        $resume = Resume::factory()->for($user)->create();
        
        $this->actingAs($user)
            ->post(route('analyses.start', $role), [
                'resume_ids' => [$resume->id],
            ])
            ->assertRedirect()
            ->assertSessionHas('success');
            
        $this->assertDatabaseHas('analyses', [
            'resume_id' => $resume->id,
            'role_id' => $role->id,
            'status' => Analysis::STATUS_PENDING,
        ]);
    }
    
    public function test_analysis_job_is_dispatched(): void
    {
        Queue::fake();
        
        $user = User::factory()->create();
        $role = Role::factory()->for($user)->create();
        $resume = Resume::factory()->for($user)->create();
        
        $this->actingAs($user)
            ->post(route('analyses.start', $role), [
                'resume_ids' => [$resume->id],
            ]);
            
        Queue::assertPushed(AnalyzeResumeJob::class);
    }
}
```

#### Unit Test

```php
// tests/Unit/Models/AnalysisTest.php
class AnalysisTest extends TestCase
{
    use RefreshDatabase;
    
    public function test_overall_score_calculation(): void
    {
        $analysis = Analysis::factory()->create([
            'technical_score' => 80,
            'culture_score' => 90,
        ]);
        
        $this->assertEquals(85, $analysis->overall_score);
    }
    
    public function test_overall_score_returns_null_when_scores_missing(): void
    {
        $analysis = Analysis::factory()->create([
            'technical_score' => null,
            'culture_score' => 90,
        ]);
        
        $this->assertNull($analysis->overall_score);
    }
    
    public function test_completed_scope(): void
    {
        Analysis::factory()->create(['status' => Analysis::STATUS_COMPLETED]);
        Analysis::factory()->create(['status' => Analysis::STATUS_PENDING]);
        Analysis::factory()->create(['status' => Analysis::STATUS_COMPLETED]);
        
        $completed = Analysis::completed()->get();
        
        $this->assertCount(2, $completed);
        $this->assertTrue($completed->every(fn($analysis) => $analysis->status === Analysis::STATUS_COMPLETED));
    }
}
```

#### Browser Test

```php
// tests/Browser/AnalysisWorkflowTest.php
class AnalysisWorkflowTest extends DuskTestCase
{
    public function test_complete_analysis_workflow(): void
    {
        $user = User::factory()->create();
        
        $this->browse(function (Browser $browser) use ($user) {
            $browser->loginAs($user)
                ->visit('/dashboard')
                ->assertSee('Welcome')
                
                // Create a role
                ->clickLink('Roles')
                ->click('@create-role-button')
                ->type('name', 'Senior Developer')
                ->type('requirement', 'PHP, Laravel, React')
                ->type('culture', 'Team player')
                ->click('@save-role-button')
                ->assertSee('Role created successfully')
                
                // Upload resume
                ->visit('/dashboard')
                ->attach('resume', __DIR__.'/fixtures/sample-resume.pdf')
                ->click('@upload-resume-button')
                ->assertSee('Resume uploaded successfully')
                
                // Start analysis
                ->click('@start-analysis-button')
                ->assertSee('Analysis started')
                
                // Check analysis results (after job processing)
                ->visit('/analyses')
                ->waitForText('Completed', 30)
                ->assertSee('Technical Score')
                ->assertSee('Culture Score');
        });
    }
}
```

### Running Tests

```bash
# Run all tests
php artisan test

# Run specific test suite
php artisan test --testsuite=Feature
php artisan test --testsuite=Unit

# Run with coverage
php artisan test --coverage

# Run browser tests
php artisan dusk

# Run specific test
php artisan test tests/Feature/Analysis/AnalysisCreationTest.php

# Run tests in parallel
php artisan test --parallel
```

## Coding Standards

### PHP Standards (PSR-12)

```php
<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Analysis;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Inertia\Inertia;

/**
 * Handles analysis-related operations.
 */
class AnalysisController extends Controller
{
    /**
     * Display a listing of analyses.
     */
    public function index(Request $request): Response
    {
        $analyses = Analysis::with(['resume.user', 'role', 'skills'])
            ->when($request->role_id, function ($query) use ($request) {
                return $query->where('role_id', $request->role_id);
            })
            ->latest()
            ->paginate(15);

        return Inertia::render('Analyses/Index', [
            'analyses' => $analyses,
            'filters' => $request->only(['role_id', 'status']),
        ]);
    }
}
```

### TypeScript Standards

```typescript
// types/index.ts
export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: number;
  name: string;
  slug: string;
  requirement: string | null;
  culture: string | null;
  user_id: number;
  analyses_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Analysis {
  id: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  recruitment_status: string;
  technical_score: number | null;
  culture_score: number | null;
  summary: string | null;
  justification: AnalysisJustification | null;
  resume: Resume;
  role: Role;
  skills: Skill[];
  created_at: string;
  updated_at: string;
}

// components/AnalysisCard.tsx
import React from 'react';
import { Analysis } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { ScoreDisplay } from '@/components/analysis/ScoreDisplay';

interface AnalysisCardProps {
  analysis: Analysis;
  onViewDetails: (analysis: Analysis) => void;
}

export const AnalysisCard: React.FC<AnalysisCardProps> = ({
  analysis,
  onViewDetails,
}) => {
  const handleViewClick = (): void => {
    onViewDetails(analysis);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {analysis.resume.original_filename}
        </h3>
        <Badge variant={analysis.status === 'completed' ? 'success' : 'warning'}>
          {analysis.status}
        </Badge>
      </div>
      
      {analysis.status === 'completed' && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <ScoreDisplay
            label="Technical"
            score={analysis.technical_score}
          />
          <ScoreDisplay
            label="Cultural"
            score={analysis.culture_score}
          />
        </div>
      )}
      
      <button
        onClick={handleViewClick}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
      >
        View Details
      </button>
    </div>
  );
};
```

### Code Quality Tools

#### PHP (Laravel Pint)

```json
// pint.json
{
    "preset": "psr12",
    "rules": {
        "array_syntax": {
            "syntax": "short"
        },
        "binary_operator_spaces": {
            "default": "single_space"
        },
        "blank_line_after_namespace": true,
        "blank_line_after_opening_tag": true,
        "blank_line_before_statement": {
            "statements": ["return"]
        },
        "braces": true,
        "cast_spaces": true,
        "class_attributes_separation": {
            "elements": {
                "method": "one"
            }
        },
        "class_definition": true,
        "concat_space": {
            "spacing": "one"
        },
        "declare_equal_normalize": true,
        "elseif": true,
        "encoding": true,
        "full_opening_tag": true,
        "fully_qualified_strict_types": true,
        "function_declaration": true,
        "function_typehint_space": true,
        "heredoc_to_nowdoc": true,
        "include": true,
        "increment_style": {
            "style": "post"
        },
        "indentation_type": true,
        "linebreak_after_opening_tag": true,
        "line_ending": true,
        "lowercase_cast": true,
        "constant_case": {
            "case": "lower"
        },
        "lowercase_keywords": true,
        "lowercase_static_reference": true,
        "magic_method_casing": true,
        "magic_constant_casing": true,
        "method_argument_space": true,
        "native_function_casing": true,
        "no_alias_functions": true,
        "no_extra_blank_lines": {
            "tokens": [
                "extra",
                "throw",
                "use"
            ]
        },
        "no_blank_lines_after_class_opening": true,
        "no_blank_lines_after_phpdoc": true,
        "no_closing_tag": true,
        "no_empty_phpdoc": true,
        "no_empty_statement": true,
        "no_leading_import_slash": true,
        "no_leading_namespace_whitespace": true,
        "no_mixed_echo_print": {
            "use": "echo"
        },
        "no_multiline_whitespace_around_double_arrow": true,
        "no_short_bool_cast": true,
        "no_singleline_whitespace_before_semicolons": true,
        "no_spaces_after_function_name": true,
        "no_spaces_around_offset": {
            "positions": ["inside", "outside"]
        },
        "no_spaces_inside_parenthesis": true,
        "no_trailing_comma_in_list_call": true,
        "no_trailing_comma_in_singleline_array": true,
        "no_trailing_whitespace": true,
        "no_trailing_whitespace_in_comment": true,
        "no_unneeded_control_parentheses": true,
        "no_unreachable_default_argument_value": true,
        "no_useless_return": true,
        "no_whitespace_before_comma_in_array": true,
        "no_whitespace_in_blank_line": true,
        "normalize_index_brace": true,
        "object_operator_without_whitespace": true,
        "php_unit_fqcn_annotation": true,
        "phpdoc_align": {
            "align": "left"
        },
        "phpdoc_annotation_without_dot": true,
        "phpdoc_indent": true,
        "phpdoc_inline_tag": true,
        "phpdoc_no_access": true,
        "phpdoc_no_alias_tag": true,
        "phpdoc_no_empty_return": true,
        "phpdoc_no_package": true,
        "phpdoc_no_useless_inheritdoc": true,
        "phpdoc_return_self_reference": true,
        "phpdoc_scalar": true,
        "phpdoc_separation": true,
        "phpdoc_single_line_var_spacing": true,
        "phpdoc_summary": true,
        "phpdoc_to_comment": true,
        "phpdoc_trim": true,
        "phpdoc_types": true,
        "phpdoc_var_without_name": true,
        "return_type_declaration": true,
        "self_accessor": true,
        "short_scalar_cast": true,
        "simplified_null_return": true,
        "single_blank_line_at_eof": true,
        "single_blank_line_before_namespace": true,
        "single_class_element_per_statement": {
            "elements": ["property"]
        },
        "single_import_per_statement": true,
        "single_line_after_imports": true,
        "single_line_comment_style": {
            "comment_types": ["hash"]
        },
        "single_quote": true,
        "space_after_semicolon": {
            "remove_in_empty_for_expressions": true
        },
        "standardize_not_equals": true,
        "switch_case_semicolon_to_colon": true,
        "switch_case_space": true,
        "ternary_operator_spaces": true,
        "trailing_comma_in_multiline_array": true,
        "trim_array_spaces": true,
        "unary_operator_spaces": true,
        "visibility_required": {
            "elements": [
                "method",
                "property"
            ]
        },
        "whitespace_after_comma_in_array": true
    }
}
```

#### TypeScript (ESLint + Prettier)

```json
// eslint.config.js
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  { ignores: ['dist', 'public/build'] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      prettier,
    ],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
);
```

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "always",
  "endOfLine": "lf",
  "plugins": [
    "prettier-plugin-organize-imports",
    "prettier-plugin-tailwindcss"
  ]
}
```

### Running Code Quality Tools

```bash
# PHP formatting
./vendor/bin/pint

# PHP static analysis
./vendor/bin/phpstan analyse

# TypeScript linting
npm run lint

# TypeScript formatting
npm run format

# Type checking
npm run types
```

## Development Workflow

### Git Workflow

1. **Feature Branch Workflow**
   ```bash
   # Create feature branch
   git checkout -b feature/analysis-improvements
   
   # Make changes and commit
   git add .
   git commit -m "feat: improve analysis scoring algorithm"
   
   # Push and create PR
   git push origin feature/analysis-improvements
   ```

2. **Commit Message Convention**
   ```
   type(scope): description
   
   [optional body]
   
   [optional footer]
   ```
   
   Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
   
   Examples:
   ```
   feat(analysis): add skill extraction from resume text
   fix(auth): resolve session timeout issue
   docs(api): update endpoint documentation
   test(models): add unit tests for Analysis model
   ```

### Pre-commit Hooks

```bash
# Install pre-commit hooks
composer require --dev brianium/paratest
npm install --save-dev husky lint-staged

# Setup husky
npx husky install
npx husky add .husky/pre-commit "npm run pre-commit"
```

```json
// package.json
{
  "scripts": {
    "pre-commit": "lint-staged"
  },
  "lint-staged": {
    "*.php": [
      "./vendor/bin/pint",
      "php artisan test --parallel"
    ],
    "*.{ts,tsx}": [
      "npm run lint -- --fix",
      "npm run format",
      "npm run types"
    ]
  }
}
```

### Development Commands

```bash
# Start development environment
make dev

# Run tests
make test

# Code quality checks
make lint

# Build for production
make build

# Deploy to staging
make deploy-staging
```

```makefile
# Makefile
.PHONY: dev test lint build deploy-staging

dev:
	php artisan serve &
	npm run dev &
	php artisan queue:work

test:
	php artisan test --parallel
	npm run types

lint:
	./vendor/bin/pint
	npm run lint
	npm run format

build:
	composer install --no-dev --optimize-autoloader
	npm ci
	npm run build
	php artisan config:cache
	php artisan route:cache
	php artisan view:cache

deploy-staging:
	@echo "Deploying to staging..."
	git push staging main
```

## Debugging and Profiling

### Laravel Debugging

#### Telescope (Development)

```bash
# Install Telescope
composer require laravel/telescope --dev
php artisan telescope:install
php artisan migrate
```

#### Debug Bar

```bash
# Install Debug Bar
composer require barryvdh/laravel-debugbar --dev
```

#### Logging

```php
// Custom logging channel
// config/logging.php
'channels' => [
    'analysis' => [
        'driver' => 'single',
        'path' => storage_path('logs/analysis.log'),
        'level' => env('LOG_LEVEL', 'debug'),
    ],
],

// Usage in code
Log::channel('analysis')->info('Analysis started', [
    'analysis_id' => $analysis->id,
    'resume_id' => $analysis->resume_id,
    'role_id' => $analysis->role_id,
]);
```

### Frontend Debugging

#### React Developer Tools

```typescript
// Development utilities
if (process.env.NODE_ENV === 'development') {
  // Enable React DevTools
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = window.__REACT_DEVTOOLS_GLOBAL_HOOK__ || {};
  
  // Debug utilities
  window.debugApp = {
    logState: (state: any) => console.log('App State:', state),
    logProps: (props: any) => console.log('Component Props:', props),
  };
}
```

#### Error Boundaries

```typescript
// components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Send to error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Sentry.captureException(error, { extra: errorInfo });
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-4">
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Refresh Page
            </button>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-gray-500">
                  Error Details
                </summary>
                <pre className="mt-2 text-xs text-red-600 overflow-auto">
                  {this.state.error?.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Performance Profiling

#### Laravel Performance

```bash
# Install performance monitoring
composer require spatie/laravel-ray --dev
composer require itsgoingd/clockwork --dev
```

```php
// Performance monitoring in jobs
class AnalyzeResumeJob implements ShouldQueue
{
    public function handle(): void
    {
        $startTime = microtime(true);
        
        try {
            // Job logic here
            
        } finally {
            $executionTime = microtime(true) - $startTime;
            
            Log::info('Job performance', [
                'job' => self::class,
                'analysis_id' => $this->analysis->id,
                'execution_time' => $executionTime,
                'memory_usage' => memory_get_peak_usage(true),
            ]);
        }
    }
}
```

#### React Performance

```typescript
// Performance monitoring hook
import { useEffect } from 'react';

export const usePerformanceMonitor = (componentName: string): void => {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (renderTime > 16) { // Longer than one frame
        console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
      }
    };
  });
};

// Usage
export const AnalysisCard: React.FC<AnalysisCardProps> = ({ analysis }) => {
  usePerformanceMonitor('AnalysisCard');
  
  // Component logic
};
```

## Performance Considerations

### Database Optimization

1. **Query Optimization**
   ```php
   // Eager loading to prevent N+1 queries
   $analyses = Analysis::with([
       'resume.user',
       'role',
       'skills' => function ($query) {
           $query->select('id', 'name');
       }
   ])->get();
   
   // Use database indexes
   Schema::table('analyses', function (Blueprint $table) {
       $table->index(['status', 'created_at']);
       $table->index(['role_id', 'technical_score']);
   });
   ```

2. **Caching Strategy**
   ```php
   // Cache expensive queries
   $topCandidates = Cache::remember(
       "role.{$roleId}.top_candidates",
       now()->addHours(1),
       fn() => Analysis::where('role_id', $roleId)
           ->where('status', 'completed')
           ->orderByDesc('technical_score')
           ->limit(10)
           ->with('resume.user')
           ->get()
   );
   ```

### Frontend Optimization

1. **Code Splitting**
   ```typescript
   // Lazy load pages
   const AnalysisPage = lazy(() => import('@/pages/Analysis/Show'));
   const RolePage = lazy(() => import('@/pages/Role/Show'));
   
   // Route-based code splitting
   const router = createBrowserRouter([
     {
       path: '/analyses/:id',
       element: (
         <Suspense fallback={<LoadingSpinner />}>
           <AnalysisPage />
         </Suspense>
       ),
     },
   ]);
   ```

2. **Memoization**
   ```typescript
   // Memoize expensive calculations
   const AnalysisCard = memo(({ analysis }: AnalysisCardProps) => {
     const overallScore = useMemo(() => {
       if (!analysis.technical_score || !analysis.culture_score) return null;
       return Math.round((analysis.technical_score + analysis.culture_score) / 2);
     }, [analysis.technical_score, analysis.culture_score]);
     
     return (
       <div className="analysis-card">
         {overallScore && <ScoreDisplay score={overallScore} />}
       </div>
     );
   });
   ```

3. **Virtual Scrolling**
   ```typescript
   // For large lists
   import { FixedSizeList as List } from 'react-window';
   
   const AnalysesList = ({ analyses }: { analyses: Analysis[] }) => {
     const Row = ({ index, style }: { index: number; style: CSSProperties }) => (
       <div style={style}>
         <AnalysisCard analysis={analyses[index]} />
       </div>
     );
     
     return (
       <List
         height={600}
         itemCount={analyses.length}
         itemSize={120}
       >
         {Row}
       </List>
     );
   };
   ```

### Queue Optimization

```php
// config/queue.php
'connections' => [
    'redis' => [
        'driver' => 'redis',
        'connection' => 'default',
        'queue' => env('REDIS_QUEUE', 'default'),
        'retry_after' => 90,
        'block_for' => null,
        'after_commit' => false,
    ],
    
    'analysis' => [
        'driver' => 'redis',
        'connection' => 'default',
        'queue' => 'analysis',
        'retry_after' => 300,
        'block_for' => null,
        'after_commit' => false,
    ],
],

// Supervisor configuration for queue workers
// /etc/supervisor/conf.d/sivy-worker.conf
[program:sivy-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/sivy/artisan queue:work redis --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=4
redirect_stderr=true
stdout_logfile=/var/www/sivy/storage/logs/worker.log
stopwaitsecs=3600
```

## Security Guidelines

### Authentication & Authorization

1. **Sanctum Configuration**
   ```php
   // config/sanctum.php
   'expiration' => 60 * 24, // 24 hours
   'middleware' => [
       'encrypt_cookies',
       'cookie_session',
       'auth:sanctum',
   ],
   ```

2. **Role-based Access Control**
   ```php
   // app/Http/Middleware/EnsureUserOwnsResource.php
   class EnsureUserOwnsResource
   {
       public function handle(Request $request, Closure $next, string $model): Response
       {
           $resourceId = $request->route()->parameter('id');
           $modelClass = "App\\Models\\{$model}";
           
           $resource = $modelClass::findOrFail($resourceId);
           
           if ($resource->user_id !== $request->user()->id) {
               abort(403, 'Unauthorized access to resource');
           }
           
           return $next($request);
       }
   }
   ```

### Input Validation

```php
// app/Http/Requests/StoreRoleRequest.php
class StoreRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }
    
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'requirement' => ['nullable', 'string', 'max:5000'],
            'culture' => ['nullable', 'string', 'max:5000'],
        ];
    }
    
    public function messages(): array
    {
        return [
            'name.required' => 'Role name is required',
            'name.max' => 'Role name cannot exceed 255 characters',
            'requirement.max' => 'Requirements cannot exceed 5000 characters',
            'culture.max' => 'Culture description cannot exceed 5000 characters',
        ];
    }
    
    protected function prepareForValidation(): void
    {
        $this->merge([
            'name' => strip_tags($this->name),
            'requirement' => strip_tags($this->requirement),
            'culture' => strip_tags($this->culture),
        ]);
    }
}
```

### File Upload Security

```php
// app/Http/Controllers/ResumeController.php
public function store(Request $request): RedirectResponse
{
    $request->validate([
        'resume' => [
            'required',
            'file',
            'mimes:pdf',
            'max:10240', // 10MB
            function ($attribute, $value, $fail) {
                // Additional PDF validation
                if (!$this->isValidPdf($value)) {
                    $fail('The uploaded file is not a valid PDF.');
                }
            },
        ],
    ]);
    
    $file = $request->file('resume');
    
    // Generate secure filename
    $filename = Str::uuid() . '.pdf';
    
    // Store in private directory
    $path = $file->storeAs('resumes', $filename, 'private');
    
    Resume::create([
        'user_id' => $request->user()->id,
        'original_filename' => $file->getClientOriginalName(),
        'filename' => $filename,
        'storage_path' => $path,
        'file_size' => $file->getSize(),
        'mime_type' => $file->getMimeType(),
    ]);
    
    return redirect()->back()->with('success', 'Resume uploaded successfully');
}

private function isValidPdf($file): bool
{
    $handle = fopen($file->getPathname(), 'r');
    $header = fread($handle, 4);
    fclose($handle);
    
    return $header === '%PDF';
}
```

### API Security

```php
// app/Http/Middleware/ApiRateLimit.php
class ApiRateLimit
{
    public function handle(Request $request, Closure $next): Response
    {
        $key = 'api_rate_limit:' . $request->ip();
        $maxAttempts = 100; // per hour
        $decayMinutes = 60;
        
        if (RateLimiter::tooManyAttempts($key, $maxAttempts)) {
            return response()->json([
                'error' => 'Too many requests. Please try again later.',
            ], 429);
        }
        
        RateLimiter::hit($key, $decayMinutes * 60);
        
        $response = $next($request);
        
        $response->headers->set('X-RateLimit-Limit', $maxAttempts);
        $response->headers->set('X-RateLimit-Remaining', 
            $maxAttempts - RateLimiter::attempts($key));
        
        return $response;
    }
}
```

### Environment Security

```bash
# .env.example
APP_NAME=SIVY
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://your-domain.com

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=sivy_production
DB_USERNAME=sivy_user
DB_PASSWORD=

# Redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=
REDIS_PORT=6379

# Mail
MAIL_MAILER=smtp
MAIL_HOST=
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@your-domain.com
MAIL_FROM_NAME="${APP_NAME}"

# AI Service
GEMINI_API_KEY=

# Session
SESSION_DRIVER=redis
SESSION_LIFETIME=120
SESSION_ENCRYPT=true
SESSION_PATH=/
SESSION_DOMAIN=

# Security
SANCTUM_STATEFUL_DOMAINS=your-domain.com
SESSION_SECURE_COOKIE=true
CSRF_COOKIE_SECURE=true
```

## Contributing

### Getting Started

1. **Fork the Repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/your-username/sivy.git
   cd sivy
   git remote add upstream https://github.com/original-owner/sivy.git
   ```

2. **Set Up Development Environment**
   ```bash
   # Follow the development setup instructions above
   cp .env.example .env
   composer install
   npm install
   php artisan key:generate
   php artisan migrate
   ```

3. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

### Contribution Guidelines

1. **Code Style**
   - Follow PSR-12 for PHP code
   - Use TypeScript for all new frontend code
   - Write meaningful commit messages
   - Add tests for new features
   - Update documentation as needed

2. **Pull Request Process**
   - Ensure all tests pass
   - Update README.md if needed
   - Add/update API documentation
   - Request review from maintainers
   - Address feedback promptly

3. **Issue Reporting**
   - Use issue templates
   - Provide reproduction steps
   - Include environment details
   - Add relevant labels

### Development Best Practices

1. **Testing**
   - Write tests before implementing features (TDD)
   - Maintain high test coverage (>80%)
   - Test both happy path and edge cases
   - Use factories for test data

2. **Documentation**
   - Document all public APIs
   - Keep README.md updated
   - Add inline comments for complex logic
   - Update deployment guides

3. **Performance**
   - Profile before optimizing
   - Use appropriate caching strategies
   - Optimize database queries
   - Monitor application metrics

4. **Security**
   - Validate all inputs
   - Use parameterized queries
   - Implement proper authentication
   - Regular security audits

### Release Process

1. **Version Numbering**
   - Follow Semantic Versioning (SemVer)
   - MAJOR.MINOR.PATCH format
   - Document breaking changes

2. **Release Checklist**
   - [ ] All tests passing
   - [ ] Documentation updated
   - [ ] Security review completed
   - [ ] Performance benchmarks met
   - [ ] Deployment guide updated
   - [ ] Changelog updated

3. **Deployment**
   - Test in staging environment
   - Coordinate with operations team
   - Monitor post-deployment metrics
   - Have rollback plan ready

---

## Support

For development questions and support:

- **Documentation**: Check this guide and API documentation
- **Issues**: Create GitHub issues for bugs and feature requests
- **Discussions**: Use GitHub Discussions for questions
- **Email**: development@sivy.com

## License

This project is licensed under the MIT License. See the [LICENSE](../LICENSE) file for details.