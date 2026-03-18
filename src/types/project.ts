export interface Project {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  files: ProjectFile[];
  framework: string | null;
  styling: string | null;
  status: 'DRAFT' | 'GENERATING' | 'COMPLETED' | 'FAILED';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectFile {
  id?: string;
  name: string;
  path: string;
  content: string;
  language?: string;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  framework?: string;
  styling?: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  files?: ProjectFile[];
  framework?: string;
  styling?: string;
  status?: Project['status'];
  tags?: string[];
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  framework: string;
  thumbnail?: string;
  files?: ProjectFile[];
}
