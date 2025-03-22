import { useQuery } from '@tanstack/react-query';

const GITHUB_API_URL = 'https://api.github.com/graphql';

// This would normally come from environment variables
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN || '';

if (!GITHUB_TOKEN) {
  console.warn('GitHub token not provided. GitHub API functionality will be limited.');
}

async function fetchGitHubAPI(query: string, variables = {}, token?: string) {
  const authToken = token || GITHUB_TOKEN;
  
  if (!authToken) {
    throw new Error('GitHub token is required for this operation');
  }
  
  console.log(`Fetching GitHub API with token: ${authToken ? 'Token provided' : 'No token'}`);
  console.log('GitHub token length:', authToken.length);
  console.log('Query:', query);
  console.log('Variables:', variables);
  
  try {
    const response = await fetch(GITHUB_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({ query, variables }),
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      console.error('GitHub API error response:', responseData);
      throw new Error(`GitHub API error: ${response.statusText} (${response.status})`);
    }

    if (responseData.errors) {
      console.error('GitHub GraphQL errors:', responseData.errors);
      throw new Error(responseData.errors.map((e: any) => e.message).join('\n'));
    }
    
    return responseData.data;
  } catch (error) {
    console.error('Error fetching from GitHub API:', error);
    throw error;
  }
}

// Query hook for user's repositories
export function useUserRepositories(token?: string) {
  return useQuery({
    queryKey: ['userRepositories', token],
    queryFn: async () => {
      // Ensure we have a token
      if (!token) {
        console.error('No GitHub token provided for useUserRepositories');
        throw new Error('GitHub token is required to fetch repositories');
      }
      
      const query = `
        query GetUserRepositories {
          viewer {
            login
            repositories(first: 100, orderBy: {field: UPDATED_AT, direction: DESC}) {
              totalCount
              nodes {
                name
                nameWithOwner
                owner {
                  login
                }
                description
                url
                stargazerCount
                forkCount
                hasDiscussionsEnabled
                isPrivate
              }
            }
          }
        }
      `;
      
      console.log('Fetching user repositories with token:', token ? 'Token available' : 'No token');
      return fetchGitHubAPI(query, {}, token);
    },
    enabled: Boolean(token),
    retry: 1,
    retryDelay: 1000,
  });
}

// Example query hook for user profile
export function useGitHubUserProfile(username: string, token?: string) {
  return useQuery({
    queryKey: ['githubUser', username],
    queryFn: async () => {
      const query = `
        query GetUser($username: String!) {
          user(login: $username) {
            login
            name
            avatarUrl
            bio
            url
            repositories(first: 10, orderBy: {field: UPDATED_AT, direction: DESC}) {
              nodes {
                name
                description
                url
                stargazerCount
                forkCount
              }
            }
          }
        }
      `;
      
      return fetchGitHubAPI(query, { username }, token);
    },
    enabled: Boolean(username) && Boolean(token || GITHUB_TOKEN),
  });
}

// Query hook for repository discussion categories
export function useRepositoryDiscussionCategories(owner: string, name: string, token?: string) {
  return useQuery({
    queryKey: ['repositoryDiscussionCategories', owner, name, token],
    queryFn: async () => {
      const query = `
        query GetRepositoryDiscussionCategories($owner: String!, $name: String!) {
          repository(owner: $owner, name: $name) {
            discussionCategories(first: 25) {
              nodes {
                id
                name
                emoji
                description
              }
            }
          }
        }
      `;
      
      return fetchGitHubAPI(query, { owner, name }, token);
    },
    enabled: Boolean(owner) && Boolean(name) && Boolean(token),
  });
}

// Example query hook for repository data
export function useGitHubRepository(owner: string, name: string, token?: string) {
  return useQuery({
    queryKey: ['githubRepo', owner, name, token],
    queryFn: async () => {
      const query = `
        query GetRepository($owner: String!, $name: String!) {
          repository(owner: $owner, name: $name) {
            name
            description
            url
            stargazerCount
            forkCount
            hasDiscussionsEnabled
            issues(first: 5, states: OPEN) {
              nodes {
                title
                url
                number
              }
            }
            pullRequests(first: 5, states: OPEN) {
              nodes {
                title
                url
                number
              }
            }
          }
        }
      `;
      
      return fetchGitHubAPI(query, { owner, name }, token);
    },
    enabled: Boolean(owner) && Boolean(name) && Boolean(token),
  });
}
