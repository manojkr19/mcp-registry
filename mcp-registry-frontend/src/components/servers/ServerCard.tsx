'use client';

import Link from 'next/link';
import { ExternalLink, Star, GitBranch, Clock, Package } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Server } from '@/lib/types';
import { utils } from '@/lib/api';
import { motion } from 'framer-motion';

interface ServerCardProps {
  server: Server;
  className?: string;
}

export function ServerCard({ server, className }: ServerCardProps) {
  const technology = utils.extractTechnology(server);
  const category = utils.extractCategory(server);
  const techColor = utils.getTechnologyColor(technology);
  const relativeTime = utils.formatRelativeTime(server.version_detail.release_date);
  const githubInfo = utils.getGitHubInfo(server.repository.url);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
      className={className}
      style={{ minWidth: 0, width: '100%' }}
    >
      <Card className="h-full group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/80" 
            style={{ 
              overflow: 'hidden', 
              width: '100%', 
              minWidth: 0,
              wordBreak: 'break-word'
            }}>
        <CardHeader className="pb-3" style={{ overflow: 'hidden', minWidth: 0 }}>
          <div className="flex items-start justify-between gap-2" style={{ width: '100%', minWidth: 0 }}>
            <div className="flex-1" style={{ minWidth: 0, overflow: 'hidden', width: '100%' }}>
              <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                <Link href={`/server/${server.id}`} className="hover:underline block" style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '100%',
                  width: '100%',
                  minWidth: 0,
                  wordBreak: 'break-all'
                }}>
                  {server.name}
                </Link>
              </CardTitle>
              {githubInfo && (
                <p className="text-sm text-muted-foreground mt-1" style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '100%',
                  width: '100%',
                  minWidth: 0,
                  wordBreak: 'break-all'
                }}>
                  {githubInfo.owner}/{githubInfo.repo}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              asChild
            >
              <Link 
                href={server.repository.url} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
                <span className="sr-only">View repository</span>
              </Link>
            </Button>
          </div>
          
          <CardDescription className="text-sm leading-relaxed" style={{
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            maxWidth: '100%',
            width: '100%',
            minWidth: 0,
            wordBreak: 'break-word'
          }}>
            {server.description || 'No description available.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-0" style={{ overflow: 'hidden', minWidth: 0 }}>
          <div className="space-y-4" style={{ width: '100%', overflow: 'hidden', minWidth: 0 }}>
            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              <Badge 
                variant="secondary" 
                className={`text-xs font-medium ${techColor}`}
              >
                {technology}
              </Badge>
              {category !== 'Other' && (
                <Badge variant="outline" className="text-xs">
                  {category}
                </Badge>
              )}
              {server.version_detail.is_latest && (
                <Badge variant="outline" className="text-xs text-success border-success/20">
                  Latest
                </Badge>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Package className="h-3 w-3" />
                  <span>v{server.version_detail.version}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{relativeTime}</span>
                </div>
              </div>

              {/* Repository type */}
              <div className="flex items-center space-x-1">
                <GitBranch className="h-3 w-3" />
                <span className="capitalize">{server.repository.source}</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex justify-between items-center pt-2 border-t border-border/50">
              <Link 
                href={`/server/${server.id}`}
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                View Details →
              </Link>
              
              <div className="flex items-center space-x-2">
                {githubInfo && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    asChild
                  >
                    <Link 
                      href={server.repository.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1"
                    >
                      <Star className="h-3 w-3" />
                      <span>Star</span>
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}