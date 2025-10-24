import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { db } from '@/db';
import { projectFiles } from '@/db/schema/files';
import { eq } from 'drizzle-orm';

export function createSocketServer(httpServer: HTTPServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join project room
    socket.on('join-project', (projectId: string) => {
      socket.join(`project-${projectId}`);
      console.log(`Client ${socket.id} joined project ${projectId}`);
    });

    // Leave project room
    socket.on('leave-project', (projectId: string) => {
      socket.leave(`project-${projectId}`);
      console.log(`Client ${socket.id} left project ${projectId}`);
    });

    // File watching
    socket.on('file:watch', async (data: { projectId: string; path: string }) => {
      try {
        // In a real implementation, you would set up file system watching
        // For now, we'll just acknowledge the request
        socket.emit('file:watch:ack', { path: data.path, status: 'watching' });
      } catch (error) {
        socket.emit('file:watch:error', { path: data.path, error: error.message });
      }
    });

    // Terminal input
    socket.on('terminal:input', (data: { projectId: string; input: string }) => {
      // Broadcast to all clients in the project room
      socket.to(`project-${data.projectId}`).emit('terminal:output', {
        output: data.input,
        type: 'input'
      });
    });

    // Preview refresh
    socket.on('preview:refresh', (data: { projectId: string }) => {
      // Broadcast refresh request to all clients in the project room
      socket.to(`project-${data.projectId}`).emit('preview:refresh:request');
    });

    // AI thinking status
    socket.on('ai:thinking', (data: { projectId: string; status: string }) => {
      socket.to(`project-${data.projectId}`).emit('ai:thinking', {
        status: data.status
      });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
}

// Helper function to broadcast file changes
export async function broadcastFileChange(projectId: string, path: string, content: string) {
  // This would be called from your file update API
  // In a real implementation, you'd have access to the io instance
  console.log(`Broadcasting file change for project ${projectId}, path: ${path}`);
}