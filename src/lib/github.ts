
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
  
  try {
    const response = await fetch(GITHUB_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.errors) {
      throw new Error(data.errors.map((e: any) => e.message).join('\n'));
    }
    
    return data.data;
  } catch (error) {
    console.error('Error fetching from GitHub API:', error);
    throw error;
  }
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

// Query hook for user's repositories
export function useUserRepositories(token?: string) {
  return useQuery({
    queryKey: ['userRepositories', token],
    queryFn: async () => {
      const query = `
        query GetUserRepositories {
          viewer {
            login
            repositories(first: 50, orderBy: {field: UPDATED_AT, direction: DESC}) {
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
              }
            }
          }
        }
      `;
      
      return fetchGitHubAPI(query, {}, token);
    },
    enabled: Boolean(token),
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
