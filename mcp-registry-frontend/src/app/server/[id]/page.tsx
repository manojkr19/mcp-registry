'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Github, ExternalLink, Download, Users, Star, GitFork, Copy, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api, utils } from '@/lib/api';
import type { ServerDetail } from '@/types/server';

export default function ServerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [server, setServer] = useState<ServerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedCommands, setCopiedCommands] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchServer = async () => {
      try {
        setLoading(true);
        const response = await api.getServerById(params.id as string);
        setServer(response);
      } catch (err) {
        setError('Failed to load server details');
        console.error('Error fetching server:', err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchServer();
    }
  }, [params.id]);

  const copyToClipboard = async (text: string, commandType: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCommands(prev => ({ ...prev, [commandType]: true }));
      setTimeout(() => {
        setCopiedCommands(prev => ({ ...prev, [commandType]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !server) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <p className="text-red-600 mb-4">{error || 'Server not found'}</p>
            <Button onClick={() => router.push('/')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Servers
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const technology = utils.extractTechnology(server);
  const category = utils.extractCategory(server);
  const installCommand = `npx @modelcontextprotocol/cli install ${server.id}`;
  const pipInstallCommand = server.packages?.[0]?.registry_name === 'pip' ? `pip install ${server.packages[0].name}` : '';

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <Button
          onClick={() => router.push('/')}
          variant="ghost"
          className="hover:bg-blue-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Servers
        </Button>
      </motion.div>

      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="space-y-2">
                <CardTitle className="text-3xl font-bold text-gray-900">
                  {server.name}
                </CardTitle>
                <CardDescription className="text-lg text-gray-600 max-w-3xl">
                  {server.description}
                </CardDescription>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {technology}
                  </Badge>
                  {category !== 'Other' && (
                    <Badge variant="outline" className="border-blue-200">
                      {category}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                {server.repository?.url && (
                  <Button asChild variant="outline" className="border-blue-200 hover:bg-blue-50">
                    <a
                      href={server.repository.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center"
                    >
                      <Github className="w-4 h-4 mr-2" />
                      GitHub
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </Button>
                )}
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Download className="w-4 h-4 mr-2" />
                  Install
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Installation Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Download className="w-5 h-5 mr-2" />
                Installation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="mcp-cli" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="mcp-cli">MCP CLI</TabsTrigger>
                  <TabsTrigger value="manual" disabled={!pipInstallCommand}>
                    Manual Install
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="mcp-cli" className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Install using the MCP CLI (recommended):
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <code className="text-sm font-mono">{installCommand}</code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(installCommand, 'mcp-cli')}
                        className="ml-2"
                      >
                        {copiedCommands['mcp-cli'] ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                {pipInstallCommand && (
                  <TabsContent value="manual" className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Install manually using pip:
                    </p>
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <code className="text-sm font-mono">{pipInstallCommand}</code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(pipInstallCommand, 'pip')}
                          className="ml-2"
                        >
                          {copiedCommands['pip'] ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                )}
              </Tabs>
            </CardContent>
          </Card>

          {/* Tools Section */}
          {server.tools && server.tools.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Available Tools</CardTitle>
                <CardDescription>
                  This server provides {server.tools.length} tool{server.tools.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {server.tools.map((tool, index) => (
                    <motion.div
                      key={tool.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{tool.name}</h4>
                          {tool.description && (
                            <p className="text-sm text-gray-600 mt-1">{tool.description}</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Resources Section */}
          {server.resources && server.resources.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Available Resources</CardTitle>
                <CardDescription>
                  This server provides {server.resources.length} resource{server.resources.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {server.resources.map((resource, index) => (
                    <motion.div
                      key={resource.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{resource.name}</h4>
                          {resource.description && (
                            <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                          )}
                          {resource.uri && (
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-2 inline-block">
                              {resource.uri}
                            </code>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          {/* Repository Info */}
          {server.repository && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Repository</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Owner</span>
                  <span className="font-medium">{server.repository.owner}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Name</span>
                  <span className="font-medium">{server.repository.name}</span>
                </div>
                {server.repository.url && (
                  <>
                    <Separator />
                    <Button asChild variant="outline" className="w-full">
                      <a
                        href={server.repository.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center"
                      >
                        <Github className="w-4 h-4 mr-2" />
                        View on GitHub
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Package Info */}
          {server.packages && server.packages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Packages</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {server.packages.map((pkg, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize">{pkg.registry_name}</span>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {pkg.name}
                    </code>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Version Info */}
          {server.version_detail && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Version</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Current</span>
                  <Badge variant="outline">{server.version_detail.version}</Badge>
                </div>
                {server.version_detail.release_date && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Published</span>
                    <span className="text-sm">
                      {utils.formatDate(server.version_detail.release_date)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="text-sm text-gray-600">Tools</span>
                </div>
                <span className="font-medium">
                  {server.tools?.length || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Star className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="text-sm text-gray-600">Resources</span>
                </div>
                <span className="font-medium">
                  {server.resources?.length || 0}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}