# Frontend Development Guide

## Project Structure
```
frontend/
├── src/
│   ├── app/                 # Next.js 14 App Router
│   │   ├── (auth)/         # Authentication routes
│   │   ├── dashboard/      # Main application
│   │   ├── documents/      # Document management
│   │   ├── analysis/       # Analysis results
│   │   ├── resume/         # Resume generation
│   │   └── layout.tsx      # Root layout
│   ├── components/         # Reusable components
│   │   ├── ui/            # shadcn/ui components
│   │   ├── auth/          # Authentication components
│   │   ├── documents/     # Document-related components
│   │   ├── analysis/      # Analysis components
│   │   └── resume/        # Resume components
│   ├── lib/               # Utilities and configurations
│   │   ├── auth.ts        # Authentication utilities
│   │   ├── api.ts         # API client
│   │   └── utils.ts       # General utilities
│   ├── hooks/             # Custom React hooks
│   ├── types/             # TypeScript type definitions
│   └── styles/            # Global styles
├── public/                # Static assets
└── package.json
```

## Key Dependencies
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^4.0.0",
    "@radix-ui/react-*": "latest",
    "lucide-react": "latest",
    "axios": "^1.6.0",
    "@tiptap/react": "^2.1.0",
    "@tiptap/starter-kit": "^2.1.0",
    "react-hook-form": "^7.48.0",
    "zod": "^3.22.0"
  }
}
```

## TipTap Editor Configuration

### SSR Setup (Required for Next.js)
```typescript
const editor = useEditor({
  extensions: [StarterKit, Placeholder.configure({ placeholder: '...' })],
  content: initialContent,
  immediatelyRender: false, // Required for Next.js SSR
});
```

### HTML Styling for TipTap Output
```typescript
// Use Tailwind arbitrary property selectors for HTML content
className="prose prose-lg max-w-none [&_strong]:font-bold [&_em]:italic [&_h1]:text-2xl [&_h1]:font-bold [&_ul]:list-disc [&_ul]:ml-6"
```

## Component Guidelines

### Authentication Components
```typescript
// components/auth/LoginForm.tsx
interface LoginFormProps {
  onSuccess: (user: User) => void;
  onError: (error: string) => void;
}

// components/auth/RegisterForm.tsx
interface RegisterFormProps {
  onSuccess: (user: User) => void;
  onError: (error: string) => void;
}
```

### Document Components
```typescript
// components/documents/DocumentEditor.tsx
interface DocumentEditorProps {
  onSave: (data: { title: string; type: DocumentType; content: string }) => void;
  initialData?: { title: string; type: DocumentType; content: string };
}

// components/documents/DocumentList.tsx
interface DocumentListProps {
  documents: Document[];
  onEdit: (document: Document) => void;
  onDelete: (documentId: string) => void;
  onCreate: (type: DocumentType) => void;
  onView: (document: Document) => void;
}

// components/documents/DocumentViewer.tsx
interface DocumentViewerProps {
  document: Document;
  onEdit: () => void;
}
```

### Analysis Components
```typescript
// components/analysis/PersonalityCard.tsx
interface PersonalityCardProps {
  personalityType: PersonalityType;
  strengths: string[];
  weaknesses: string[];
}

// components/analysis/InsightsDisplay.tsx
interface InsightsDisplayProps {
  analysis: AnalysisResult;
  isLoading?: boolean;
}
```

### Resume Components
```typescript
// components/resume/JobCategorySelector.tsx
interface JobCategorySelectorProps {
  onSelect: (category: JobCategory) => void;
  selectedCategory?: JobCategory;
}

// components/resume/ResumePreview.tsx
interface ResumePreviewProps {
  resume: ResumeContent;
  onDownload: () => void;
  onEdit: () => void;
}
```

## State Management

### Authentication Context
```typescript
// lib/auth-context.tsx
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}
```

### Document Management Hook
```typescript
// hooks/useDocuments.ts
interface UseDocumentsReturn {
  documents: Document[];
  createDocument: (data: CreateDocumentData) => Promise<Document>;
  updateDocument: (id: string, data: UpdateDocumentData) => Promise<Document>;
  deleteDocument: (id: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}
```

## API Integration

### API Client Setup
```typescript
// lib/api.ts
class ApiClient {
  private baseURL = process.env.NEXT_PUBLIC_API_URL;
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    // Implementation
  }

  // Auth methods
  async login(email: string, password: string): Promise<AuthResponse> {}
  async register(email: string, password: string, name: string): Promise<AuthResponse> {}

  // Document methods
  async getDocuments(): Promise<Document[]> {}
  async createDocument(data: CreateDocumentData): Promise<Document> {}
  async updateDocument(id: string, data: UpdateDocumentData): Promise<Document> {}
  async deleteDocument(id: string): Promise<void> {}

  // Analysis methods
  async generateAnalysis(): Promise<AnalysisResult> {}
  async getAnalysis(userId: string): Promise<AnalysisResult> {}

  // Resume methods
  async generateResume(jobCategory: JobCategory): Promise<ResumeContent> {}
  async getResume(userId: string, jobCategory: JobCategory): Promise<ResumeContent> {}
}
```

## Type Definitions

### Core Types
```typescript
// types/index.ts
export interface User {
  userId: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Document {
  documentId: string;
  userId: string;
  type: DocumentType;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export type DocumentType = 'experience' | 'skills' | 'values' | 'achievements';

export interface AnalysisResult {
  analysisId: string;
  userId: string;
  personalityType: PersonalityType;
  strengths: string[];
  weaknesses: string[];
  values: string[];
  interests: string[];
  createdAt: string;
}

export interface PersonalityType {
  type: string;
  description: string;
  traits: string[];
}

export type JobCategory = 'developer' | 'pm' | 'designer' | 'marketer' | 'data';

export interface ResumeContent {
  resumeId: string;
  userId: string;
  jobCategory: JobCategory;
  content: {
    personalInfo: PersonalInfo;
    experience: Experience[];
    skills: string[];
    achievements: string[];
  };
  createdAt: string;
}
```

## Styling Guidelines

### Tailwind Configuration
```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
```

### Component Styling Patterns
```typescript
// Use consistent spacing and colors
const buttonStyles = {
  base: "px-4 py-2 rounded-md font-medium transition-colors",
  primary: "bg-primary-500 text-white hover:bg-primary-600",
  secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
};

// Responsive design patterns
const containerStyles = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";
const gridStyles = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6";
```

## Performance Optimization

### Code Splitting
```typescript
// Lazy load heavy components
const DocumentEditor = dynamic(() => import('@/components/documents/DocumentEditor'), {
  loading: () => <EditorSkeleton />,
});

const AnalysisDashboard = dynamic(() => import('@/components/analysis/Dashboard'), {
  ssr: false,
});
```

### Image Optimization
```typescript
// Use Next.js Image component
import Image from 'next/image';

<Image
  src="/profile-placeholder.jpg"
  alt="Profile"
  width={100}
  height={100}
  className="rounded-full"
/>
```

## Error Handling

### Error Boundary
```typescript
// components/ErrorBoundary.tsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

### API Error Handling
```typescript
// hooks/useApiError.ts
export function useApiError() {
  const [error, setError] = useState<string | null>(null);

  const handleError = (error: any) => {
    if (error.response?.data?.error?.message) {
      setError(error.response.data.error.message);
    } else {
      setError('An unexpected error occurred');
    }
  };

  return { error, handleError, clearError: () => setError(null) };
}
```