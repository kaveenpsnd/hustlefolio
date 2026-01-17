# Streak Blogging Platform - Frontend

## 🚀 Infrastructure Established

### Technology Stack
- ✅ React 18 + TypeScript (Strict Mode)
- ✅ Vite for build tooling
- ✅ Tailwind CSS + @tailwindcss/typography
- ✅ TanStack Query v5 for server state
- ✅ Axios with JWT interceptors
- ✅ Editor.js (ready for integration)
- ✅ Framer Motion (installed)
- ✅ React Calendar Heatmap (installed)

### Project Structure
```
src/
├── features/
│   ├── auth/          # Authentication (login, register, JWT hooks)
│   ├── posts/         # Blog posts API & logic
│   ├── goals/         # Goal management
│   └── dashboard/     # Dashboard with stats & heatmap
├── lib/
│   ├── api-client.ts       # Axios instance with interceptors
│   ├── image-api.ts        # Image upload for Editor.js
│   └── query-provider.tsx  # TanStack Query setup
├── types/
│   └── index.ts            # All TypeScript interfaces
├── hooks/                  # Custom React hooks (ready for use)
└── components/
    └── ui/                 # Shadcn/UI components (to be added)
```

### Core Features Implemented

#### 1. API Client (lib/api-client.ts)
- ✅ Axios instance configured for `http://localhost:8080`
- ✅ Request interceptor: Auto-injects JWT from localStorage
- ✅ Response interceptor: Handles 401/403 by clearing token and redirecting to login
- ✅ Token manager utility for localStorage

#### 2. TypeScript Domain Models (types/index.ts)
- ✅ User, AuthResponse, LoginRequest, RegisterRequest
- ✅ Goal, GoalCreateRequest
- ✅ Post, PostCreateRequest, EditorJSContent, EditorJSBlock
- ✅ DashboardDTO with stats, XP, and activity map
- ✅ ImageUploadResponse for Editor.js
- ✅ GoalRequiredException for business rule enforcement

#### 3. API Services
- ✅ `features/auth/auth-api.ts` - Login, register, getCurrentUser, logout
- ✅ `features/posts/posts-api.ts` - CRUD operations for posts
- ✅ `features/goals/goals-api.ts` - Goal management
- ✅ `features/dashboard/dashboard-api.ts` - Dashboard data
- ✅ `lib/image-api.ts` - Image upload for Editor.js

#### 4. React Query Hooks
- ✅ `use-auth.ts` - useLogin, useRegister, useCurrentUser, useLogout
- ✅ `use-goals.ts` - useActiveGoal, useUserGoals
- ✅ `use-dashboard.ts` - useDashboard

#### 5. Configuration
- ✅ Tailwind configured with custom fonts (serif headers, sans body)
- ✅ Path aliases (@/* → src/*)
- ✅ Vite proxy to backend API
- ✅ Strict TypeScript mode

## 🎯 Next Steps

### Awaiting UI Design Screenshots
The infrastructure is ready. Now we need the visual designs for:
1. **Dashboard Page** - With calendar heatmap, stats, XP progress
2. **Login/Register Pages** - Authentication forms
3. **Editor Page** - Editor.js integration with "No Goal, No Post" guard
4. **Post Renderer** - Display Editor.js JSON blocks
5. **Goal Modal** - "Start a Journey" flow

### Business Rules Ready
- ✅ JWT auth with auto-redirect on 401/403
- ✅ "No Goal, No Post" enforcement ready (needs UI integration)
- ✅ Two-step image upload flow for Editor.js
- ✅ Calendar heatmap data structure (365 days)

## 🔧 Development

```bash
# Install dependencies (already done)
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## 📝 Notes
- Backend API: http://localhost:8080
- Frontend Dev Server: http://localhost:5173
- All protected routes require `Authorization: Bearer <token>`
- Token stored in localStorage as `streak_auth_token`

---

**Status**: ✅ Infrastructure Complete - Ready for UI Implementation
