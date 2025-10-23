'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AIChat } from "@/components/ai-chat";
import { CodeEditor } from "@/components/code-editor";
import { LivePreview } from "@/components/live-preview";
import { 
  Plus, 
  FolderOpen, 
  Code, 
  Monitor, 
  MessageCircle,
  Settings,
  Play,
  Square,
  Download,
  Upload,
  GitBranch,
  Share2,
  Trash2,
  Edit,
  Eye,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Project {
  id: string;
  name: string;
  framework: string;
  containerId: string;
  devServerUrl: string;
  language: string;
  createdAt: string;
  lastAccessed: string;
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectFramework, setNewProjectFramework] = useState('react');
  const [newProjectLanguage, setNewProjectLanguage] = useState('ar');

  // Load projects on component mount
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects);
        if (data.projects.length > 0) {
          setSelectedProject(data.projects[0]);
        }
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createProject = async () => {
    if (!newProjectName.trim()) return;

    setIsCreatingProject(true);
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newProjectName,
          framework: newProjectFramework,
          language: newProjectLanguage,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const newProject: Project = {
          id: data.project_id,
          name: newProjectName,
          framework: newProjectFramework,
          containerId: data.container_id,
          devServerUrl: data.dev_server_url,
          language: newProjectLanguage,
          createdAt: new Date().toISOString(),
          lastAccessed: new Date().toISOString(),
        };
        
        setProjects(prev => [newProject, ...prev]);
        setSelectedProject(newProject);
        setNewProjectName('');
        setNewProjectFramework('react');
        setNewProjectLanguage('ar');
      }
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setIsCreatingProject(false);
    }
  };

  const getFrameworkIcon = (framework: string) => {
    switch (framework) {
      case 'react':
        return '⚛️';
      case 'nextjs':
        return '▲';
      case 'vue':
        return '💚';
      case 'svelte':
        return '🧡';
      case 'angular':
        return '🔴';
      case 'vite':
        return '⚡';
      default:
        return '📁';
    }
  };

  const getFrameworkColor = (framework: string) => {
    switch (framework) {
      case 'react':
        return 'bg-blue-100 text-blue-800';
      case 'nextjs':
        return 'bg-gray-100 text-gray-800';
      case 'vue':
        return 'bg-green-100 text-green-800';
      case 'svelte':
        return 'bg-orange-100 text-orange-800';
      case 'angular':
        return 'bg-red-100 text-red-800';
      case 'vite':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">AI Coding Assistant</h2>
          <p className="text-muted-foreground">
            Build, edit, and deploy web applications with AI assistance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Start a new web development project with AI assistance
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="project-name">Project Name</Label>
                  <Input
                    id="project-name"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="My Awesome Project"
                  />
                </div>
                <div>
                  <Label htmlFor="framework">Framework</Label>
                  <Select value={newProjectFramework} onValueChange={setNewProjectFramework}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="react">React</SelectItem>
                      <SelectItem value="nextjs">Next.js</SelectItem>
                      <SelectItem value="vue">Vue.js</SelectItem>
                      <SelectItem value="svelte">Svelte</SelectItem>
                      <SelectItem value="angular">Angular</SelectItem>
                      <SelectItem value="vite">Vite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select value={newProjectLanguage} onValueChange={setNewProjectLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ar">العربية</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={createProject} 
                  disabled={!newProjectName.trim() || isCreatingProject}
                  className="w-full"
                >
                  {isCreatingProject ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Project
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12">
          <FolderOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first project to start building with AI assistance
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Project
          </Button>
        </div>
      ) : (
        <Tabs defaultValue="workspace" className="space-y-4">
          <TabsList>
            <TabsTrigger value="workspace">Workspace</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="workspace" className="space-y-4">
            {selectedProject ? (
              <div className="grid gap-4 h-[calc(100vh-200px)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getFrameworkIcon(selectedProject.framework)}</span>
                    <div>
                      <h3 className="font-semibold">{selectedProject.name}</h3>
                      <div className="flex items-center gap-2">
                        <Badge className={getFrameworkColor(selectedProject.framework)}>
                          {selectedProject.framework}
                        </Badge>
                        <Badge variant="outline">
                          {selectedProject.language === 'ar' ? 'العربية' : 'English'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      <Play className="h-4 w-4 mr-1" />
                      Run
                    </Button>
                    <Button size="sm" variant="outline">
                      <Square className="h-4 w-4 mr-1" />
                      Stop
                    </Button>
                    <Button size="sm" variant="outline">
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
                  <div className="space-y-4">
                    <CodeEditor 
                      projectId={selectedProject.id}
                      className="h-[400px]"
                    />
                    <AIChat 
                      projectId={selectedProject.id}
                      className="h-[300px]"
                    />
                  </div>
                  <div>
                    <LivePreview 
                      projectId={selectedProject.id}
                      devServerUrl={selectedProject.devServerUrl}
                      className="h-full"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Code className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Select a project</h3>
                <p className="text-muted-foreground">
                  Choose a project from the Projects tab to start coding
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="projects" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <Card 
                  key={project.id} 
                  className={cn(
                    "cursor-pointer transition-colors hover:bg-muted/50",
                    selectedProject?.id === project.id && "ring-2 ring-primary"
                  )}
                  onClick={() => setSelectedProject(project)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getFrameworkIcon(project.framework)}</span>
                        <div>
                          <CardTitle className="text-lg">{project.name}</CardTitle>
                          <CardDescription>
                            {project.framework} • {project.language === 'ar' ? 'العربية' : 'English'}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Created</span>
                        <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Last accessed</span>
                        <span>{new Date(project.lastAccessed).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant="outline" className="text-xs">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Ready
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>
                  Configure your AI Coding Assistant preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Default Language</Label>
                  <Select defaultValue="ar">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ar">العربية</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Default Framework</Label>
                  <Select defaultValue="react">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="react">React</SelectItem>
                      <SelectItem value="nextjs">Next.js</SelectItem>
                      <SelectItem value="vue">Vue.js</SelectItem>
                      <SelectItem value="svelte">Svelte</SelectItem>
                      <SelectItem value="angular">Angular</SelectItem>
                      <SelectItem value="vite">Vite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>AI Model</Label>
                  <Select defaultValue="gpt-4">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4">GPT-4 Turbo</SelectItem>
                      <SelectItem value="claude-3">Claude 3.5 Sonnet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}