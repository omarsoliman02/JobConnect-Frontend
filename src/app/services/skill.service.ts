import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { Skill } from '../models/applicant.model';

@Injectable({
  providedIn: 'root'
})
export class SkillService {
  private apiUrl = 'http://localhost:8081/api/skills';
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  getAllSkills(): Observable<Skill[]> {
    return this.http.get<Skill[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  getSkillById(id: string): Observable<Skill> {
    return this.http.get<Skill>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  searchSkills(query: string): Observable<Skill[]> {
    return this.http.get<Skill[]>(`${this.apiUrl}/search?query=${query}`)
      .pipe(catchError(this.handleError));
  }

  createSkill(skill: Skill): Observable<Skill> {
    return this.http.post<Skill>(this.apiUrl, skill, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    console.error('API Error:', error);
    let errorMessage = '';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    
    return throwError(() => new Error(errorMessage));
  }
} 