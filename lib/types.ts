export interface CareerRole {
  id: number;
  title: string;
  slug: string;
  domain?: string;
  subdomain?: string;
  description: string;
  category?: string;
  salary_range?: string;
  growth_rate?: string;
  match_score?: number;
  daily_responsibilities?: string[];
  required_education?: string[];
  eligibility_requirements?: string;
  optional_qualifications?: string[];
  preferred_skills?: string[];
  soft_skills?: string[];
  certifications_or_exams?: string[];
  career_progression?: string[];
  is_regulated_profession?: boolean;
  regulatory_disclaimer?: string;
  tools_and_technologies?: string[];
  core_competencies?: string[];
  assessment_duration_mins?: number;
  assessment_question_count?: number;
  difficulty_distribution?: Record<string, number>;
  created_at?: string;
  skills?: Skill[];
}

export interface Skill {
  id: number;
  name: string;
  slug: string;
  category: string;
  description?: string;
  importance_level?: number;
  doc_url?: string;
  created_at?: string;
}

export interface RoleSkillRequirement {
  id: number;
  role_id: number;
  skill_id: number;
  importance: string; // 'core' | 'important' | 'nice_to_have'
  min_proficiency: number;
}

export interface SkillPrerequisite {
  id: number;
  skill_id: number;
  prerequisite_skill_id: number;
}

export interface StudentProfile {
  id: number;
  display_name: string;
  education_level: string;
  educational_field?: string;
  degree_specialization?: string;
  current_status?: string;
  current_role?: string;
  current_experience_level?: string;
  target_role_id?: number | null;
  weekly_study_hours?: number;
  target_duration_weeks?: number;
  preferred_learning_format?: string;
  learning_budget?: string;
  preferred_language?: string;
  placement_deadline?: string;
  career_goals?: string;
  skills_assessment?: Record<string, number>;
  assessed_skills?: Record<string, any>;
  xp: number;
  level: number;
  streak_days: number;
  longest_streak?: number;
  last_active_date?: string;
  weekly_streak_count?: number;
  longest_weekly_streak?: number;
  weekly_goal_type?: string;
  weekly_goal_target?: number;
  timezone?: string;
  badges?: string[];
  avatar_style?: string;
  avatar_checkpoint_id?: string;
  journey_settings?: Record<string, any>;
  ai_enabled?: boolean;
  target_role?: CareerRole | null;
  created_at?: string;
  updated_at?: string;
}

export interface Roadmap {
  id: number;
  profile_id: number;
  role_id: number;
  target_duration_weeks: number;
  weekly_hours: number;
  readiness_score: number;
  total_estimated_hours: number;
  is_over_capacity: boolean;
  capacity_warning?: string;
  summary?: string;
  created_at?: string;
  updated_at?: string;
  tasks?: RoadmapTask[];
  role?: CareerRole;
}

export interface RoadmapTask {
  id: number;
  roadmap_id: number;
  skill_id?: number | null;
  phase_number: number;
  phase_name: string;
  week_number: number;
  order_in_week: number;
  title: string;
  skill_category: string;
  task_type: string;
  description: string;
  estimated_hours: number;
  priority: string;
  completion_criteria?: string;
  deliverable?: string;
  status: string; // 'not_started' | 'in_progress' | 'completed'
  is_completed: boolean;
  actual_hours_spent: number;
  evidence_link?: string;
  activity_method?: string;
  specialization_branch?: string;
  workspace_data?: Record<string, any>;
  practice_exercises?: string[];
  quiz_data?: any[];
  coding_challenge?: any;
  xp_reward?: number;
  mission_title?: string;
  quest_type?: string;
  day_of_week?: string;
  day_number?: number;
  activity_category?: string;
  resources?: TaskResource[];
  created_at?: string;
  updated_at?: string;
}

export interface TaskResource {
  id: number;
  task_id: number;
  title: string;
  url: string;
  provider: string;
  format: string;
}

export interface ProgressSnapshot {
  id: number;
  profile_id: number;
  roadmap_id: number;
  recorded_date: string;
  completed_tasks_count: number;
  total_tasks_count: number;
  completion_percentage: number;
  readiness_score: number;
  hours_spent: number;
}

export interface DailyActivityLog {
  id: number;
  profile_id: number;
  activity_type: string;
  category: string;
  career_role_id?: number;
  career_title?: string;
  task_id?: number;
  score?: number;
  score_total?: number;
  xp_earned: number;
  duration_minutes: number;
  completed_date: string;
  action_url?: string;
  extra_metadata?: Record<string, any>;
}

export interface LearningResource {
  id: number;
  title: string;
  url: string;
  provider: string;
  format: string;
  difficulty_level: string;
  estimated_duration_hours?: number;
  skill_id?: number;
  career_domain?: string;
  topic?: string;
  free_status?: string;
}

export interface Project {
  id: number;
  title: string;
  slug: string;
  description: string;
  role_id: number;
  difficulty: string;
  estimated_hours: number;
  deliverables?: string[];
  starter_repo_url?: string;
}
