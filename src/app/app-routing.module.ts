import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ApplicantFormComponent } from './components/applicant-form/applicant-form.component';
import { HomeComponent } from './components/home/home.component';
import { JobDetailComponent } from './components/job-detail/job-detail.component';
import { JobFormComponent } from './components/job-form/job-form.component';
import { JobsComponent } from './components/jobs/jobs.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'jobs', component: JobsComponent },
  { path: 'jobs/new', component: JobFormComponent },
  { path: 'jobs/:id', component: JobDetailComponent },
  { path: 'jobs/:id/edit', component: JobFormComponent },
  { path: 'jobs/:id/apply', component: ApplicantFormComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { } 