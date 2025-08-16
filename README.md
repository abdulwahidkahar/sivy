# SIVY - AI-Powered Resume Analysis System

[![Laravel](https://img.shields.io/badge/Laravel-12.x-red.svg)](https://laravel.com)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org)
[![Inertia.js](https://img.shields.io/badge/Inertia.js-2.x-purple.svg)](https://inertiajs.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC.svg)](https://tailwindcss.com)

SIVY is a modern, AI-powered resume analysis system built with Laravel and React. It helps recruiters and HR professionals efficiently analyze resumes against specific job roles using artificial intelligence, providing detailed scoring and insights for better hiring decisions.

## 🚀 Features

### Core Functionality
- **AI-Powered Resume Analysis**: Leverages Google Gemini AI to analyze resumes against job requirements
- **Role Management**: Create and manage job roles with specific requirements and cultural criteria
- **Resume Upload & Processing**: Support for PDF resume uploads with automatic text extraction
- **Intelligent Scoring**: Automated technical and cultural fit scoring (0-100 scale)
- **Candidate Management**: Comprehensive candidate tracking and recruitment status management
- **Skills Extraction**: Automatic identification and categorization of candidate skills

### Technical Features
- **Modern Tech Stack**: Laravel 12 backend with React 18 frontend
- **Type Safety**: Full TypeScript implementation with strict type checking
- **Real-time Processing**: Queue-based background job processing for resume analysis
- **Responsive Design**: Mobile-first design with Tailwind CSS and Radix UI components
- **Authentication**: Secure user authentication with Laravel Sanctum
- **Database Optimization**: Efficient database design with proper indexing and relationships

### User Experience
- **Intuitive Dashboard**: Clean, modern interface for managing analyses and candidates
- **Batch Processing**: Analyze multiple resumes against a single role simultaneously
- **Detailed Reports**: Comprehensive analysis reports with justifications and recommendations
- **Search & Filter**: Advanced filtering and search capabilities for candidates
- **Export Functionality**: Export analysis results and candidate data

## 🛠️ Technology Stack

### Backend
- **Framework**: Laravel 12.x
- **Language**: PHP 8.2+
- **Database**: MySQL/PostgreSQL
- **Queue System**: Redis/Database queues
- **Authentication**: Laravel Session-based Authentication
- **PDF Processing**: Smalot PDF Parser
- **AI Integration**: Google Gemini API

### Frontend
- **Framework**: React 18.x
- **Language**: TypeScript 5.x
- **SPA Framework**: Inertia.js 2.x (No separate API needed)
- **Styling**: Tailwind CSS 4.x
- **UI Components**: Radix UI
- **Icons**: Tabler Icons
- **Build Tool**: Vite
- **State Management**: React hooks and context

### Development Tools
- **Code Quality**: ESLint, Prettier, Laravel Pint
- **Testing**: PHPUnit, Jest
- **Type Checking**: TypeScript compiler
- **Version Control**: Git with GitHub Actions CI/CD

## 📋 Prerequisites

Before installing SIVY, ensure you have the following installed:

- **PHP**: 8.2 or higher
- **Composer**: Latest version
- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **Database**: MySQL 8.0+ or PostgreSQL 13+
- **Redis**: 6.x or higher (for queues)
- **Google Gemini API Key**: For AI analysis functionality

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/abdulwahidkahar/sivy.git
cd sivy
```

### 2. Install PHP Dependencies

```bash
composer install
```

### 3. Install Node.js Dependencies

```bash
npm install
```

### 4. Environment Configuration

```bash
# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate
```

### 5. Configure Environment Variables

Edit the `.env` file with your configuration:

```env
# Application
APP_NAME="SIVY"
APP_ENV=local
APP_KEY=base64:your-generated-key
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=sivy
DB_USERNAME=your_username
DB_PASSWORD=your_password

# Queue Configuration
QUEUE_CONNECTION=redis

# Redis Configuration
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# File Storage
FILESYSTEM_DISK=local
```

### 6. Database Setup

```bash
# Run migrations
php artisan migrate

# (Optional) Seed the database
php artisan db:seed
```

### 7. Storage Setup

```bash
# Create storage link
php artisan storage:link
```

### 8. Build Frontend Assets

```bash
# For development
npm run dev

# For production
npm run build
```

## 🏃‍♂️ Running the Application

### Development Mode

1. **Start the Laravel development server:**
   ```bash
   php artisan serve
   ```

2. **Start the Vite development server (in a new terminal):**
   ```bash
   npm run dev
   ```

3. **Start the queue worker (in a new terminal):**
   ```bash
   php artisan queue:work
   ```

4. **Access the application:**
   Open your browser and navigate to `http://localhost:8000`

### Production Mode

1. **Build production assets:**
   ```bash
   npm run build
   ```

2. **Configure your web server** (Apache/Nginx) to serve the application

3. **Set up process management** for queue workers (Supervisor recommended)

## 📖 Usage Guide

### Getting Started

1. **Register an Account**: Create a new user account or log in with existing credentials
2. **Create Job Roles**: Define job positions with requirements and cultural criteria
3. **Upload Resumes**: Upload candidate resumes in PDF format
4. **Start Analysis**: Initiate AI-powered analysis of resumes against specific roles
5. **Review Results**: Examine detailed analysis reports with scores and recommendations

### Key Workflows

#### Creating a Job Role
1. Navigate to the Roles section
2. Click "Create New Role"
3. Fill in role details:
   - **Name**: Job title (e.g., "Senior Frontend Developer")
   - **Requirements**: Technical skills and experience needed
   - **Culture**: Company culture and soft skills criteria
4. Save the role

#### Analyzing Resumes
1. Select a job role from your roles list
2. Upload one or multiple PDF resumes
3. Click "Start Analysis"
4. Wait for AI processing to complete
5. Review detailed analysis results

#### Managing Candidates
1. View all analyzed candidates in the Candidates section
2. Filter by role, score, or recruitment status
3. Update recruitment status as candidates progress
4. Export candidate data for external use

## 🔧 Configuration

### AI Analysis Configuration

The AI analysis can be customized by modifying the prompt templates in the `AnalyzeResumeJob` class:

```php
// app/Jobs/AnalyzeResumeJob.php
private function buildAnalysisPrompt(string $resumeText): string
{
    // Customize the AI prompt for your specific needs
}
```

### Queue Configuration

For production environments, configure queue workers with Supervisor:

```ini
[program:sivy-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/sivy/artisan queue:work redis --sleep=3 --tries=3
autostart=true
autorestart=true
user=www-data
numprocs=8
redirect_stderr=true
stdout_logfile=/path/to/sivy/storage/logs/worker.log
```

### File Storage Configuration

Configure file storage for resume uploads:

```php
// config/filesystems.php
'disks' => [
    'resumes' => [
        'driver' => 'local',
        'root' => storage_path('app/resumes'),
        'url' => env('APP_URL').'/storage/resumes',
        'visibility' => 'private',
    ],
],
```

## 🧪 Testing

### Running Tests

```bash
# Run PHP tests
php artisan test

# Run with coverage
php artisan test --coverage

# Run specific test suite
php artisan test --testsuite=Feature
```

### Frontend Testing

```bash
# Run TypeScript type checking
npm run types

# Run linting
npm run lint

# Check code formatting
npm run format:check
```

## 🚀 Deployment

### Production Checklist

- [ ] Set `APP_ENV=production` in `.env`
- [ ] Set `APP_DEBUG=false` in `.env`
- [ ] Configure production database
- [ ] Set up Redis for queues and caching
- [ ] Configure file storage (S3 recommended)
- [ ] Set up SSL certificates
- [ ] Configure queue workers with Supervisor
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy

### Docker Deployment

A Docker configuration is available for easy deployment:

```bash
# Build and start containers
docker-compose up -d

# Run migrations
docker-compose exec app php artisan migrate
```

## 🤝 Contributing

We welcome contributions to SIVY! Please follow these guidelines:

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `php artisan test && npm run types`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Standards

- **PHP**: Follow PSR-12 coding standards
- **TypeScript**: Use strict type checking
- **Formatting**: Use Prettier for frontend, Laravel Pint for backend
- **Testing**: Write tests for new features
- **Documentation**: Update documentation for significant changes

## 🌐 Architecture Overview

### Inertia.js Architecture

SIVY uses Inertia.js to create a modern single-page application (SPA) experience without the complexity of separate API endpoints. This architecture provides:

- **Seamless Navigation**: Client-side routing with server-side rendering benefits
- **Type Safety**: Shared TypeScript interfaces between frontend and backend
- **Simplified Development**: No need for separate API layer
- **Better Performance**: Reduced network requests and faster page loads

### Authentication

Authentication is handled through Laravel's built-in session management:

```typescript
// Frontend login
router.post('/login', {
  email: 'user@example.com',
  password: 'password'
});

// Frontend logout
router.post('/logout');
```

### Data Flow

Instead of API endpoints, data flows through Inertia responses:

```php
// Backend Controller
return Inertia::render('Dashboard', [
    'roles' => Role::with('analyses')->get(),
    'stats' => $this->getStats()
]);
```

```typescript
// Frontend Component
interface Props {
  roles: Role[];
  stats: Stats;
}

export default function Dashboard({ roles, stats }: Props) {
  // Data automatically available as props
}
```

### Core Routes

```bash
# Web Routes (Inertia.js)
GET    /dashboard           # Main dashboard
GET    /roles              # List all roles
POST   /roles              # Create new role
GET    /roles/{id}         # Show role details
PUT    /roles/{id}         # Update role
DELETE /roles/{id}         # Delete role
GET    /analyses           # List analyses
GET    /analyses/{id}      # Show analysis details
POST   /roles/{role}/start-analysis # Start analysis
POST   /resumes            # Upload resumes
GET    /candidates         # List candidates
```

## 🔒 Security

### Security Features

- **CSRF Protection**: All forms protected with CSRF tokens
- **SQL Injection Prevention**: Eloquent ORM with parameter binding
- **XSS Protection**: Input sanitization and output escaping
- **File Upload Security**: Restricted file types and validation
- **Authentication**: Secure session management with Sanctum
- **Authorization**: Role-based access control

### Security Best Practices

- Keep dependencies updated
- Use HTTPS in production
- Implement rate limiting
- Regular security audits
- Secure file storage
- Environment variable protection

## 📊 Performance

### Optimization Features

- **Database Indexing**: Optimized queries with proper indexes
- **Queue Processing**: Background job processing for heavy tasks
- **Caching**: Redis caching for improved performance
- **Asset Optimization**: Vite for optimized frontend builds
- **Lazy Loading**: Efficient data loading strategies

### Performance Monitoring

```bash
# Monitor queue status
php artisan queue:monitor

# Check application performance
php artisan horizon:status
```

## 🐛 Troubleshooting

### Common Issues

#### Queue Jobs Not Processing
```bash
# Check queue worker status
php artisan queue:work --verbose

# Clear failed jobs
php artisan queue:flush
```

#### PDF Processing Errors
```bash
# Check file permissions
chmod -R 755 storage/

# Verify PDF parser installation
composer show smalot/pdfparser
```

#### AI Analysis Failures
```bash
# Verify API key configuration
php artisan config:cache

# Check API connectivity
php artisan tinker
>>> Http::get('https://generativelanguage.googleapis.com/v1beta/models')
```

### Log Files

- **Application Logs**: `storage/logs/laravel.log`
- **Queue Logs**: `storage/logs/worker.log`
- **Web Server Logs**: Check your web server configuration

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Laravel Team**: For the amazing PHP framework
- **React Team**: For the powerful frontend library
- **Inertia.js**: For seamless SPA experience
- **Google**: For the Gemini AI API
- **Tailwind CSS**: For the utility-first CSS framework
- **Radix UI**: For accessible UI components

## 📞 Support

For support and questions:

- **Documentation**: Check this README and inline code documentation
- **Issues**: Open an issue on GitHub
- **Discussions**: Use GitHub Discussions for questions
- **Email**: abdulwahidkaharr@gmail.com

---

**Built with ❤️ Abdul Wahid Kahar**