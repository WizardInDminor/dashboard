export type ProjectStatus = "active" | "on_hold" | "completed" | "archived";
export type TaskStatus = "backlog" | "in_progress" | "review" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface Project {
  id: number;
  title: string;
  description: string | null;
  status: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectCreate {
  title: string;
  description?: string | null;
  status?: string;
  color?: string;
}

export type ProjectUpdate = Partial<ProjectCreate>;

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  project_id: number | null;
  created_at: string;
}

export interface TaskCreate {
  title: string;
  description?: string | null;
  status?: string;
  priority?: string;
  due_date?: string | null;
  project_id?: number | null;
}

export type TaskUpdate = Partial<TaskCreate>;

export interface Note {
  id: number;
  content: string;
  project_id: number | null;
  created_at: string;
}

export interface NoteCreate {
  content: string;
  project_id?: number | null;
}

export type NoteUpdate = Partial<NoteCreate>;
