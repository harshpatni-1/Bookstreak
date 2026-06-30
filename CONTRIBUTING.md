# Contributing to BookStreak

First off, thank you for considering contributing to BookStreak! It's people like you who make the open-source community such an amazing place to learn, inspire, and create.

Please take a moment to review this document to make the contribution process smooth and easy for everyone.

## Code of Conduct

By participating in this project, you agree to keep interactions friendly, respectful, and constructive.

## How Can I Contribute?

### Reporting Bugs

Before submitting a bug report:
1. Check the existing issues to see if the bug has already been reported.
2. Make sure you are using the latest version of the code.

When reporting a bug, please include:
- A clear, descriptive title.
- Steps to reproduce the issue.
- Your environment details (browser version, OS, local Node.js version).
- Screenshots or recordings if applicable.

### Suggesting Enhancements

We are always open to new ideas! If you have a feature request:
1. Open an issue explaining the feature and why it would be useful.
2. Describe how it should work and any potential edge cases.

### Submitting Pull Requests (PRs)

1. **Fork the repository** and create your branch from `main`.
2. **Install dependencies** using `npm install`.
3. **Make your changes**. Ensure you write clean, typed code (TypeScript) and follow the existing code style.
4. **Lint and Typecheck**: Run `npm run lint` and verify there are no TypeScript compile errors.
5. **Commit your changes** with a clear, concise commit message.
6. **Push to your fork** and submit a pull request to our `main` branch.
7. Write a descriptive PR summary explaining what you changed and why.

## Development Setup

BookStreak uses **Next.js 15 (App Router)** and **Supabase**.

1. Copy `.env.local.example` to `.env.local` and add your Supabase credentials:
   ```bash
   cp .env.local.example .env.local
   ```
2. Apply the database schema by running the migrations in `supabase/migrations/` inside your Supabase project's SQL editor (or using the Supabase CLI: `supabase db push`).
3. Run the development server:
   ```bash
   npm run dev
   ```

## Coding Guidelines

- **TypeScript**: We enforce strict type checking. Avoid using `any` types.
- **Supabase / Postgres**: Keep streak and progression computations in database triggers (`supabase/migrations/`) to maintain a single source of truth and preserve the "honest streak" mechanism.
- **Server Actions**: All mutations must be handled by Server Actions with strict Zod validation.

Thank you for your support!
