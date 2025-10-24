import { NextResponse } from 'next/server';

const templates = [
  {
    id: 'react-basic',
    name: 'React Basic',
    framework: 'react',
    description: 'A basic React application with Vite',
    icon: '⚛️',
    commands: ['npm create vite@latest . -- --template react-ts'],
    files: {
      'package.json': {
        name: 'react-app',
        version: '0.0.0',
        type: 'module',
        scripts: {
          dev: 'vite',
          build: 'tsc && vite build',
          preview: 'vite preview'
        },
        dependencies: {
          'react': '^18.2.0',
          'react-dom': '^18.2.0'
        },
        devDependencies: {
          '@types/react': '^18.2.66',
          '@types/react-dom': '^18.2.22',
          '@vitejs/plugin-react': '^4.2.1',
          'typescript': '^5.2.2',
          'vite': '^5.2.0'
        }
      },
      'src/App.tsx': `import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <h1>React + Vite</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
    </div>
  )
}

export default App`,
      'src/App.css': `#root {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.react:hover {
  filter: drop-shadow(0 0 2em #61dafbaa);
}

@keyframes logo-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: no-preference) {
  a:nth-of-type(2) .logo {
    animation: logo-spin infinite 20s linear;
  }
}

.card {
  padding: 2em;
}

.read-the-docs {
  color: #888;
}`,
      'src/main.tsx': `import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)`,
      'src/index.css': `:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;

  color-scheme: light dark;
  color: rgba(255, 255, 255, 0.87);
  background-color: #242424;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-text-size-adjust: 100%;
}

a {
  font-weight: 500;
  color: #646cff;
  text-decoration: inherit;
}
a:hover {
  color: #535bf2;
}

body {
  margin: 0;
  display: flex;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
}

h1 {
  font-size: 3.2em;
  line-height: 1.1;
}

button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #1a1a1a;
  color: white;
  cursor: pointer;
  transition: border-color 0.25s;
}
button:hover {
  border-color: #646cff;
}
button:focus,
button:focus-visible {
  outline: 4px auto -webkit-focus-ring-color;
}

@media (prefers-color-scheme: light) {
  :root {
    color: #213547;
    background-color: #ffffff;
  }
  a:hover {
    color: #747bff;
  }
  button {
    background-color: #f9f9f9;
  }
}`,
      'vite.config.ts': `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
})`,
      'tsconfig.json': `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}`,
      'index.html': `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`
    }
  },
  {
    id: 'nextjs-basic',
    name: 'Next.js Basic',
    framework: 'nextjs',
    description: 'A basic Next.js application with TypeScript',
    icon: '▲',
    commands: ['npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"'],
    files: {
      'package.json': {
        name: 'nextjs-app',
        version: '0.1.0',
        private: true,
        scripts: {
          dev: 'next dev',
          build: 'next build',
          start: 'next start',
          lint: 'next lint'
        },
        dependencies: {
          'next': '14.0.0',
          'react': '^18',
          'react-dom': '^18'
        },
        devDependencies: {
          '@types/node': '^20',
          '@types/react': '^18',
          '@types/react-dom': '^18',
          'autoprefixer': '^10.0.1',
          'eslint': '^8',
          'eslint-config-next': '14.0.0',
          'postcss': '^8',
          'tailwindcss': '^3.3.0',
          'typescript': '^5'
        }
      }
    }
  },
  {
    id: 'vue-basic',
    name: 'Vue.js Basic',
    framework: 'vue',
    description: 'A basic Vue.js application with Vite',
    icon: '💚',
    commands: ['npm create vue@latest .'],
    files: {
      'package.json': {
        name: 'vue-app',
        version: '0.0.0',
        type: 'module',
        scripts: {
          dev: 'vite',
          build: 'vue-tsc && vite build',
          preview: 'vite preview'
        },
        dependencies: {
          'vue': '^3.4.0'
        },
        devDependencies: {
          '@vitejs/plugin-vue': '^5.0.0',
          'typescript': '~5.2.0',
          'vite': '^5.0.0',
          'vue-tsc': '^1.8.0'
        }
      }
    }
  }
];

export async function GET() {
  return NextResponse.json({
    templates: templates.map(template => ({
      id: template.id,
      name: template.name,
      framework: template.framework,
      description: template.description,
      icon: template.icon,
    })),
  });
}

export async function POST(request: NextRequest) {
  try {
    const { templateId, projectId } = await request.json();
    
    const template = templates.find(t => t.id === templateId);
    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }
    
    // In a real implementation, you would:
    // 1. Create the project files based on the template
    // 2. Initialize the project with the specified commands
    // 3. Set up the development environment
    
    return NextResponse.json({
      template: {
        id: template.id,
        name: template.name,
        framework: template.framework,
        files: template.files,
        commands: template.commands,
      },
    });
  } catch (error) {
    console.error('Error getting template:', error);
    return NextResponse.json(
      { error: 'Failed to get template' },
      { status: 500 }
    );
  }
}