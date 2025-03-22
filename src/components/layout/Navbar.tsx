
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui-custom/Button';
import { cn } from '@/lib/utils';

interface NavbarProps {
  className?: string;
}

const Navbar: React.FC<NavbarProps> = ({ className }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Change navbar style on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 md:px-6',
        isScrolled ? 'py-2 glass' : 'py-4 bg-transparent',
        className
      )}
    >
      <div className="container mx-auto flex items-center justify-between">
        <Link 
          to="/"
          className="text-xl font-semibold tracking-tight transition-colors hover:text-primary"
        >
          React • Supabase • GitHub
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
            Home
          </Link>
          <Link to="/github" className="text-sm font-medium hover:text-primary transition-colors">
            GitHub
          </Link>
          <Link to="/supabase" className="text-sm font-medium hover:text-primary transition-colors">
            Supabase
          </Link>
          <Link to="/about" className="text-sm font-medium hover:text-primary transition-colors">
            About
          </Link>
        </nav>
        
        <div className="flex items-center space-x-3">
          <Button size="sm" variant="outline">
            Sign In
          </Button>
          <Button size="sm">
            Sign Up
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
