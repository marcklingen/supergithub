
# React + Supabase + GitHub GraphQL Application

A modern web application built with React, Supabase, and GitHub's GraphQL API. This project provides a solid foundation for building scalable and performant web applications.

## Features

- **React**: Frontend built with React and TypeScript
- **Supabase**: Backend with authentication, database, and storage
- **GitHub GraphQL API**: Integration with GitHub's powerful GraphQL API
- **Tailwind CSS**: Utility-first CSS framework for styling
- **React Query**: Data fetching and state management
- **React Router**: Client-side routing

## Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Supabase account
- GitHub account (for API access)

## Getting Started

### Environment Setup

Create a `.env` file in the root directory with the following variables:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GITHUB_TOKEN=your_github_personal_access_token
```

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/your-repo-name.git
   cd your-repo-name
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

## Project Structure

```
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   │   ├── layout/      # Layout components
│   │   └── ui-custom/   # Custom UI components
│   ├── lib/             # Utility functions and services
│   ├── pages/           # Page components
│   ├── App.tsx          # App component with routing
│   ├── index.css        # Global styles
│   └── main.tsx         # Entry point
├── .env                 # Environment variables (create this)
├── index.html           # HTML template
└── package.json         # Project dependencies
```

## Build and Deployment

### Build for Production

```bash
npm run build
# or
yarn build
```

The build output will be in the `dist` directory.

### Deploy to Vercel

1. Push your code to GitHub
2. Create a new project on Vercel
3. Connect your GitHub repository
4. Configure environment variables
5. Deploy

### Deploy to Netlify

1. Push your code to GitHub
2. Create a new site on Netlify
3. Connect your GitHub repository
4. Configure environment variables
5. Deploy

## Testing

Run tests with:

```bash
npm run test
# or
yarn test
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
