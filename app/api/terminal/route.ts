import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const terminalCommandSchema = z.object({
  command: z.string().min(1).max(1000),
  projectId: z.string().uuid().optional(),
  timeout: z.number().min(1).max(300).default(30),
});

// Allowed commands for security
const ALLOWED_COMMANDS = [
  'npm', 'yarn', 'bun', 'pnpm',
  'git', 'ls', 'pwd', 'cat', 'echo',
  'mkdir', 'rmdir', 'touch', 'cp', 'mv',
  'node', 'npx', 'bunx',
  'cd', 'find', 'grep', 'head', 'tail',
];

function isCommandAllowed(command: string): boolean {
  const baseCommand = command.split(' ')[0];
  return ALLOWED_COMMANDS.includes(baseCommand);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedCommand = terminalCommandSchema.parse(body);
    
    // Security check
    if (!isCommandAllowed(validatedCommand.command)) {
      return NextResponse.json(
        { error: 'Command not allowed' },
        { status: 403 }
      );
    }
    
    // Additional security checks
    const dangerousPatterns = [
      /rm\s+-rf/,
      /dd\s+if=/,
      /mkfs/,
      /wget\s+.*http/,
      /curl\s+.*http/,
      /nc\s+/,
      /netcat/,
      /python\s+-c/,
      /node\s+-e/,
    ];
    
    if (dangerousPatterns.some(pattern => pattern.test(validatedCommand.command))) {
      return NextResponse.json(
        { error: 'Command contains potentially dangerous operations' },
        { status: 403 }
      );
    }
    
    try {
      // Execute command with timeout
      const { stdout, stderr } = await Promise.race([
        execAsync(validatedCommand.command, {
          timeout: validatedCommand.timeout * 1000,
          cwd: validatedCommand.projectId ? `/tmp/projects/${validatedCommand.projectId}` : process.cwd(),
        }),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Command timeout')), validatedCommand.timeout * 1000)
        ),
      ]);
      
      return NextResponse.json({
        stdout: stdout || '',
        stderr: stderr || '',
        exit_code: 0,
        command: validatedCommand.command,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      return NextResponse.json({
        stdout: '',
        stderr: error.message || 'Command execution failed',
        exit_code: error.code || 1,
        command: validatedCommand.command,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Error executing terminal command:', error);
    return NextResponse.json(
      { error: 'Failed to execute command' },
      { status: 500 }
    );
  }
}