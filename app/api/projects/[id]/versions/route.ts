import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { versions } from '@/db/schema/versions';
import { projects } from '@/db/schema/projects';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const getVersionsSchema = z.object({
  id: z.string().uuid(),
});

const createVersionSchema = z.object({
  description: z.string().optional(),
  snapshot_data: z.record(z.any()),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = getVersionsSchema.parse({ id: params.id });
    
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
    
    const projectVersions = await db
      .select()
      .from(versions)
      .where(eq(versions.projectId, id))
      .orderBy(versions.createdAt);
    
    return NextResponse.json({
      versions: projectVersions.map(version => ({
        version_id: version.id,
        created_at: version.createdAt,
        description: version.description,
        snapshot_url: `/api/projects/${id}/versions/${version.id}/snapshot`,
      })),
    });
  } catch (error) {
    console.error('Error fetching versions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch versions' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = getVersionsSchema.parse({ id: params.id });
    const body = await request.json();
    const validatedData = createVersionSchema.parse(body);
    
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
    
    const newVersion = await db.insert(versions).values({
      projectId: id,
      snapshotData: validatedData.snapshot_data,
      description: validatedData.description || `Snapshot ${new Date().toLocaleString()}`,
    }).returning();
    
    return NextResponse.json({
      version_id: newVersion[0].id,
      created_at: newVersion[0].createdAt,
      description: newVersion[0].description,
    });
  } catch (error) {
    console.error('Error creating version:', error);
    return NextResponse.json(
      { error: 'Failed to create version' },
      { status: 500 }
    );
  }
}