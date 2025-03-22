
import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Button from '@/components/ui-custom/Button';
import { Card, CardContent } from '@/components/ui-custom/Card';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <motion.div 
              className="flex flex-col justify-center space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="space-y-2">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <span className="inline-block px-3 py-1 mb-2 text-xs font-medium tracking-wider text-primary bg-primary/10 rounded-full">
                    React + Supabase + GitHub GraphQL
                  </span>
                </motion.div>
                <motion.h1 
                  className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  Build amazing applications with modern tools
                </motion.h1>
                <motion.p 
                  className="max-w-[600px] text-muted-foreground md:text-xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  A powerful foundation for your next project using React, Supabase, and GitHub's GraphQL API.
                </motion.p>
              </div>
              <motion.div 
                className="flex flex-col sm:flex-row gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <Button size="lg">Get Started</Button>
                <Button size="lg" variant="outline">View Documentation</Button>
              </motion.div>
            </motion.div>
            
            <motion.div
              className="relative lg:ml-auto"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-2xl" />
                <Card variant="glass" className="overflow-hidden relative z-10">
                  <CardContent className="p-0">
                    <div className="p-1 bg-gradient-to-b from-gray-900 to-gray-800 rounded-md">
                      <div className="flex items-center gap-2 px-4 pt-3 pb-2">
                        <div className="flex gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-red-500" />
                          <div className="w-3 h-3 rounded-full bg-yellow-500" />
                          <div className="w-3 h-3 rounded-full bg-green-500" />
                        </div>
                        <div className="text-xs text-gray-400 flex-1 text-center">Terminal</div>
                      </div>
                      <div className="bg-gray-950 p-4 text-green-400 font-mono text-sm rounded-b-md">
                        <p>$ npm create vite my-app</p>
                        <p>$ cd my-app</p>
                        <p>$ npm install @supabase/supabase-js</p>
                        <p>$ npm install @tanstack/react-query</p>
                        <p className="flex items-center">
                          <span className="mr-1">$ npm run dev</span>
                          <span className="w-2 h-4 bg-green-400 animate-pulse inline-block ml-1"></span>
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-12 md:py-24 bg-secondary/50">
        <div className="container px-4 md:px-6">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Key Features</h2>
            <p className="text-muted-foreground md:text-xl max-w-[700px] mx-auto">
              Everything you need to build modern, fast, and scalable applications
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full">
                  <CardContent className="pt-6">
                    <div className="rounded-full w-12 h-12 flex items-center justify-center bg-primary/10 text-primary mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Ready to get started?</h2>
              <p className="text-muted-foreground md:text-xl max-w-[600px] mx-auto">
                Join thousands of developers building with our modern stack
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg">Create Account</Button>
              <Button size="lg" variant="outline">View GitHub</Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t py-6 md:py-8">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="flex items-center space-x-4">
              <a href="#" className="text-muted-foreground hover:text-foreground">GitHub</a>
              <a href="#" className="text-muted-foreground hover:text-foreground">Twitter</a>
              <a href="#" className="text-muted-foreground hover:text-foreground">Discord</a>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Your Company. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Features data
const features = [
  {
    title: "React",
    description: "Build interactive UIs with the most popular frontend library",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.5h.008v.008H9V15.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM12 18.75a.75.75 0 100-1.5.75.75 0 000 1.5z" />
      </svg>
    )
  },
  {
    title: "Supabase",
    description: "Backend with authentication, database, and storage",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
      </svg>
    )
  },
  {
    title: "GitHub GraphQL",
    description: "Access GitHub data with powerful GraphQL queries",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
      </svg>
    )
  },
  {
    title: "Tailwind CSS",
    description: "Utility-first CSS framework for rapid UI development",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
      </svg>
    )
  },
  {
    title: "TypeScript",
    description: "Type-safe JavaScript for better developer experience",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
      </svg>
    )
  },
  {
    title: "React Query",
    description: "Data fetching library for managing server state",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
    )
  }
];

export default Index;
