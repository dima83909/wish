import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AutocompleteSuggestion, Place } from '../models/place.model';

interface CacheEntry {
  data: Place[];
  timestamp: number;
}

interface FsqPlace {
  fsq_place_id: string;
  name: string;
  location: Place['location'];
  categories: Place['categories'];
  tel?: string;
  website?: string;
  distance?: number;
  social_media?: Place['social_media'];
}

@Injectable({ providedIn: 'root' })
export class PlacesService {
  private readonly http = inject(HttpClient);
  private readonly cache = new Map<string, CacheEntry>();
  private readonly CACHE_TTL = 10 * 60 * 1000;
  private readonly SEARCH_URL = '/fsq-api/places/search';
  private readonly AUTOCOMPLETE_URL = '/fsq-api/autocomplete';

  private get headers(): HttpHeaders {
    let headers = new HttpHeaders({
      Accept: 'application/json',
      'X-Places-Api-Version': '2025-06-17',
    });
    if (environment.foursquareApiKey) {
      headers = headers.set('Authorization', `Bearer ${environment.foursquareApiKey}`);
    }
    return headers;
  }

  autocomplete(input: string): Observable<AutocompleteSuggestion[]> {
    const query = input.trim();
    if (!query) return of([]);

    return this.http
      .get<{ results: AutocompleteSuggestion[] }>(this.AUTOCOMPLETE_URL, {
        headers: this.headers,
        params: { query, limit: '5' },
      })
      .pipe(map(response => response.results));
  }

  searchPlaces(query: string, limit = 10): Observable<Place[]> {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) return of([]);

    const cacheKey = `search:${normalizedQuery}:${limit}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return of(cached);

    return this.http
      .get<{ results: FsqPlace[] }>(this.SEARCH_URL, {
        headers: this.headers,
        params: {
          query: normalizedQuery,
          limit: limit.toString(),
          intent: 'global',
        },
      })
      .pipe(
        map(response => response.results.map(p => this.mapPlace(p))),
        tap(places => this.setCache(cacheKey, places)),
      );
  }

  searchByLocation(lat: number, lng: number, limit = 10, radius = 50000): Observable<Place[]> {
    const cacheKey = `geo:${lat},${lng}:${limit}:${radius}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return of(cached);

    return this.http
      .get<{ results: FsqPlace[] }>(this.SEARCH_URL, {
        headers: this.headers,
        params: {
          ll: `${lat},${lng}`,
          radius: radius.toString(),
          limit: limit.toString(),
        },
      })
      .pipe(
        map(response => response.results.map(p => this.mapPlace(p))),
        tap(places => this.setCache(cacheKey, places)),
      );
  }

  private mapPlace(p: FsqPlace): Place {
    return {
      fsq_place_id: p.fsq_place_id,
      name: p.name,
      location: p.location,
      categories: p.categories,
      tel: p.tel,
      website: p.website,
      distance: p.distance,
      social_media: p.social_media,
    };
  }

  private getFromCache(key: string): Place[] | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > this.CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  private setCache(key: string, data: Place[]): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }
}
