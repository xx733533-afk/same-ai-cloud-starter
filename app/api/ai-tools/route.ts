import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { aiTools } from '@/db/schema/ai-tools';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const createToolSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1),
  parameters: z.record(z.any()),
  implementation: z.string().min(1),
});

export async function GET() {
  try {
    const tools = await db
      .select()
      .from(aiTools)
      .where(eq(aiTools.isActive, true))
      .orderBy(aiTools.name);
    
    return NextResponse.json({
      tools: tools.map(tool => ({
        id: tool.id,
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
        implementation: tool.implementation,
      })),
    });
  } catch (error) {
    console.error('Error fetching AI tools:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AI tools' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createToolSchema.parse(body);
    
    const newTool = await db.insert(aiTools).values({
      name: validatedData.name,
      description: validatedData.description,
      parameters: validatedData.parameters,
      implementation: validatedData.implementation,
    }).returning();
    
    return NextResponse.json({
      tool: {
        id: newTool[0].id,
        name: newTool[0].name,
        description: newTool[0].description,
        parameters: newTool[0].parameters,
        implementation: newTool[0].implementation,
      },
    });
  } catch (error) {
    console.error('Error creating AI tool:', error);
    return NextResponse.json(
      { error: 'Failed to create AI tool' },
      { status: 500 }
    );
  }
}