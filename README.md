# FoodHub - Frontend App 🍔

## 📌 Project Description
FoodHub Frontend is a sophisticated, interactive Next.js application that provides the visual interface for an end-to-end meal ordering platform. It delivers three dedicated experiences: a customer portal for browsing and purchasing meals, a provider suite for comprehensive restaurant management, and an admin dashboard for entire ecosystem oversight.

## 🌐 Live URLs
- **Frontend Live URL**: [https://foodhub-frontend-vyqi.vercel.app/](https://foodhub-frontend-vyqi.vercel.app/)
- **Backend API Live URL**: [https://foodhubbackend-5iv9.onrender.com/](https://foodhubbackend-5iv9.onrender.com/)

## 🔑 Admin Credentials
- **Email**: `avi@gmail.com`
- **Password**: `asdfghjk`

## ✨ Comprehensive Features

### 🌍 Dynamic Public Interfaces
- **Hero & Landing Pages**: A visually striking homepage showcasing featured categories, top restaurants, and popular meals.
- **Advanced Filtering**: Live, rapid search parameters allowing users to filter cuisines, dietary requirements, and specific price ranges directly from the meals directory.
- **Provider Showcase**: Detailed individual profile pages for restaurants displaying their banners, info, and their complete dynamic menus.

### 🛍️ Customer Experience
- **Fluid Shopping Cart**: Easily manageable cart system, enabling smooth item additions, real-time total recalculations, and rapid item discarding.
- **Stripe Checkout UI**: Flawless incorporation of Stripe interactive Elements, permitting highly secure credit card validations and instant transactions entirely masked behind a professional UI.
- **Order Tracking**: End to end tracking flows allowing a user to visually see if their food is placed, preparing, ready, or actively being delivered.
- **Rating & Reviews**: An interactive UI for rating meals exclusively after successful delivery.

### 👨‍🍳 Provider Dashboard (Restaurants)
- **Menu Management UI**: An intuitive interface where vendors can effortlessly publish new meals, upload thumbnail images straight to the cloud, and establish meal pricing.
- **Profile Building**: Upload capabilities for restaurant logos, setting up business addresses, and declaring cuisine specialties.
- **Kanban-like Order Updates**: An active "Orders" stream showing incoming requests with instant dropdown functionalities to update meal statuses (`PREPARING`, `READY`, `DELIVERED`).

### 👑 Admin Control Panel
- **Global Analytics**: Visually intensive statistical charts outlining site-wide platform health—total customers, active revenue pools, and system user load.
- **User Auditing System**: The capability to view complete user directory lists alongside robust tools to instantly suspend or reactive unruly accounts to ensure safety.
- **Taxonomy Management**: Full capabilities to add and structure platform-wide food categories.

## 🛠️ Technologies Used
- **Framework**: Next.js (App Router, Server-Side Rendering)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Tailwind Merge (Utility-first CSS)
- **UI Components**: Shadcn UI, Radix UI Primitives, Lucide Icons, Recharts (Chart visuals)
- **Form Handling Tools**: React Hook Form with Zod schema validation
- **Data Fetching & Cache**: TanStack React Query (`@tanstack/react-query`), Axios
- **Authentication**: Better Auth hooks & Next.js native Cookie validation
- **Stripe Elements**: `@stripe/react-stripe-js` & `@stripe/stripe-js`

## 📂 Project Structure
```bash
src/
├── app/
│   ├── (commonLayout)/         # Public & customer pages (Navbar/Footer included)
│   │   ├── (authRouteGroup)/   # Auth routes: /login, /register
│   │   ├── checkout/           # /checkout - Order review and Stripe payment
│   │   ├── meals/              # /meals - All meals listing with filters
│   │   ├── restaurant/         # /restaurant/[id] - Dynamic restaurant details
│   │   └── restaurants/        # /restaurants - All restaurants listing
│   ├── (dashboardLayout)/      # Protected layouts (Sidebar navigation)
│   │   ├── admin/              # Admin dashboard, users, categories, analytics
│   │   ├── customer/           # Customer dashboard, orders, profile
│   │   └── provider/           # Provider (Restaurant) dashboard, menu, orders
│   ├── _actions/               # Next.js Server Actions (if any)
│   ├── favicon.ico             # App icon
│   ├── globals.css             # Global Tailwind Configuration
│   ├── layout.tsx              # Root application layout and providers wrapper
│   └── page.tsx                # Home Page (Landing)
├── components/                 # React UI Components
│   ├── modules/                # Domain-specific page components
│   │   ├── Admin/              # Admin dashboard components
│   │   ├── Auth/               # Login & Registration forms
│   │   ├── Customer/           # Customer profile & orders UI
│   │   ├── Dashboard/          # Shared dashboard elements
│   │   ├── Home/               # Homepage hero, sections
│   │   ├── Meal/               # Meal cards, filters, details
│   │   ├── Payment/            # Stripe integration components
│   │   ├── Provider/           # Restaurant dashboard UI
│   │   └── Restaurant/         # Restaurant cards & lists
│   ├── shared/                 # Shared UI elements
│   │   ├── Navbar.tsx          # Main navigation bar
│   │   ├── Footer.tsx          # Main footer
│   │   └── list/               # Shared listing wrappers
│   └── ui/                     # Shadcn UI base components (buttons, dialogs, etc.)
├── hooks/                      # Custom React hooks (e.g., auth, utility hooks)
├── lib/                        # Library configs (Axios, Better-Auth, Stripe)
├── providers/                  # Context providers (React Query, Theme, User Context)
├── services/                   # API service calls (data fetching logic)
├── types/                      # TypeScript interface and type definitions
└── zod/                        # Zod validation schemas
```

> **Note**: For a detailed breakdown of what UI components and sections are rendered on each specific page (Home, Meals, Checkout, Dashboards, etc.), please refer to the [PAGE_DETAILS.md](./PAGE_DETAILS.md) file.

## ⚙️ Environment Variables
Create a `.env.local` file in the root directory and configure the following variables:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

### 3. Boot the Next.js Development Server
```bash
npm run dev
```

The application will be accessible at [http://localhost:3000](http://localhost:3000).

## 📜 Available Scripts
- `npm run dev`: Boots the Next.js development server with hot-reloading.
- `npm run build`: Creates an optimized production build.
- `npm run start`: Runs the Node.js production server.
- `npm run lint`: Runs ESLint to check for code standard violations.

## 🎨 UI/UX Guidelines
When contributing to components or pages, please utilize the existing **Shadcn UI** pieces to maintain a unified and professional aesthetic. Ensure that every interactive element scales gracefully down to mobile viewport scopes.
