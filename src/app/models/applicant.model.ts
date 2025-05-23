export interface Applicant {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  experiences?: Experience[];
  skills?: Skill[];
}

export interface Experience {
  id?: string;
  companyName: string;
  role: string;
  startDate: Date;
  endDate?: Date;
  applicant?: Applicant;
}

export interface Skill {
  id?: string;
  name: string;
} 