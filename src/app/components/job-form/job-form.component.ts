import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Company } from '../../models/job.model';
import { JobService } from '../../services/job.service';

@Component({
  selector: 'app-job-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './job-form.component.html',
  styleUrls: ['./job-form.component.scss']
})
export class JobFormComponent implements OnInit {
  jobForm: FormGroup;
  jobId: string | null = null;
  isEditMode = false;
  loading = false;
  submitted = false;
  error = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private jobService: JobService
  ) {
    this.jobForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      location: ['', Validators.required],
      companyName: ['', Validators.required],
      jobType: ['FULL_TIME', Validators.required],
      minSalary: [null, [Validators.min(0)]],
      maxSalary: [null, [Validators.min(0)]],
      experienceLevel: ['ENTRY_LEVEL'],
      description: ['', [Validators.required, Validators.minLength(20)]],
      responsibilities: this.formBuilder.array([this.createResponsibilityField()]),
      qualifications: this.formBuilder.array([this.createQualificationField()])
    });
  }

  ngOnInit(): void {
    this.jobId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = this.router.url.includes('/edit');

    if (this.isEditMode && this.jobId) {
      this.loadJobData();
    }
  }

  get responsibilitiesArray(): FormArray {
    return this.jobForm.get('responsibilities') as FormArray;
  }

  get qualificationsArray(): FormArray {
    return this.jobForm.get('qualifications') as FormArray;
  }

  createResponsibilityField() {
    return this.formBuilder.control('', Validators.required);
  }

  createQualificationField() {
    return this.formBuilder.control('', Validators.required);
  }

  addResponsibility() {
    this.responsibilitiesArray.push(this.createResponsibilityField());
  }

  addQualification() {
    this.qualificationsArray.push(this.createQualificationField());
  }

  removeResponsibility(index: number) {
    if (this.responsibilitiesArray.length > 1) {
      this.responsibilitiesArray.removeAt(index);
    }
  }

  removeQualification(index: number) {
    if (this.qualificationsArray.length > 1) {
      this.qualificationsArray.removeAt(index);
    }
  }

  loadJobData() {
    if (!this.jobId) return;
    
    this.loading = true;
    this.jobService.getJobById(this.jobId).subscribe({
      next: (job) => {
        // Clear default form array items
        while (this.responsibilitiesArray.length) {
          this.responsibilitiesArray.removeAt(0);
        }
        while (this.qualificationsArray.length) {
          this.qualificationsArray.removeAt(0);
        }

        // Add responsibilities from job data
        if (job.responsibilities && job.responsibilities.length > 0) {
          job.responsibilities.forEach(responsibility => {
            this.responsibilitiesArray.push(this.formBuilder.control(responsibility, Validators.required));
          });
        } else {
          this.addResponsibility(); // Add one empty field if none exist
        }

        // Add qualifications from job data
        if (job.qualifications && job.qualifications.length > 0) {
          job.qualifications.forEach(qualification => {
            this.qualificationsArray.push(this.formBuilder.control(qualification, Validators.required));
          });
        } else {
          this.addQualification(); // Add one empty field if none exist
        }
        
        // If the job has a company, set company name
        if (job.company) {
          this.jobForm.patchValue({
            companyName: job.company.name
          });
        }

        // Update form with job data - handle both legacy and new field formats
        this.jobForm.patchValue({
          title: job.title,
          location: job.location,
          jobType: job.jobType || this.convertLegacyType(job.type),
          minSalary: job.minSalary || null,
          maxSalary: job.maxSalary || null,
          experienceLevel: job.experienceLevel || 'ENTRY_LEVEL',
          description: job.description
        });

        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading job:', err);
        this.error = 'Could not load job data. Please try again.';
        this.loading = false;
      }
    });
  }

  // Helper method to convert legacy job type strings to the new enum format
  convertLegacyType(type: string | undefined): string {
    if (!type) return 'FULL_TIME';
    
    const typeMap: {[key: string]: string} = {
      'full-time': 'FULL_TIME',
      'part-time': 'PART_TIME',
      'contract': 'CONTRACT',
      'freelance': 'FREELANCE',
      'internship': 'INTERNSHIP'
    };
    
    return typeMap[type.toLowerCase()] || 'FULL_TIME';
  }

  onSubmit() {
    this.submitted = true;

    // Stop if form is invalid
    if (this.jobForm.invalid) {
      return;
    }

    this.loading = true;
    const jobData = { ...this.jobForm.value };
    
    // For backward compatibility, set the legacy type field
    jobData.type = this.convertToLegacyType(jobData.jobType);
    
    // For backward compatibility, set the legacy salaryRange field
    if (jobData.minSalary && jobData.maxSalary) {
      jobData.salaryRange = `$${jobData.minSalary} - $${jobData.maxSalary}`;
    } else if (jobData.minSalary) {
      jobData.salaryRange = `$${jobData.minSalary}+`;
    } else if (jobData.maxSalary) {
      jobData.salaryRange = `Up to $${jobData.maxSalary}`;
    }
    
    // Create new company
    const newCompany: Company = {
      name: jobData.companyName
    };
    
    // Remove companyName from jobData as it's not part of the Job model
    delete jobData.companyName;
    
    this.jobService.createCompany(newCompany).subscribe({
      next: (createdCompany) => {
        // Associate job with the created company
        jobData.company = { id: createdCompany.id };
        
        if (this.isEditMode && this.jobId) {
          this.jobService.updateJob(this.jobId, jobData).subscribe({
            next: () => {
              this.router.navigate(['/jobs', this.jobId]);
            },
            error: (err) => {
              console.error('Error updating job:', err);
              this.error = 'Failed to update job. Please try again.';
              this.loading = false;
            }
          });
        } else {
          this.jobService.createJob(jobData).subscribe({
            next: (newJob) => {
              this.router.navigate(['/jobs', newJob.id]);
            },
            error: (err) => {
              console.error('Error creating job:', err);
              this.error = 'Failed to create job. Please try again.';
              this.loading = false;
            }
          });
        }
      },
      error: (err) => {
        console.error('Error creating company:', err);
        this.error = 'Failed to create company. Please try again.';
        this.loading = false;
      }
    });
  }

  // Helper method to convert new enum format to legacy job type strings
  convertToLegacyType(jobType: string): string {
    const typeMap: {[key: string]: string} = {
      'FULL_TIME': 'full-time',
      'PART_TIME': 'part-time',
      'CONTRACT': 'contract',
      'FREELANCE': 'freelance',
      'INTERNSHIP': 'internship'
    };
    
    return typeMap[jobType] || 'full-time';
  }

  cancel() {
    if (this.isEditMode && this.jobId) {
      this.router.navigate(['/jobs', this.jobId]);
    } else {
      this.router.navigate(['/jobs']);
    }
  }
}
