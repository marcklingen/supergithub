
import { useEffect } from 'react';
import { Discussion } from '@/lib/github';

interface UseDiscussionPrefetchProps {
  githubToken: string | null;
  activeRepository: { owner: string; name: string } | null;
  prevDiscussion: Discussion | null;
  nextDiscussion: Discussion | null;
}

export const useDiscussionPrefetch = ({
  githubToken,
  activeRepository,
  prevDiscussion,
  nextDiscussion,
}: UseDiscussionPrefetchProps) => {
  useEffect(() => {
    if (githubToken && activeRepository) {
      // Prefetch the next discussion details
      if (nextDiscussion) {
        const prefetchNext = async () => {
          try {
            const queryClient = window.queryClient; // Assuming queryClient is globally accessible
            if (queryClient) {
              await queryClient.prefetchQuery({
                queryKey: ['discussionDetails', activeRepository.owner, activeRepository.name, nextDiscussion.number, githubToken],
                queryFn: () => fetch(`https://api.github.com/graphql`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${githubToken}`,
                  },
                  body: JSON.stringify({
                    query: `
                      query GetDiscussionDetails($owner: String!, $name: String!, $number: Int!) {
                        repository(owner: $owner, name: $name) {
                          discussion(number: $number) {
                            id
                          }
                        }
                      }
                    `,
                    variables: { 
                      owner: activeRepository.owner, 
                      name: activeRepository.name, 
                      number: nextDiscussion.number 
                    }
                  }),
                }).then(r => r.json()),
              });
            }
          } catch (e) {
            console.log('Prefetch error:', e);
          }
        };
        
        prefetchNext();
      }
      
      // Prefetch the previous discussion details
      if (prevDiscussion) {
        const prefetchPrev = async () => {
          try {
            const queryClient = window.queryClient;
            if (queryClient) {
              await queryClient.prefetchQuery({
                queryKey: ['discussionDetails', activeRepository.owner, activeRepository.name, prevDiscussion.number, githubToken],
                queryFn: () => fetch(`https://api.github.com/graphql`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${githubToken}`,
                  },
                  body: JSON.stringify({
                    query: `
                      query GetDiscussionDetails($owner: String!, $name: String!, $number: Int!) {
                        repository(owner: $owner, name: $name) {
                          discussion(number: $number) {
                            id
                          }
                        }
                      }
                    `,
                    variables: { 
                      owner: activeRepository.owner, 
                      name: activeRepository.name, 
                      number: prevDiscussion.number 
                    }
                  }),
                }).then(r => r.json()),
              });
            }
          } catch (e) {
            console.log('Prefetch error:', e);
          }
        };
        
        prefetchPrev();
      }
    }
  }, [activeRepository, githubToken, nextDiscussion, prevDiscussion]);
};
