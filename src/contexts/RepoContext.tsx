
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface Repository {
  owner: string;
  name: string;
  fullName: string; // "owner/name" format
  url?: string;
}

interface RepoContextType {
  repositories: Repository[];
  addRepository: (ownerName: string) => void;
  removeRepository: (fullName: string) => void;
  activeRepository: Repository | null;
  setActiveRepository: (repo: Repository | null) => void;
}

const RepoContext = createContext<RepoContextType | undefined>(undefined);

export function RepoProvider({ children }: { children: React.ReactNode }) {
  const [repositories, setRepositories] = useState<Repository[]>(() => {
    const stored = localStorage.getItem('connectedRepos');
    return stored ? JSON.parse(stored) : [];
  });
  const [activeRepository, setActiveRepository] = useState<Repository | null>(null);
  const { user } = useAuth();

  // Load active repository from localStorage on initial render
  useEffect(() => {
    const storedActiveRepo = localStorage.getItem('activeRepo');
    if (storedActiveRepo && repositories.length > 0) {
      const repo = JSON.parse(storedActiveRepo);
      setActiveRepository(repo);
    }
  }, [repositories]);

  // Save repositories to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('connectedRepos', JSON.stringify(repositories));
  }, [repositories]);

  // Save active repository to localStorage whenever it changes
  useEffect(() => {
    if (activeRepository) {
      localStorage.setItem('activeRepo', JSON.stringify(activeRepository));
    } else {
      localStorage.removeItem('activeRepo');
    }
  }, [activeRepository]);

  const addRepository = (ownerName: string) => {
    // Parse owner/name format
    const [owner, name] = ownerName.split('/');
    
    if (!owner || !name) {
      throw new Error('Invalid repository format. Please use "owner/name"');
    }
    
    const newRepo = {
      owner,
      name,
      fullName: `${owner}/${name}`
    };
    
    // Check if repository already exists
    if (!repositories.some(repo => repo.fullName === newRepo.fullName)) {
      const updatedRepos = [...repositories, newRepo];
      setRepositories(updatedRepos);
      
      // If this is the first repository, set it as active
      if (updatedRepos.length === 1) {
        setActiveRepository(newRepo);
      }
    }
  };

  const removeRepository = (fullName: string) => {
    const updatedRepos = repositories.filter(repo => repo.fullName !== fullName);
    setRepositories(updatedRepos);
    
    // If active repository was removed, set the first available one as active
    if (activeRepository?.fullName === fullName) {
      setActiveRepository(updatedRepos.length > 0 ? updatedRepos[0] : null);
    }
  };

  return (
    <RepoContext.Provider value={{
      repositories,
      addRepository,
      removeRepository,
      activeRepository,
      setActiveRepository
    }}>
      {children}
    </RepoContext.Provider>
  );
}

export function useRepo() {
  const context = useContext(RepoContext);
  if (context === undefined) {
    throw new Error('useRepo must be used within a RepoProvider');
  }
  return context;
}
