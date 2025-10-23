'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  RefreshCw, 
  ExternalLink, 
  Monitor, 
  Smartphone, 
  Tablet,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LivePreviewProps {
  projectId?: string;
  devServerUrl?: string;
  className?: string;
}

export function LivePreview({ 
  projectId, 
  devServerUrl, 
  className 
}: LivePreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const viewportSizes = {
    desktop: { width: '100%', height: '100%' },
    tablet: { width: '768px', height: '1024px' },
    mobile: { width: '375px', height: '667px' },
  };

  const currentSize = viewportSizes[viewport];

  useEffect(() => {
    if (devServerUrl) {
      setIsLoading(true);
      setHasError(false);
      setErrorMessage('');
    }
  }, [devServerUrl, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    setIsLoading(true);
    setHasError(false);
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
    setErrorMessage('Failed to load preview. Make sure the development server is running.');
  };

  const openInNewTab = () => {
    if (devServerUrl) {
      window.open(devServerUrl, '_blank');
    }
  };

  return (
    <Card className={cn('flex flex-col h-full', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Live Preview
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex border rounded-md">
              <Button
                size="sm"
                variant={viewport === 'desktop' ? 'default' : 'ghost'}
                onClick={() => setViewport('desktop')}
                className="rounded-r-none"
              >
                <Monitor className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant={viewport === 'tablet' ? 'default' : 'ghost'}
                onClick={() => setViewport('tablet')}
                className="rounded-none border-x"
              >
                <Tablet className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant={viewport === 'mobile' ? 'default' : 'ghost'}
                onClick={() => setViewport('mobile')}
                className="rounded-l-none"
              >
                <Smartphone className="h-4 w-4" />
              </Button>
            </div>
            <Button size="sm" variant="outline" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={openInNewTab}>
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {devServerUrl && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {devServerUrl}
            </Badge>
            {isLoading && (
              <Badge variant="secondary" className="text-xs">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Loading...
              </Badge>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <div className="h-full flex items-center justify-center bg-muted/50">
          {!devServerUrl ? (
            <div className="text-center text-muted-foreground">
              <Monitor className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No development server running</p>
              <p className="text-sm">Start your project to see the live preview</p>
            </div>
          ) : hasError ? (
            <div className="text-center text-destructive">
              <AlertCircle className="h-12 w-12 mx-auto mb-4" />
              <p className="font-medium">Preview Error</p>
              <p className="text-sm text-muted-foreground">{errorMessage}</p>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleRefresh}
                className="mt-4"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          ) : (
            <div 
              className="relative bg-white shadow-lg"
              style={{
                width: viewport === 'desktop' ? '100%' : currentSize.width,
                height: viewport === 'desktop' ? '100%' : currentSize.height,
                maxWidth: '100%',
                maxHeight: '100%',
              }}
            >
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin" />
                    <p className="text-sm text-muted-foreground">Loading preview...</p>
                  </div>
                </div>
              )}
              <iframe
                key={refreshKey}
                ref={iframeRef}
                src={devServerUrl}
                className="w-full h-full border-0"
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
                title="Live Preview"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}