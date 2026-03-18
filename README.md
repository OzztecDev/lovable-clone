# Lovable Clone - AI-Powered SaaS Platform

A production-ready AI-powered SaaS platform inspired by Lovable.dev for generating, editing, and deploying projects using AI prompts.

## 🚀 Features

- **Multi-Provider AI Engine**: Supports Google Gemini and OpenRouter with automatic fallback
- **Authentication System**: Email/password + social login with JWT
- **Subscription Plans**: Free, Pro, and Premium tiers
- **Payment Integration**: Iyzico payment gateway with webhook support
- **Real-time Code Generation**: Monaco editor with live preview
- **Usage Tracking**: Daily limits based on subscription plan
- **Admin Dashboard**: Manage users, payments, and subscriptions
- **Modern UI**: Dark mode, responsive design similar to Lovable.dev

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS, Zustand
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: JWT with refresh tokens
- **AI Providers**: Google Gemini, OpenRouter
- **Payments**: Iyzico
- **Deployment**: Vercel (Frontend), Railway/Render (Backend)

## 📁 Project Structure

```
/app
├── prisma/                     # Database schema
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth pages
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── verify/
│   │   ├── (main)/            # Main app pages
│   │   │   ├── dashboard/
│   │   │   ├── workspace/[id]/
│   │   │   ├── projects/
│   │   │   └── settings/
│   │   ├── (marketing)/       # Marketing pages
│   │   │   ├── page.tsx      # Landing page
│   │   │   ├── pricing/
│   │   │   └── about/
│   │   ├── api/              # API routes
│   │   │   ├── auth/
│   │   │   ├── payments/
│   │   │   ├── ai/
│   │   │   ├── projects/
│   │   │   └── webhooks/
│   │   ├── admin/            # Admin panel
│   │   └── layout.tsx
│   ├── components/           # React components
│   │   ├── ui/              # UI primitives
│   │   ├── auth/            # Auth components
│   │   ├── dashboard/       # Dashboard components
│   │   ├── workspace/        # Workspace components
│   │   ├── pricing/         # Pricing components
│   │   └── editor/          # Code editor components
│   ├── lib/                 # Libraries
│   │   ├── db.ts           # Prisma client
│   │   ├── auth.ts         # Auth utilities
│   │   ├── ai/             # AI providers
│   │   │   ├── index.ts
│   │   │   ├── gemini.ts
│   │   │   ├── openrouter.ts
│   │   │   └── fallback.ts
│   │   ├── payments/       # Payment integrations
│   │   │   ├── iyzico.ts
│   │   │   └── utils.ts
│   │   ├── utils.ts        # General utilities
│   │   └── validators.ts   # Zod schemas
│   ├── stores/             # Zustand stores
│   │   ├── authStore.ts
│   │   ├── projectStore.ts
│   │   └── uiStore.ts
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useAI.ts
│   │   └── useSubscription.ts
│   ├── types/              # TypeScript types
│   │   ├── auth.ts
│   │   ├── ai.ts
│   │   ├── payment.ts
│   │   └── project.ts
│   └── styles/             # Global styles
│       └── globals.css
├── public/                 # Static assets
├── .env.example           # Environment variables
├── .env.local             # Local environment (gitignored)
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── prisma/schema.prisma
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Google Gemini API key
- OpenRouter API key
- Iyzico merchant account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your credentials
```

4. Initialize database:
```bash
npm run db:push
npm run db:seed
```

5. Start development server:
```bash
npm run dev
```

## 🔑 Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/lovable_clone

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000

# AI Providers
GEMINI_API_KEY=your-gemini-api-key
OPENROUTER_API_KEY=your-openrouter-api-key

# Iyzico Payment
IYZICO_API_KEY=your-iyzico-api-key
IYZICO_SECRET_KEY=your-iyzico-secret-key
IYZICO_BASE_URL=https://sandbox-api.iyzipay.com
IYZICO_MERCHANT_ID=your-merchant-id

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

## 📊 Database Schema

### Users Table
- id, email, password, name
- emailVerified, image
- plan (FREE, PRO, PREMIUM)
- createdAt, updatedAt

### Subscriptions Table
- id, userId, plan
- status, startDate, endDate
- iyzicoSubscriptionId
- createdAt, updatedAt

### Payments Table
- id, userId, amount, currency
- status, paymentId, conversationId
- plan, createdAt

### Prompts Table
- id, userId, projectId
- content, response, model
- tokens, createdAt

### Projects Table
- id, userId, name, description
- files (JSON), status
- createdAt, updatedAt

### UsageLogs Table
- id, userId, action
- tokens, model, date

## 🔐 Security Features

- **Rate Limiting**: API routes protected with express-rate-limit
- **Input Validation**: Zod schemas for all inputs
- **SQL Injection Prevention**: Prisma ORM with parameterized queries
- **XSS Prevention**: React's built-in escaping + sanitization
- **CSRF Protection**: Built-in Next.js protection
- **Secure Headers**: Helmet middleware
- **JWT Security**: Short-lived access tokens, secure refresh
- **Password Hashing**: bcrypt with salt rounds

## 💳 Payment Flow

1. User selects plan on pricing page
2. Frontend calls `/api/payments/create`
3. Backend creates Iyzico checkout form
4. User completes payment on Iyzico
5. Iyzico sends webhook to `/api/webhooks/iyzico`
6. Backend updates user subscription
7. Frontend redirects to success page

## 🤖 AI Provider Logic

```typescript
// User Plan → Available Providers
FREE      → OpenRouter (free models only)
PRO       → OpenRouter (all) + Gemini
PREMIUM   → OpenRouter (all) + Gemini (priority)

// Fallback Logic
1. Try primary provider for user's plan
2. If fails, try fallback provider
3. If all fail, return error with retry option
```

## 📈 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user

### Payments
- `POST /api/payments/create` - Create payment
- `POST /api/webhooks/iyzico` - Iyzico webhook
- `GET /api/payments/history` - Payment history

### AI
- `POST /api/ai/generate` - Generate code
- `GET /api/ai/models` - List available models
- `POST /api/ai/chat` - Chat with AI

### Projects
- `GET /api/projects` - List user projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Usage
- `GET /api/usage` - Get usage stats
- `GET /api/usage/limits` - Get plan limits

## 🧪 Testing

```bash
# Run all tests
npm test

# Run in watch mode
npm run test:watch
```

## 🚀 Deployment

### Vercel (Frontend)
```bash
npm run build
vercel deploy
```

### Railway (Backend + Database)
1. Connect GitHub repository
2. Add environment variables
3. Deploy

### Database
- Use Supabase or Railway PostgreSQL
- Run migrations on deploy

## 📝 License

MIT License - feel free to use for personal and commercial projects.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📧 Support

For questions or support, please open an issue on GitHub.

---

Built with ❤️ using Next.js, Prisma, and Tailwind CSS
