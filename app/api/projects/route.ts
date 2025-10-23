import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { projects } from '@/db/schema/projects';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { auth } from '@/lib/auth';

const createProjectSchema = z.object({
  name: z.string().min(1).max(255),
  framework: z.enum(['react', 'nextjs', 'vite', 'vue', 'svelte', 'angular']),
  template: z.string().optional(),
  language: z.enum(['ar', 'en']).default('ar'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createProjectSchema.parse(body);
    
    // Generate container ID (in production, this would be a real container)
    const containerId = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const devServerUrl = `http://localhost:${3000 + Math.floor(Math.random() * 1000)}`;
    
    const newProject = await db.insert(projects).values({
      name: validatedData.name,
      framework: validatedData.framework,
      containerId,
      devServerUrl,
      language: validatedData.language,
    }).returning();
    
    return NextResponse.json({
      project_id: newProject[0].id,
      container_id: containerId,
      dev_server_url: devServerUrl,
    });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    const userProjects = await db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.isDeleted, false),
          session?.user ? eq(projects.userId, session.user.id) : undefined
        )
      )
      .orderBy(projects.lastAccessed);
    
    return NextResponse.json({ projects: userProjects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}