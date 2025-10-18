flowchart TD
  Start[User opens Cloud IDE] --> ChatUI[Chat Interface]
  Start --> Editor[File Explorer Editor]
  Start --> PreviewPane[Live Preview Pane]
  ChatUI --> SendCmd[Send command to api agent endpoint]
  SendCmd --> AuthCheck{User registered}
  AuthCheck -- Yes --> AuthService[Authenticate user optional]
  AuthCheck -- No --> Orchestrator
  AuthService --> Orchestrator
  Orchestrator --> DecideTool{Select tool via AI model}
  DecideTool -- edit file --> FileTool[Edit File tool]
  DecideTool -- shell command --> ShellTool[Shell Command tool]
  DecideTool -- web search --> SearchTool[Web Search tool]
  FileTool --> ContainerMgr[Container Manager executes file op]
  ShellTool --> ContainerMgr
  SearchTool --> Orchestrator
  ContainerMgr --> HotReload[Trigger hot reload]
  HotReload --> PreviewPane
  Orchestrator --> StreamResp[Stream AI response]
  StreamResp --> ChatUI