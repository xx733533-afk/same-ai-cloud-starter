import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { projectFiles } from '@/db/schema/files';
import { projects } from '@/db/schema/projects';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const getFileSchema = z.object({
  id: z.string().uuid(),
  path: z.string(),
});

const updateFileSchema = z.object({
  content: z.string(),
  create_if_not_exists: z.boolean().default(false),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; path: string[] } }
) {
  try {
    const filePath = params.path.join('/');
    const { id } = getFileSchema.parse({ 
      id: params.id, 
      path: filePath 
    });
    
    // Verify project exists
    const project = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);
    
    if (project.length === 0) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }
    
    const file = await db
      .select()
      .from(projectFiles)
      .where(
        and(
          eq(projectFiles.projectId, id),
          eq(projectFiles.path, filePath)
        )
      )
      .limit(1);
    
    if (file.length === 0) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      content: file[0].content,
      encoding: 'utf-8',
      language: file[0].language,
      size: file[0].size,
      last_modified: file[0].lastModified,
    });
  } catch (error) {
    console.error('Error reading file:', error);
    return NextResponse.json(
      { error: 'Failed to read file' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; path: string[] } }
) {
  try {
    const filePath = params.path.join('/');
    const { id } = getFileSchema.parse({ 
      id: params.id, 
      path: filePath 
    });
    const body = await request.json();
    const validatedData = updateFileSchema.parse(body);
    
    // Verify project exists
    const project = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);
    
    if (project.length === 0) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }
    
    // Check if file exists
    const existingFile = await db
      .select()
      .from(projectFiles)
      .where(
        and(
          eq(projectFiles.projectId, id),
          eq(projectFiles.path, filePath)
        )
      )
      .limit(1);
    
    if (existingFile.length === 0) {
      if (!validatedData.create_if_not_exists) {
        return NextResponse.json(
          { error: 'File not found' },
          { status: 404 }
        );
      }
      
      // Create new file
      const newFile = await db.insert(projectFiles).values({
        projectId: id,
        path: filePath,
        content: validatedData.content,
        size: validatedData.content.length,
        isDirectory: false,
        language: getLanguageFromPath(filePath),
      }).returning();
      
      return NextResponse.json({
        content: newFile[0].content,
        encoding: 'utf-8',
        language: newFile[0].language,
        created: true,
      });
    }
    
    // Update existing file
    const updatedFile = await db
      .update(projectFiles)
      .set({
        content: validatedData.content,
        size: validatedData.content.length,
        lastModified: new Date(),
      })
      .where(
        and(
          eq(projectFiles.projectId, id),
          eq(projectFiles.path, filePath)
        )
      )
      .returning();
    
    return NextResponse.json({
      content: updatedFile[0].content,
      encoding: 'utf-8',
      language: updatedFile[0].language,
      updated: true,
    });
  } catch (error) {
    console.error('Error updating file:', error);
    return NextResponse.json(
      { error: 'Failed to update file' },
      { status: 500 }
    );
  }
}

function getLanguageFromPath(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase();
  const languageMap: Record<string, string> = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'css': 'css',
    'scss': 'scss',
    'sass': 'sass',
    'html': 'html',
    'htm': 'html',
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
}