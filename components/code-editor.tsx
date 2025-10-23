'use client';

import { useEffect, useRef, useState } from 'react';
import { Editor } from '@monaco-editor/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  Folder, 
  FolderOpen, 
  Plus, 
  Trash2, 
  Save,
  Play,
  Terminal
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'directory';
  content?: string;
  language?: string;
  children?: FileNode[];
  isExpanded?: boolean;
}

interface CodeEditorProps {
  projectId?: string;
  className?: string;
  onFileChange?: (path: string, content: string) => void;
  onFileSelect?: (file: FileNode) => void;
}

export function CodeEditor({ 
  projectId, 
  className, 
  onFileChange, 
  onFileSelect 
}: CodeEditorProps) {
  const [files, setFiles] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [editorContent, setEditorContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const editorRef = useRef<any>(null);

  // Load project files
  useEffect(() => {
    if (projectId) {
      loadProjectFiles();
    }
  }, [projectId]);

  const loadProjectFiles = async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/files`);
      if (response.ok) {
        const data = await response.json();
        setFiles(convertToFileTree(data.files));
      }
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const convertToFileTree = (files: any[]): FileNode[] => {
    const tree: FileNode[] = [];
    const pathMap = new Map<string, FileNode>();

    files.forEach(file => {
      const pathParts = file.path.split('/');
      let currentPath = '';
      
      pathParts.forEach((part: string, index: number) => {
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        
        if (!pathMap.has(currentPath)) {
          const node: FileNode = {
            id: currentPath,
            name: part,
            path: currentPath,
            type: file.type,
            content: file.content,
            language: file.language,
            children: [],
            isExpanded: false,
          };
          
          pathMap.set(currentPath, node);
          
          if (index === 0) {
            tree.push(node);
          } else {
            const parentPath = pathParts.slice(0, index).join('/');
            const parent = pathMap.get(parentPath);
            if (parent) {
              parent.children = parent.children || [];
              parent.children.push(node);
            }
          }
        }
      });
    });

    return tree;
  };

  const handleFileSelect = async (file: FileNode) => {
    if (file.type === 'directory') {
      // Toggle directory expansion
      setFiles(prev => toggleDirectory(prev, file.id));
      return;
    }

    setSelectedFile(file);
    
    if (file.content === undefined) {
      // Load file content
      try {
        const response = await fetch(`/api/projects/${projectId}/files/${file.path}`);
        if (response.ok) {
          const data = await response.json();
          setEditorContent(data.content || '');
        }
      } catch (error) {
        console.error('Error loading file content:', error);
        setEditorContent('');
      }
    } else {
      setEditorContent(file.content);
    }

    onFileSelect?.(file);
  };

  const toggleDirectory = (nodes: FileNode[], targetId: string): FileNode[] => {
    return nodes.map(node => {
      if (node.id === targetId) {
        return { ...node, isExpanded: !node.isExpanded };
      }
      if (node.children) {
        return { ...node, children: toggleDirectory(node.children, targetId) };
      }
      return node;
    });
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setEditorContent(value);
      onFileChange?.(selectedFile?.path || '', value);
    }
  };

  const saveFile = async () => {
    if (!selectedFile || !projectId) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/files/${selectedFile.path}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: editorContent,
          create_if_not_exists: true,
        }),
      });

      if (response.ok) {
        // Update the file in the tree
        setFiles(prev => updateFileContent(prev, selectedFile.path, editorContent));
      }
    } catch (error) {
      console.error('Error saving file:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateFileContent = (nodes: FileNode[], targetPath: string, content: string): FileNode[] => {
    return nodes.map(node => {
      if (node.path === targetPath) {
        return { ...node, content };
      }
      if (node.children) {
        return { ...node, children: updateFileContent(node.children, targetPath, content) };
      }
      return node;
    });
  };

  const getLanguageFromPath = (path: string): string => {
    const ext = path.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'css': 'css',
      'scss': 'scss',
      'html': 'html',
      'json': 'json',
      'md': 'markdown',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'sql': 'sql',
      'xml': 'xml',
      'yaml': 'yaml',
      'yml': 'yaml',
    };
    return languageMap[ext || ''] || 'text';
  };

  const renderFileTree = (nodes: FileNode[], level = 0) => {
    return nodes.map(node => (
      <div key={node.id}>
        <div
          className={cn(
            'flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-muted rounded-sm',
            selectedFile?.id === node.id && 'bg-muted',
            level > 0 && 'ml-4'
          )}
          onClick={() => handleFileSelect(node)}
        >
          {node.type === 'directory' ? (
            node.isExpanded ? (
              <FolderOpen className="h-4 w-4" />
            ) : (
              <Folder className="h-4 w-4" />
            )
          ) : (
            <FileText className="h-4 w-4" />
          )}
          <span className="text-sm">{node.name}</span>
        </div>
        {node.type === 'directory' && node.isExpanded && node.children && (
          <div>
            {renderFileTree(node.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className={cn('flex h-full', className)}>
      {/* File Tree */}
      <div className="w-64 border-r bg-muted/50">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Files</h3>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost">
                <Plus className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="p-2">
            {isLoading ? (
              <div className="text-center text-muted-foreground py-4">
                Loading files...
              </div>
            ) : (
              renderFileTree(files)
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col">
        {selectedFile && (
          <div className="border-b p-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="font-medium">{selectedFile.name}</span>
              <span className="text-sm text-muted-foreground">
                {getLanguageFromPath(selectedFile.path)}
              </span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={saveFile} disabled={isSaving}>
                <Save className="h-4 w-4 mr-1" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
              <Button size="sm" variant="outline">
                <Play className="h-4 w-4 mr-1" />
                Run
              </Button>
              <Button size="sm" variant="outline">
                <Terminal className="h-4 w-4 mr-1" />
                Terminal
              </Button>
            </div>
          </div>
        )}
        
        <div className="flex-1">
          <Editor
            height="100%"
            language={selectedFile ? getLanguageFromPath(selectedFile.path) : 'javascript'}
            value={editorContent}
            onChange={handleEditorChange}
            onMount={(editor) => {
              editorRef.current = editor;
            }}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              roundedSelection: false,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              insertSpaces: true,
            }}
          />
        </div>
      </div>
    </div>
  );
}