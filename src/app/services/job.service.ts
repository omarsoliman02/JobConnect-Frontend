import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { Application } from '../models/application.model';
import { Company, Job } from '../models/job.model';

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private apiUrl = 'http://localhost:8081/api/jobs';
  private companiesUrl = 'http://localhost:8081/api/companies';
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  getAllJobs(): Observable<Job[]> {
    return this.http.get<Job[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  getJobById(id: string): Observable<Job> {
    return this.http.get<Job>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  createJob(job: Job): Observable<Job> {
    return this.http.post<Job>(this.apiUrl, job, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  updateJob(id: string, job: Job): Observable<Job> {
    return this.http.put<Job>(`${this.apiUrl}/${id}`, job, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  deleteJob(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }
  
  getApplicationsByJobId(jobId: string): Observable<Application[]> {
    return this.http.get<Application[]>(`${this.apiUrl}/${jobId}/applications`)
      .pipe(catchError(this.handleError));
  }

  // Company related methods
  getAllCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(this.companiesUrl)
      .pipe(catchError(this.handleError));
  }

  searchCompanies(searchTerm: string): Observable<Company[]> {
    return this.http.get<Company[]>(`${this.companiesUrl}?search=${searchTerm}`)
      .pipe(catchError(this.handleError));
  }

  createCompany(company: Company): Observable<Company> {
    return this.http.post<Company>(this.companiesUrl, company, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  // Advanced search for job listings
  searchJobs(params: {
    location?: string,
    jobType?: string,
    salaryMin?: number,
    salaryMax?: number,
    experienceLevel?: string
  }): Observable<Job[]> {
    let httpParams = new HttpParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        httpParams = httpParams.set(key, value.toString());
      }
    });
    
    return this.http.get<Job[]>(`${this.apiUrl}/search`, { params: httpParams })
      .pipe(catchError(this.handleError));
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