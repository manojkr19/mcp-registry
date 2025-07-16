import Link from 'next/link';
import { Server, Github, ExternalLink, Heart } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2 text-lg font-semibold">
              <Server className="h-5 w-5 text-primary" />
              <span>MCP Registry</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Discover and share Model Context Protocol servers for AI applications.
            </p>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="font-semibold">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  href="https://modelcontextprotocol.io/docs" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-1"
                >
                  <span>MCP Documentation</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </li>
              <li>
                <Link 
                  href="https://modelcontextprotocol.io/quickstart" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-1"
                >
                  <span>Quick Start Guide</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </li>
              <li>
                <Link 
                  href="https://github.com/modelcontextprotocol/servers" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-1"
                >
                  <span>Official Servers</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div className="space-y-4">
            <h3 className="font-semibold">Community</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  href="https://github.com/modelcontextprotocol/registry" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-1"
                >
                  <Github className="h-3 w-3" />
                  <span>Registry Source</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="https://github.com/modelcontextprotocol/registry/issues" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-1"
                >
                  <span>Report Issues</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </li>
              <li>
                <Link 
                  href="https://github.com/modelcontextprotocol/registry/blob/main/CONTRIBUTING.md" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-1"
                >
                  <span>Contributing</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Developer */}
          <div className="space-y-4">
            <h3 className="font-semibold">Developer</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  href="/api-docs" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  API Documentation
                </Link>
              </li>
              <li>
                <Link 
                  href="https://modelcontextprotocol.io/specification" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-1"
                >
                  <span>MCP Specification</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </li>
              <li>
                <Link 
                  href="https://modelcontextprotocol.io/tutorials" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-1"
                >
                  <span>Tutorials</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-8 border-t flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <p className="text-sm text-muted-foreground">
            © {currentYear} MCP Registry. Built with{' '}
            <Heart className="inline h-3 w-3 text-red-500" />{' '}
            for the AI community.
          </p>
          <p className="text-sm text-muted-foreground">
            Powered by{' '}
            <Link 
              href="https://modelcontextprotocol.io" 
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:text-foreground transition-colors"
            >
              Model Context Protocol
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}