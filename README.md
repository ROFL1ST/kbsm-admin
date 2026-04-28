# Supply Dashboard - Admin Supply-Demand Management

A modern admin dashboard application for supply-demand management built with React, TypeScript, and Tailwind CSS.

## 🚀 Features

### ✅ Available Now

- **Authentication**: Login with form validation and role-based access
- **Multi-Theme**: Dark/Light mode with consistent purple color system
- **Dashboard Overview**: KPI cards, area charts, and recent transactions
- **Inventory Management**: Grid/list view with minimum stock alerts
- **Incoming Supply**: Track supply with status and filters

### 🔄 In Development

- **Outgoing Items**: Demand and outgoing supply management
- **Finance**: Track income and expenses
- **User Management**: RBAC with admin/manager/viewer roles
- **Reports**: CSV/PDF export with data filters
- **Charts**: Supply vs demand analytics with Recharts

## 🛠 Tech Stack

- **Frontend**: React 18+ + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State**: React Context (Theme + Auth)
- **Routing**: React Router v6
- **Forms**: react-hook-form + zod validation
- **Icons**: lucide-react
- **Build**: Vite

## 🎨 Design System

### Dark Theme

- Background: `#0b0b0f` (near black)
- Surface Cards: `#0f1724`
- Text: `#e6e7ee`
- Accent Purple: `#7c3aed` (600/500/300 variants)

### Light Theme

- Background: `#ffffff`
- Surface: `#f5f6fb`
- Text: `#0b0b0f`
- Accent Purple: `#7c3aed`

### Transitions

- Theme switching: 250ms ease
- Component animations: Subtle fades and scale effects

## 📁 Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── DashboardLayout.tsx    # Main layout wrapper
│   │   ├── Sidebar.tsx           # Collapsible navigation
│   │   └── TopBar.tsx            # Header dengan search & user menu
│   └── ui/                       # shadcn/ui components
├── contexts/
│   ├── AuthContext.tsx           # Authentication state
│   └── ThemeProvider.tsx         # Dark/light theme
├── pages/
│   ├── LoginPage.tsx             # Form login dengan demo accounts
│   ├── DashboardPage.tsx         # Overview dengan KPI cards
│   ├── StockPage.tsx             # Manajemen inventori
│   └── IncomingPage.tsx          # Supply management
└── hooks/
    └── use-toast.ts              # Toast notifications
```

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```
