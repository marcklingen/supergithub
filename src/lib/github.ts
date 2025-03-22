import { useQuery, useMutation, UseQueryOptions } from '@tanstack/react-query';

const GITHUB_API_URL = 'https://api.github.com/graphql';

async function fetchGitHubAPI(query: string, variables = {}, token?: string) {
  if (!token) {
    console.error('No GitHub token provided for GitHub API request');
    throw new Error('GitHub token is required for this operation');
  }
  
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
    
    // Check for organization access error specifically
    const orgAccessError = responseData.errors?.some((error: any) => 
      (error.type === 'FORBIDDEN' && 
       (error.message.includes('resource not accessible by integration') || 
        error.message.includes('Resource not accessible by integration'))) ||
      error.message.includes("The 'login' field requires one of the following scopes")
    );
    
    if (orgAccessError) {
      console.warn('Limited GitHub organization access permissions. Some organization repositories may not be visible.');
      
      // Return partial data with an error flag
      if (responseData.data) {
        return {
          ...responseData.data,
          _orgAccessError: true,
        };
      }
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

export function useUserRepositories(token?: string | null) {
  return useQuery({
    queryKey: ['userRepositories', token],
    queryFn: async () => {
      if (!token) {
        console.error('No GitHub token provided for useUserRepositories');
        throw new Error('GitHub token is required to fetch repositories');
      }
      
      const personalReposQuery = `
        query GetUserPersonalRepositories {
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
      
      // First fetch personal repositories (this should always work with a valid token)
      const personalData = await fetchGitHubAPI(personalReposQuery, {}, token);
      
      try {
        // Then attempt to fetch organization repositories (may fail if missing read:org scope)
        const orgReposQuery = `
          query GetUserOrganizationRepositories {
            viewer {
              login
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
        
        const orgData = await fetchGitHubAPI(orgReposQuery, {}, token);
        
        // Successfully got both, combine them
        return {
          viewer: {
            ...personalData.viewer,
            organizations: orgData.viewer.organizations
          }
        };
      } catch (error) {
        console.warn('Failed to load organization repositories, proceeding with personal repos only:', error);
        
        // Return only personal repositories with a flag indicating org access error
        return {
          ...personalData,
          _orgAccessError: true
        };
      }
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
    queryKey: ['repositoryDiscussions', owner, name, categoryId, after],
    queryFn: async () => {
      if (!token) {
        throw new Error('GitHub token is required for this operation');
      }
      
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
      
      console.log('Fetching discussions with categoryId:', categoryId);
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
    staleTime: 1000 * 60 * 5, // Keep data fresh for 5 minutes
    gcTime: 1000 * 60 * 10, // Keep unused data in cache for 10 minutes
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
      if (!token) {
        throw new Error('GitHub token is required for this operation');
      }
      
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
              isAnswered
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
                  isAnswer
                  replyTo {
                    id
                  }
                  replies(first: 20) {
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
                      isAnswer
                      replyTo {
                        id
                      }
                      replies(first: 10) {
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
                          isAnswer
                          replyTo {
                            id
                          }
                        }
                      }
                      reactions(first: 10) {
                        nodes {
                          content
                        }
                      }
                    }
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
      
      console.log('Fetching discussion details for number:', number);
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

export function useAddDiscussionComment() {
  return useMutation({
    mutationFn: async ({ 
      discussionId, 
      body, 
      replyToId = null,
      token 
    }: { 
      discussionId: string; 
      body: string;
      replyToId?: string | null;
      token?: string | null 
    }) => {
      if (!token) {
        throw new Error('GitHub token is required for this operation');
      }

      const query = `
        mutation AddDiscussionComment($input: AddDiscussionCommentInput!) {
          addDiscussionComment(input: $input) {
            comment {
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
      `;

      const variables = {
        input: {
          discussionId,
          body,
          ...(replyToId && { replyToId }),
        }
      };

      console.log('Adding comment to discussion with ID:', discussionId);
      console.log('Variables being sent:', JSON.stringify(variables, null, 2));
      
      return fetchGitHubAPI(query, variables, token);
    }
  });
}
