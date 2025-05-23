import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { Applicant, Experience } from '../models/applicant.model';
import { Application } from '../models/application.model';

@Injectable({
  providedIn: 'root'
})
export class ApplicantService {
  private apiUrl = 'http://localhost:8081/api/applicants';
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  getAllApplicants(): Observable<Applicant[]> {
    return this.http.get<Applicant[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  getApplicantById(id: string): Observable<Applicant> {
    return this.http.get<Applicant>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  createApplicant(applicant: Applicant): Observable<Applicant> {
    console.log('Creating applicant with data:', JSON.stringify(applicant));
    return this.http.post<Applicant>(this.apiUrl, applicant, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  updateApplicant(id: string, applicant: Applicant): Observable<Applicant> {
    return this.http.put<Applicant>(`${this.apiUrl}/${id}`, applicant, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  deleteApplicant(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  getApplicationsByApplicantId(applicantId: string): Observable<Application[]> {
    return this.http.get<Application[]>(`${this.apiUrl}/${applicantId}/applications`)
      .pipe(catchError(this.handleError));
  }

  getExperiencesByApplicantId(applicantId: string): Observable<Experience[]> {
    return this.http.get<Experience[]>(`${this.apiUrl}/${applicantId}/experiences`)
      .pipe(catchError(this.handleError));
  }

  // Method to apply for a job
  applyForJob(applicantId: string, jobId: string): Observable<Application> {
    console.log(`Creating application for applicant ${applicantId} and job ${jobId}`);
    return this.http.post<Application>(
      `http://localhost:8081/api/applications`, 
      { applicant: { id: applicantId }, job: { id: jobId } }, 
      this.httpOptions
    ).pipe(catchError(this.handleError));
  }

  // Method to add experience to an applicant
  addExperience(applicantId: string, experience: Experience): Observable<Experience> {
    experience.applicant = { id: applicantId } as Applicant;
    return this.http.post<Experience>(
      `http://localhost:8081/api/experiences`, 
      experience, 
      this.httpOptions
    ).pipe(catchError(this.handleError));
  }

  // Error handling method
  private handleError(error: any) {
    console.error('API Error:', error);
    let errorMessage = '';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      if (error.error) {
        errorMessage += `\nDetails: ${JSON.stringify(error.error)}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
} 