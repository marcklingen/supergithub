import { useQuery, UseQueryOptions } from '@tanstack/react-query';

const GITHUB_API_URL = 'https://api.github.com/graphql';

async function fetchGitHubAPI(query: string, variables = {}, token?: string) {
  if (!token) {
    console.error('No GitHub token provided for GitHub API request');
    throw new Error('GitHub token is required for this operation');
  }
  
  console.log(`Fetching GitHub API with token available: ${token ? 'Yes' : 'No'}`);
  console.log('GitHub token length:', token.length);
  console.log('Query:', query);
  console.log('Variables:', variables);
  
  try {
    const response = await fetch(GITHUB_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('GitHub API error response:', text);
      throw new Error(`GitHub API error: ${response.statusText} (${response.status})`);
    }

    const responseData = await response.json();
    
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

export function useUserRepositories(token?: string | null) {
  return useQuery({
    queryKey: ['userRepositories', token],
    queryFn: async () => {
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
            organizations(first: 100) {
              nodes {
                login
                repositories(first: 100, orderBy: {field: UPDATED_AT, direction: DESC}) {
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
          }
        }
      `;
      
      console.log('Fetching user repositories (including organization repos) with token:', token ? 'Token available' : 'No token');
      return fetchGitHubAPI(query, {}, token);
    },
    enabled: Boolean(token),
    retry: 1,
    retryDelay: 1000,
  });
}

export function useRepositoryDiscussionCategories(owner: string, name: string, token?: string | null) {
  return useQuery({
    queryKey: ['repositoryDiscussionCategories', owner, name, token],
    queryFn: async () => {
      if (!token) {
        console.error('No GitHub token provided for useRepositoryDiscussionCategories');
        throw new Error('GitHub token is required for this operation');
      }
      
      const query = `
        query GetRepositoryDiscussionCategories($owner: String!, $name: String!) {
          repository(owner: $owner, name: $name) {
            discussionCategories(first: 25) {
              nodes {
                id
                name
                emoji
                description
                createdAt
                updatedAt
              }
            }
            hasDiscussionsEnabled
          }
        }
      `;
      
      console.log('Fetching discussion categories for', owner, name);
      return fetchGitHubAPI(query, { owner, name }, token);
    },
    enabled: Boolean(owner) && Boolean(name) && Boolean(token),
    retry: 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useRepositoryDiscussions(
  owner: string, 
  name: string, 
  categoryId: string,
  first: number = 10,
  after?: string,
  token?: string | null
) {
  return useQuery({
    queryKey: ['repositoryDiscussions', owner, name, categoryId, first, after, token],
    queryFn: async () => {
      const query = `
        query GetRepositoryDiscussions(
          $owner: String!, 
          $name: String!, 
          $categoryId: ID!, 
          $first: Int!, 
          $after: String
        ) {
          repository(owner: $owner, name: $name) {
            discussions(
              first: $first, 
              after: $after, 
              categoryId: $categoryId,
              orderBy: {field: UPDATED_AT, direction: DESC}
            ) {
              pageInfo {
                hasNextPage
                endCursor
              }
              totalCount
              nodes {
                id
                number
                title
                createdAt
                updatedAt
                upvoteCount
                author {
                  login
                  avatarUrl
                }
                comments {
                  totalCount
                }
                labels(first: 5) {
                  nodes {
                    id
                    name
                    color
                  }
                }
                category {
                  id
                  name
                  emoji
                }
              }
            }
          }
        }
      `;
      
      return fetchGitHubAPI(
        query, 
        { 
          owner, 
          name, 
          categoryId, 
          first, 
          after: after || null 
        }, 
        token
      );
    },
    enabled: Boolean(owner) && Boolean(name) && Boolean(categoryId) && Boolean(token),
  });
}

export function useDiscussionDetails(
  owner: string, 
  name: string, 
  number: number,
  token?: string | null
) {
  return useQuery({
    queryKey: ['discussionDetails', owner, name, number, token],
    queryFn: async () => {
      const query = `
        query GetDiscussionDetails($owner: String!, $name: String!, $number: Int!) {
          repository(owner: $owner, name: $name) {
            discussion(number: $number) {
              id
              number
              title
              bodyHTML
              createdAt
              updatedAt
              upvoteCount
              author {
                login
                avatarUrl
                url
              }
              category {
                id
                name
                emoji
              }
              comments(first: 50) {
                pageInfo {
                  hasNextPage
                  endCursor
                }
                totalCount
                nodes {
                  id
                  author {
                    login
                    avatarUrl
                    url
                  }
                  bodyHTML
                  createdAt
                  upvoteCount
                  replyTo {
                    id
                  }
                  reactions(first: 10) {
                    nodes {
                      content
                    }
                  }
                }
              }
            }
          }
        }
      `;
      
      return fetchGitHubAPI(query, { owner, name, number }, token);
    },
    enabled: Boolean(owner) && Boolean(name) && Boolean(number) && Boolean(token),
  });
}

export function useGitHubUserProfile(username: string, token?: string | null) {
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
    enabled: Boolean(username) && Boolean(token),
  });
}

export function useGitHubRepository(owner: string, name: string, token?: string | null) {
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
