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
  task_count: number;
}

export interface ProjectDetail extends Project {
  tasks: Task[];
  notes: Note[];
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

export interface ProjectProgress {
  id: number;
  title: string;
  color: string;
  status: string;
  total_tasks: number;
  done_tasks: number;
}

export interface DashboardSummary {
  overdue_count: number;
  due_today: Task[];
  in_progress_projects: ProjectProgress[];
  recent_projects: Project[];
}

export interface NewsItem {
  title: string;
  url: string | null;
  source: string;
}

export interface GithubActivityItem {
  type: string;
  repo: string;
  created_at: string;
  message: string | null;
}
