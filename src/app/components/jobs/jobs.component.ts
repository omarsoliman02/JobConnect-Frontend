import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Job } from '../../models/job.model';
import { JobService } from '../../services/job.service';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.scss']
})
export class JobsComponent implements OnInit {
  jobs: Job[] = [];
  filteredJobs: Job[] = [];
  loading: boolean = false;
  searchForm: FormGroup;
  sortOrder: string = 'newest';
  
  constructor(
    private jobService: JobService,
    private fb: FormBuilder
  ) {
    this.searchForm = this.fb.group({
      location: [''],
      jobType: [''],
      salaryMin: [''],
      salaryMax: [''],
      experienceLevel: ['']
    });
  }

  ngOnInit(): void {
    this.loadJobs();
  }

  loadJobs(): void {
    this.loading = true;
    this.jobService.getAllJobs().subscribe({
      next: (data) => {
        this.jobs = data;
        this.filteredJobs = [...this.jobs];
        this.sortByMostRecent();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching jobs:', error);
        this.loading = false;
      }
    });
  }

  sortJobs(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.sortOrder = selectElement.value;
    
    if (this.sortOrder === 'newest') {
      this.sortByMostRecent();
    } else if (this.sortOrder === 'oldest') {
      this.sortByOldest();
    }
  }

  sortByMostRecent(): void {
    this.filteredJobs.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }
  
  sortByOldest(): void {
    this.filteredJobs.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateA - dateB;
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

  onSearch(): void {
    const formValues = this.searchForm.value;
    this.loading = true;
    
    // Convert salary values to numbers if they exist
    const salaryMin = formValues.salaryMin ? parseInt(formValues.salaryMin) : undefined;
    const salaryMax = formValues.salaryMax ? parseInt(formValues.salaryMax) : undefined;
    
    // Use the backend search API
    this.jobService.searchJobs({
      location: formValues.location,
      jobType: formValues.jobType,
      salaryMin: salaryMin,
      salaryMax: salaryMax,
      experienceLevel: formValues.experienceLevel
    }).subscribe({
      next: (data) => {
        this.filteredJobs = data;
        
        // Apply current sort order
        if (this.sortOrder === 'newest') {
          this.sortByMostRecent();
        } else if (this.sortOrder === 'oldest') {
          this.sortByOldest();
        }
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Error searching jobs:', error);
        // Fallback to client-side filtering
        this.clientSideFilter(formValues);
        this.loading = false;
      }
    });
  }

  // Fallback client-side filtering method
  clientSideFilter(formValues: any): void {
    this.filteredJobs = this.jobs.filter(job => {
      // Filter by location
      if (formValues.location && !job.location.toLowerCase().includes(formValues.location.toLowerCase())) {
        return false;
      }
      
      // Filter by job type, checking both new jobType and legacy type
      if (formValues.jobType) {
        const jobTypeMatches = job.jobType === formValues.jobType || 
                              this.getLegacyType(job.type) === formValues.jobType;
        if (!jobTypeMatches) {
          return false;
        }
      }
      
      // Filter by salary range - improved version
      if (formValues.salaryMin && formValues.salaryMin.trim() !== '') {
        const minSalary = parseInt(formValues.salaryMin);
        // Job should have minimum salary greater than or equal to filter value
        if (!job.minSalary || job.minSalary < minSalary) {
          return false;
        }
      }
      
      if (formValues.salaryMax && formValues.salaryMax.trim() !== '') {
        const maxSalary = parseInt(formValues.salaryMax);
        // Job should have maximum salary less than or equal to filter value
        if (!job.maxSalary || job.maxSalary > maxSalary) {
          return false;
        }
      }
      
      // Filter by experience level
      if (formValues.experienceLevel && job.experienceLevel !== formValues.experienceLevel) {
        return false;
      }
      
      return true;
    });
    
    // Apply current sort order
    if (this.sortOrder === 'newest') {
      this.sortByMostRecent();
    } else if (this.sortOrder === 'oldest') {
      this.sortByOldest();
    }
  }

  // Helper method to normalize legacy job type with new format
  getLegacyType(type: string | undefined): string | undefined {
    if (!type) return undefined;
    
    const typeMap: {[key: string]: string} = {
      'full-time': 'FULL_TIME',
      'part-time': 'PART_TIME',
      'contract': 'CONTRACT',
      'freelance': 'FREELANCE',
      'internship': 'INTERNSHIP'
    };
    
    return typeMap[type.toLowerCase()];
  }

  resetFilters(): void {
    this.searchForm.reset();
    this.filteredJobs = [...this.jobs];
    
    // Apply current sort order
    if (this.sortOrder === 'newest') {
      this.sortByMostRecent();
    } else if (this.sortOrder === 'oldest') {
      this.sortByOldest();
    }
  }
}
