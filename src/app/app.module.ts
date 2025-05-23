import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ApplicantFormComponent } from './components/applicant-form/applicant-form.component';
import { HomeComponent } from './components/home/home.component';
import { JobDetailComponent } from './components/job-detail/job-detail.component';
import { JobFormComponent } from './components/job-form/job-form.component';
import { JobsComponent } from './components/jobs/jobs.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    JobsComponent,
    JobDetailComponent,
    JobFormComponent,
    ApplicantFormComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { } 