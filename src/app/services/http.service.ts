import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HttpService {
  private readonly http = inject(HttpClient);

  get headers(): HttpHeaders {
    let headers = new HttpHeaders({
      Accept: 'application/json',
      'X-Places-Api-Version': '2025-06-17',
    });
    if (environment.foursquareApiKey) {
      headers = headers.set('Authorization', `Bearer ${environment.foursquareApiKey}`);
    }
    return headers;
  }

  get<T>(url: string, params?: Record<string, string>): Observable<T> {
    return this.http.get<T>(url, {
      headers: this.headers,
      params,
    });
  }
}
