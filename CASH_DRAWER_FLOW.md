# Cash Drawer Integration Flow

## System Architecture

```mermaid
graph TB
    A[Cashier Page] --> B[useCashDrawer Hook]
    B --> C[Electron Preload API]
    C --> D[Electron Main Process]
    D --> E[SerialPort Library]
    E --> F[Cash Drawer Hardware]
    
    G[Settings Component] --> B
    H[Manual Open Button] --> B
    I[Auto Open Logic] --> B
```

## Transaction Flow

```mermaid
sequenceDiagram
    participant U as User
    participant C as Cashier Page
    participant H as useCashDrawer Hook
    participant E as Electron Main
    participant S as SerialPort
    participant D as Cash Drawer
    
    U->>C: Complete Transaction
    C->>C: Check Payment Method = Cash
    C->>C: Check Auto Open Enabled
    C->>H: openCashDrawer()
    H->>E: cashdrawer:open IPC
    E->>S: Open Serial Port
    S->>D: Send ESC/POS Command
    D-->>S: Hardware Response
    S-->>E: Success/Error
    E-->>H: Result
    H-->>C: Success/Error
    C->>U: Show Transaction Complete
```

## Error Handling Flow

```mermaid
flowchart TD
    A[Open Cash Drawer] --> B{Port Available?}
    B -->|No| C[Show Port Error]
    B -->|Yes| D{Connection Success?}
    D -->|No| E[Show Connection Error]
    D -->|Yes| F{Send Command Success?}
    F -->|No| G[Show Command Error]
    F -->|Yes| H[Cash Drawer Opens]
    
    C --> I[Log Error]
    E --> I
    G --> I
    H --> J[Log Success]
```

## Configuration Flow

```mermaid
flowchart TD
    A[Open Settings] --> B[List Available Ports]
    B --> C[User Selects Port]
    C --> D[Set Baud Rate]
    D --> E[Set Timeout]
    E --> F[Test Connection]
    F --> G{Test Success?}
    G -->|No| H[Show Error]
    G -->|Yes| I[Save Settings]
    H --> F
    I --> J[Settings Applied]
```

## Component Structure

```mermaid
graph TD
    A[Cashier Page] --> B[Cash Drawer Settings]
    A --> C[Manual Open Button]
    A --> D[Error Display]
    A --> E[Transaction Logic]
    
    B --> F[Port Selection]
    B --> G[Baud Rate Config]
    B --> H[Timeout Config]
    B --> I[Auto Open Toggle]
    B --> J[Test Button]
    
    E --> K[Payment Method Check]
    E --> L[Auto Open Check]
    E --> M[Open Drawer Call]
```

## Hardware Communication

```mermaid
sequenceDiagram
    participant A as Application
    participant S as SerialPort
    participant C as Cash Drawer Controller
    participant D as Cash Drawer Mechanism
    
    A->>S: Open Port (COM1, 9600)
    S->>C: Establish Connection
    C-->>S: Connection Ready
    S-->>A: Port Opened
    A->>S: Send ESC/POS Command
    S->>C: [0x1B, 0x70, 0x00, 0x19, 0xFA]
    C->>D: Activate Solenoid
    D-->>C: Drawer Opened
    C-->>S: Command Executed
    S-->>A: Success Response
    A->>S: Close Port
    S->>C: Close Connection
```

## State Management

```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Opening: Open Drawer
    Opening --> Success: Command Success
    Opening --> Error: Command Failed
    Success --> Idle: Reset State
    Error --> Idle: Reset State
    
    Idle --> Testing: Test Connection
    Testing --> Available: Port Available
    Testing --> Unavailable: Port Unavailable
    Available --> Idle: Reset State
    Unavailable --> Idle: Reset State
```

## Error Recovery

```mermaid
flowchart TD
    A[Error Occurred] --> B{Error Type?}
    B -->|Port Not Found| C[Show Available Ports]
    B -->|Connection Timeout| D[Retry with Different Baud Rate]
    B -->|Permission Denied| E[Request Admin Rights]
    B -->|Hardware Error| F[Check Hardware Connection]
    
    C --> G[User Selects New Port]
    D --> H[Test New Baud Rate]
    E --> I[Restart as Admin]
    F --> J[Check Cables & Power]
    
    G --> K[Test Connection]
    H --> K
    I --> K
    J --> K
    
    K --> L{Success?}
    L -->|Yes| M[Continue Operation]
    L -->|No| N[Show Error Message]
```

## Performance Optimization

```mermaid
graph TD
    A[Cash Drawer Request] --> B{Port Already Open?}
    B -->|Yes| C[Reuse Connection]
    B -->|No| D[Open New Connection]
    C --> E[Send Command]
    D --> E
    E --> F[Wait for Response]
    F --> G{Timeout?}
    G -->|Yes| H[Close Connection & Retry]
    G -->|No| I[Process Response]
    H --> J[Exponential Backoff]
    J --> D
    I --> K[Close Connection]
    K --> L[Return Result]
```

---

**Note**: These diagrams show the complete flow of cash drawer integration in Studio POS, including error handling, state management, and performance optimization strategies.

