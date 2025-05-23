import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Job } from '../../models/job.model';
import { JobService } from '../../services/job.service';

@Component({
  selector: 'app-job-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './job-detail.component.html',
  styleUrls: ['./job-detail.component.scss']
})
export class JobDetailComponent implements OnInit {
  job: Job | null = null;
  loading: boolean = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jobService: JobService
  ) { }

  ngOnInit(): void {
    this.loadJob();
  }

  loadJob(): void {
    const jobId = this.route.snapshot.paramMap.get('id');
    if (!jobId) {
      this.error = 'Job ID is missing';
      this.loading = false;
      return;
    }

    this.jobService.getJobById(jobId).subscribe({
      next: (data) => {
        this.job = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching job details:', err);
        this.error = 'Could not load job details. Please try again later.';
        this.loading = false;
      }
    });
  }

  formatJobType(jobType: string | undefined): string {
    // Format job types from either the legacy format or the new enum format
    if (!jobType) return 'Full-time'; // Default value
    
    const typeFormatMap: {[key: string]: string} = {
      // New enum format
      'FULL_TIME': 'Full-time',
      'PART_TIME': 'Part-time',
      'CONTRACT': 'Contract',
      'FREELANCE': 'Freelance',
      'INTERNSHIP': 'Internship',
      
      // Legacy format
      'full-time': 'Full-time',
      'part-time': 'Part-time',
      'contract': 'Contract',
      'freelance': 'Freelance',
      'internship': 'Internship'
    };
    
    return typeFormatMap[jobType] || jobType;
  }

  formatExperienceLevel(level: string | undefined): string {
    if (!level) return 'Not specified';
    
    const levelFormatMap: {[key: string]: string} = {
      'ENTRY_LEVEL': 'Entry Level',
      'INTERMEDIATE': 'Intermediate',
      'SENIOR': 'Senior',
      'EXECUTIVE': 'Executive'
    };
    
    return levelFormatMap[level] || level;
  }

  applyForJob(): void {
    if (this.job) {
      this.router.navigate(['/jobs', this.job.id, 'apply']);
    }
  }

  goBack(): void {
    this.router.navigate(['/jobs']);
  }
}
