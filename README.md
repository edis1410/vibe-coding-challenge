# Splittify - Expense Sharing App

A modern expense tracking and splitting application built with Next.js, Supabase, and Tailwind CSS. Share expenses with friends and family, track who owes what, and settle up easily.

## Features

- 🔐 **Secure Authentication** - Email/password auth with Supabase
- 👥 **Group Management** - Create and manage expense groups
- 💰 **Expense Tracking** - Add expenses with automatic equal splitting
- 📊 **Smart Balance Calculation** - See who owes whom
- 🔄 **Debt Simplification** - Minimize transactions needed to settle
- ✅ **Settlement Tracking** - Record payments and view history
- 📱 **Responsive Design** - Beautiful UI that works on all devices

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd vibe-coding-challenge
npm install
```
### 2. Add the keys

- Create a .env.local file
- Paste the keys from the documentation file

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Usage

1. **Sign Up/Sign In** - Create an account or sign in
2. **Create a Group** - Start a new expense group
3. **Add Expenses** - Record expenses and split them equally
4. **View Balances** - See who owes what in real-time
5. **Settle Up** - Record payments to settle debts

## Project Structure

```
src/
├── app/
│   ├── actions/          # Server actions for data operations
│   ├── auth/             # Authentication pages
│   └── dashboard/        # Protected app pages
├── components/           # Reusable UI components
├── lib/
│   ├── calculations.ts   # Balance calculation logic
│   └── supabase/         # Supabase client setup
└── types/                # TypeScript type definitions
```
