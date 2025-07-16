'use client';

import { useServers } from '@/hooks/useServers';
import { Server, Database, Cpu, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { utils } from '@/lib/api';

export function StatsSection() {
  const { data: serversData } = useServers({ limit: 100 });
  const servers = serversData?.servers || [];

  // Calculate stats
  const totalServers = servers.length;
  const technologies = servers.reduce((acc, server) => {
    const tech = utils.extractTechnology(server);
    acc[tech] = (acc[tech] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const categories = servers.reduce((acc, server) => {
    const category = utils.extractCategory(server);
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const recentlyUpdated = servers.filter(server => {
    const daysSinceUpdate = (Date.now() - new Date(server.version_detail.release_date).getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceUpdate <= 30;
  }).length;

  const stats = [
    {
      icon: Server,
      label: 'Total Servers',
      value: totalServers.toLocaleString(),
      description: 'Available MCP servers',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: Cpu,
      label: 'Technologies',
      value: Object.keys(technologies).length.toString(),
      description: 'Programming languages',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      icon: Database,
      label: 'Categories',
      value: Object.keys(categories).length.toString(),
      description: 'Server categories',
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      icon: Globe,
      label: 'Recently Updated',
      value: recentlyUpdated.toString(),
      description: 'Updated this month',
      color: 'text-database',
      bgColor: 'bg-database/10',
    },
  ];

  return (
    <section className="py-16 border-b bg-gradient-to-r from-background via-muted/30 to-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center group"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${stat.bgColor} ${stat.color} mb-4 group-hover:scale-110 transition-transform duration-200`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                  className="text-2xl lg:text-3xl font-bold text-foreground"
                >
                  {stat.value}
                </motion.div>
                <div className="text-sm font-medium text-foreground">
                  {stat.label}
                </div>
                <div className="text-xs text-muted-foreground">
                  {stat.description}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}