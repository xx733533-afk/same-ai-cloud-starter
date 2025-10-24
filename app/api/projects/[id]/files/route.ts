import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { projectFiles } from '@/db/schema/files';
import { projects } from '@/db/schema/projects';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const getFilesSchema = z.object({
  id: z.string().uuid(),
});

const createFileSchema = z.object({
  path: z.string().min(1),
  content: z.string().optional(),
  isDirectory: z.boolean().default(false),
  language: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = getFilesSchema.parse({ id: params.id });
    
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
    
    const files = await db
      .select()
      .from(projectFiles)
      .where(eq(projectFiles.projectId, id))
      .orderBy(projectFiles.path);
    
    return NextResponse.json({
      files: files.map(file => ({
        path: file.path,
        type: file.isDirectory ? 'directory' : 'file',
        size: file.size,
        last_modified: file.lastModified,
        language: file.language,
      })),
    });
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = getFilesSchema.parse({ id: params.id });
    const body = await request.json();
    const validatedData = createFileSchema.parse(body);
    
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
    
    const newFile = await db.insert(projectFiles).values({
      projectId: id,
      path: validatedData.path,
      content: validatedData.content || '',
      size: validatedData.content?.length || 0,
      isDirectory: validatedData.isDirectory,
      language: validatedData.language,
    }).returning();
    
    return NextResponse.json({
      file: {
        id: newFile[0].id,
        path: newFile[0].path,
        type: newFile[0].isDirectory ? 'directory' : 'file',
        size: newFile[0].size,
        last_modified: newFile[0].lastModified,
      },
    });
  } catch (error) {
    console.error('Error creating file:', error);
    return NextResponse.json(
      { error: 'Failed to create file' },
      { status: 500 }
    );
  }
}