import { inject, Injectable } from '@angular/core';
import { Observable, of, map } from 'rxjs';
import { AutocompleteSuggestion } from '../models/autocomplete.model';
import { environment } from '../../environments/environment';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root',
})
export class AutocompleteService {
  private readonly httpService = inject(HttpService);
  private readonly AUTOCOMPLETE_URL = '/fsq-api/autocomplete';

  autocomplete(input: string): Observable<AutocompleteSuggestion[]> {
    const query = input.trim();
    if (!query) return of([]);

    return this.httpService.get<{ results: AutocompleteSuggestion[] }>(this.AUTOCOMPLETE_URL, {
        query,
        limit: '5'
      })
      .pipe(map(response => response.results));
  }
}
