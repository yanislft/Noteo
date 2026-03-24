export interface User {
  id: number;
  name: string;
  firstname: string;
  email: string;
}

export interface Year {
  id: number;
  user_id: number;
  name: string;
}

export interface Semester {
  id: number;
  year_id: number;
  name: string;
}

export interface Subject {
  id: number;
  semester_id: number;
  name: string;
  coefficient: number;
}

export interface Grade {
  id: number;
  subject_id: number;
  name: string;
  value: number;
  coefficient: number;
}

export interface Analytics {
  average: number;
  best_year?: { id: number; name: string; average: number };
  best_semester?: { id: number; name: string; average: number };
  best_subject?: { id: number; name: string; average: number };
  best_grade?: Grade;
  years?: { id: number; name: string; average: number }[];
  semesters?: { id: number; name: string; average: number }[];
  subjects?: { id: number; name: string; average: number; coefficient: number }[];
  grades?: Grade[];
}
