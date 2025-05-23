import { Applicant } from './applicant.model';
import { Job } from './job.model';

export interface Application {
  id?: string;
  applicant: Applicant;
  job: Job;
  appliedAt?: Date;
} 