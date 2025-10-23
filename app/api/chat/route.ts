import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { chatMessages } from '@/db/schema/chat-messages';
import { projects } from '@/db/schema/projects';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { openai } from '@/lib/openai';

const chatSchema = z.object({
  message: z.string().min(1).max(10000),
  project_id: z.string().uuid().optional(),
  context: z.object({
    current_file: z.string().optional(),
    selected_code: z.string().optional(),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = chatSchema.parse(body);
    
    // Verify project exists if provided
    if (validatedData.project_id) {
      const project = await db
        .select()
        .from(projects)
        .where(eq(projects.id, validatedData.project_id))
        .limit(1);
      
      if (project.length === 0) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        );
      }
    }
    
    // Save user message
    const userMessage = await db.insert(chatMessages).values({
      projectId: validatedData.project_id || null,
      role: 'user',
      content: validatedData.message,
      context: validatedData.context || null,
    }).returning();
    
    // Get recent conversation history
    const recentMessages = await db
      .select()
      .from(chatMessages)
      .where(
        validatedData.project_id 
          ? eq(chatMessages.projectId, validatedData.project_id)
          : undefined
      )
      .orderBy(chatMessages.createdAt)
      .limit(10);
    
    // Prepare messages for OpenAI
    const messages = recentMessages.map(msg => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
    }));
    
    // Add context if available
    if (validatedData.context?.current_file) {
      messages.push({
        role: 'system',
        content: `Current file: ${validatedData.context.current_file}`,
      });
    }
    
    if (validatedData.context?.selected_code) {
      messages.push({
        role: 'system',
        content: `Selected code:\n\`\`\`\n${validatedData.context.selected_code}\n\`\`\``,
      });
    }
    
    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: messages as any,
      max_tokens: 2000,
      temperature: 0.7,
      stream: true,
    });
    
    // Create response stream
    const stream = new ReadableStream({
      async start(controller) {
        let assistantContent = '';
        
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            assistantContent += content;
            controller.enqueue(
              new TextEncoder().encode(`data: ${JSON.stringify({ content, type: 'content' })}\n\n`)
            );
          }
        }
        
        // Save assistant message
        await db.insert(chatMessages).values({
          projectId: validatedData.project_id || null,
          role: 'assistant',
          content: assistantContent,
        });
        
        controller.enqueue(
          new TextEncoder().encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`)
        );
        controller.close();
      },
    });
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}