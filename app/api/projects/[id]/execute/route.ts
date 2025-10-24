import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { projects } from '@/db/schema/projects';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const executeCommandSchema = z.object({
  id: z.string().uuid(),
});

const commandSchema = z.object({
  command: z.string().min(1).max(1000),
  args: z.array(z.string()).optional().default([]),
  timeout: z.number().min(1).max(300).default(30), // 30 seconds max
});

// Allowed commands for security
const ALLOWED_COMMANDS = [
  'npm', 'yarn', 'bun', 'pnpm',
  'git', 'ls', 'pwd', 'cat', 'echo',
  'mkdir', 'rmdir', 'touch', 'cp', 'mv',
  'node', 'npx', 'bunx',
];

function isCommandAllowed(command: string): boolean {
  const baseCommand = command.split(' ')[0];
  return ALLOWED_COMMANDS.includes(baseCommand);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = executeCommandSchema.parse({ id: params.id });
    const body = await request.json();
    const validatedCommand = commandSchema.parse(body);
    
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
    
    // Security check
    if (!isCommandAllowed(validatedCommand.command)) {
      return NextResponse.json(
        { error: 'Command not allowed' },
        { status: 403 }
      );
    }
    
    // Construct full command
    const fullCommand = validatedCommand.args.length > 0
      ? `${validatedCommand.command} ${validatedCommand.args.join(' ')}`
      : validatedCommand.command;
    
    try {
      // Execute command with timeout
      const { stdout, stderr } = await Promise.race([
        execAsync(fullCommand, {
          cwd: `/tmp/projects/${id}`, // In production, this would be the container path
          timeout: validatedCommand.timeout * 1000,
        }),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Command timeout')), validatedCommand.timeout * 1000)
        ),
      ]);
      
      return NextResponse.json({
        stdout: stdout || '',
        stderr: stderr || '',
        exit_code: 0,
        command: fullCommand,
      });
    } catch (error: any) {
      return NextResponse.json({
        stdout: '',
        stderr: error.message || 'Command execution failed',
        exit_code: error.code || 1,
        command: fullCommand,
      });
    }
  } catch (error) {
    console.error('Error executing command:', error);
    return NextResponse.json(
      { error: 'Failed to execute command' },
      { status: 500 }
    );
  }
}