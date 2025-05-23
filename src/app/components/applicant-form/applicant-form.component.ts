import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Skill } from '../../models/applicant.model';
import { Job } from '../../models/job.model';
import { ApplicantService } from '../../services/applicant.service';
import { JobService } from '../../services/job.service';
import { SkillService } from '../../services/skill.service';

@Component({
  selector: 'app-applicant-form',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './applicant-form.component.html',
  styleUrls: ['./applicant-form.component.scss']
})
export class ApplicantFormComponent implements OnInit {
  applicationForm: FormGroup;
  job: Job | null = null;
  loading = false;
  submitting = false;
  submitted = false;
  error = '';
  success = false;
  
  // Skill handling
  allSkills: Skill[] = [];
  filteredSkills: Skill[] = [];
  searchTerm: string = '';
  selectedSkills: Skill[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private jobService: JobService,
    private applicantService: ApplicantService,
    private skillService: SkillService
  ) {
    this.applicationForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      experiences: this.formBuilder.array([this.createExperienceGroup()]),
      skillSearch: ['']
    });
  }

  ngOnInit(): void {
    const jobId = this.route.snapshot.paramMap.get('id');
    if (jobId) {
      this.loading = true;
      this.jobService.getJobById(jobId).subscribe({
        next: (job) => {
          this.job = job;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading job:', error);
          this.error = 'Could not load job details. Please try again.';
          this.loading = false;
        }
      });
    } else {
      this.error = 'Job ID is missing';
    }

    // Load all skills
    this.skillService.getAllSkills().subscribe({
      next: (skills) => {
        this.allSkills = skills;
        this.filteredSkills = [...this.allSkills];
      },
      error: (error) => {
        console.error('Error loading skills:', error);
      }
    });

    // Setup search with debounce
    this.applicationForm.get('skillSearch')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(query => {
          this.searchTerm = query;
          if (query.trim() === '') {
            return of(this.allSkills);
          } else {
            return this.skillService.searchSkills(query);
          }
        })
      )
      .subscribe({
        next: (skills) => {
          this.filteredSkills = skills;
        }
      });
  }

  createExperienceGroup(): FormGroup {
    return this.formBuilder.group({
      companyName: ['', Validators.required],
      role: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: [''],
      description: ['']
    });
  }

  get experiencesArray(): FormArray {
    return this.applicationForm.get('experiences') as FormArray;
  }

  addExperience(): void {
    this.experiencesArray.push(this.createExperienceGroup());
  }

  removeExperience(index: number): void {
    if (this.experiencesArray.length > 1) {
      this.experiencesArray.removeAt(index);
    }
  }

  // Skill handling methods
  selectSkill(skill: Skill): void {
    if (!this.selectedSkills.some(s => s.id === skill.id)) {
      this.selectedSkills.push(skill);
    }
    this.applicationForm.get('skillSearch')?.setValue('');
  }

  removeSkill(skill: Skill): void {
    this.selectedSkills = this.selectedSkills.filter(s => s.id !== skill.id);
  }

  onSubmit(): void {
    this.submitted = true;

    // Stop if form is invalid
    if (this.applicationForm.invalid || this.selectedSkills.length === 0) {
      if (this.selectedSkills.length === 0) {
        this.error = 'Please select at least one skill';
      }
      return;
    }

    this.submitting = true;
    this.error = '';
    const formValues = this.applicationForm.value;

    // Create applicant with selected skills
    const applicant = {
      firstName: formValues.firstName,
      lastName: formValues.lastName,
      email: formValues.email,
      phone: formValues.phone,
      skills: this.selectedSkills,
      experiences: formValues.experiences
    };

    // Actually send the applicant data to the backend
    this.applicantService.createApplicant(applicant).subscribe({
      next: (createdApplicant) => {
        console.log('Applicant created:', createdApplicant);
        
        // Now create the application linking the applicant to the job
        if (this.job && this.job.id && createdApplicant.id) {
          this.applicantService.applyForJob(createdApplicant.id, this.job.id).subscribe({
            next: (application) => {
              console.log('Application created:', application);
              this.submitting = false;
              this.success = true;
            },
            error: (err) => {
              console.error('Error creating application:', err);
              this.error = 'Failed to submit application. Please try again.';
              this.submitting = false;
            }
          });
        } else {
          this.submitting = false;
          this.success = true;
        }
      },
      error: (err) => {
        console.error('Error creating applicant:', err);
        this.error = 'Failed to submit application. Please try again.';
        this.submitting = false;
      }
    });
  }

  goBack(): void {
    if (this.job?.id) {
      this.router.navigate(['/jobs', this.job.id]);
    } else {
      this.router.navigate(['/jobs']);
    }
  }
}
