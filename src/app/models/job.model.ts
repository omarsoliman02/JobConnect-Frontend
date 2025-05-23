export interface Job {
  id?: string;
  title: string;
  description: string;
  location: string;
  company?: Company;
  applications?: any[];
  createdAt?: Date | string;
  jobType?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'FREELANCE' | 'INTERNSHIP';
  minSalary?: number;
  maxSalary?: number;
  experienceLevel?: 'ENTRY_LEVEL' | 'INTERMEDIATE' | 'SENIOR' | 'EXECUTIVE';
  type?: string; // Deprecated, use jobType instead
  responsibilities?: string[];
  qualifications?: string[];
  salaryRange?: string; // Deprecated, use minSalary and maxSalary instead
}

export interface Company {
  id?: string;
  name: string;
  location?: string;
  website?: string;
  jobs?: Job[];
} 