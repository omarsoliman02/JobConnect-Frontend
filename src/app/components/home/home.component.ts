import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Job } from '../../models/job.model';
import { JobService } from '../../services/job.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  recentJobs: Job[] = [];
  loading: boolean = true;

  constructor(private jobService: JobService, private router: Router) { }

  ngOnInit(): void {
    this.loadRecentJobs();
  }

  loadRecentJobs(): void {
    this.loading = true;
    this.jobService.getAllJobs().subscribe({
      next: (jobs) => {
        // Sort by most recently posted
        this.recentJobs = jobs.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        }).slice(0, 5); // Get only 5 most recent jobs
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching recent jobs:', error);
        this.loading = false;
      }
    });
  }

  viewAllJobs(): void {
    this.router.navigate(['/jobs']);
  }
}
