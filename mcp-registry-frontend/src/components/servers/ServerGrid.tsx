'use client';

import { Server } from '@/lib/types';
import { ServerCard } from './ServerCard';
import { ServerGridSkeleton } from './ServerGridSkeleton';
import { motion } from 'framer-motion';

interface ServerGridProps {
  servers: Server[];
  isLoading?: boolean;
  className?: string;
}

export function ServerGrid({ servers, isLoading = false, className }: ServerGridProps) {
  if (isLoading) {
    return <ServerGridSkeleton />;
  }

  if (servers.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto max-w-md">
          <div className="mx-auto h-24 w-24 text-muted-foreground/50 mb-4">
            <svg
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1}
              stroke="currentColor"
              className="w-full h-full"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No servers found
          </h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filter criteria to find more results.
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full overflow-hidden ${className}`}
    >
      {servers.map((server, index) => (
        <motion.div
          key={server.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className="w-full min-w-0 overflow-hidden"
        >
          <ServerCard server={server} />
        </motion.div>
      ))}
    </motion.div>
  );
}