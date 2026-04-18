# FoodHub - Frontend App 🍔

## 📌 Project Description
FoodHub Frontend is a sophisticated, interactive Next.js application that provides the visual interface for an end-to-end meal ordering platform. It delivers three dedicated experiences: a customer portal for browsing and purchasing meals, a provider suite for comprehensive restaurant management, and an admin dashboard for entire ecosystem oversight.

## 🌐 Live URLs
- **Frontend Live URL**: [https://foodhub-frontend-vyqi.vercel.app/](https://foodhub-frontend-vyqi.vercel.app/)
- **Backend API Live URL**: [https://foodhubbackend-5iv9.onrender.com/](https://foodhubbackend-5iv9.onrender.com/)

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
│   ├── (commonLayout)/     # Shared layout (Navbar, Footer) for public & customer pages
│   ├── (dashboardLayout)/  # Protected layouts tailored for Providers and Admins
│   ├── _actions/           # Server Actions (if any)
│   ├── globals.css         # Global Tailwind Configuration
│   └── layout.tsx          # Root application layout and providers wrapper
├── components/             # Reusable UI components (buttons, inputs, cards)
├── hooks/                  # Custom React hooks
├── lib/                    # Library configurations (Axios clients, Auth configurations)
├── types/                  # TypeScript interface and type definitions
└── utils/                  # Helper utilities and formatters
```

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
