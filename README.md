
# GitDiscuss - Superhuman for GitHub Discussions

A blazing-fast, keyboard-driven interface for managing GitHub Discussions built for open-source maintainers. GitDiscuss provides a Superhuman-like experience for navigating, reading, and replying to GitHub Discussions with private team collaboration features.

## 🚀 Core Features

- **Lightning-Fast UI & Keyboard Navigation**
  - Near-instant transitions with minimal mouse usage
  - Keyboard shortcuts (Cmd+K command palette, j/k navigation)
  - Prefetching and optimistic UI updates for desktop-like speed

- **Seamless GitHub Integration**
  - Sign in with GitHub OAuth
  - Access GitHub Discussions via GraphQL API
  - Post replies directly to GitHub Discussions

- **Team Collaboration Tools**
  - Private internal comments (invisible to public GitHub repo)
  - @Mentions & team notifications
  - Star/pin important discussion threads

- **Real-Time & Offline Capabilities**
  - Immediate updates to internal notes and notifications
  - Local caching for offline browsing
  - Responsive design for all devices

## 🔧 Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Supabase (Auth, Database, Realtime)
- **API**: GitHub GraphQL API
- **State Management**: React Query, Zustand
- **UI Components**: shadcn/ui

## 🚦 Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- GitHub account (with access to Discussions)
- Supabase account

### Environment Setup

Create a `.env` file in the root directory with:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/gitdiscuss.git
   cd gitdiscuss
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:8080`

## 💻 Development

This application was built with [Lovable](https://lovable.dev), an AI-powered web development tool that enables rapid iteration and real-time collaboration.

## 🔐 Security

- Authentication is handled securely through Supabase with GitHub OAuth
- Row Level Security ensures private data stays private to your team
- GitHub tokens remain client-side and are never stored on our servers

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
