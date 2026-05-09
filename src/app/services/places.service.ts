import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Place } from '../models/place.model';
import { HttpService } from './http.service';

interface CacheEntry {
  data: Place[];
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class PlacesService {
  private readonly httpService = inject(HttpService);

  private readonly cache = new Map<string, CacheEntry>();
  private readonly CACHE_TTL = 10 * 60 * 1000;
  private readonly SEARCH_URL = '/fsq-api/places/search';

  searchPlaces(query: string, limit = 50): Observable<Place[]> {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) return of([]);

    const cacheKey = `search:${normalizedQuery}:${limit}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return of(cached);

    return this.httpService.get<{ results: Place[] }>(this.SEARCH_URL, {
      query: normalizedQuery,
      limit: limit.toString()
    })
    .pipe(
      map(response => response.results.map(p => this.mapPlace(p))),
      tap(places => this.setCache(cacheKey, places)),
    );
  }

  searchByLocation(lat: number, lng: number, limit = 50, radius = 50000): Observable<Place[]> {
    const cacheKey = `geo:${lat},${lng}:${limit}:${radius}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return of(cached);

    return this.httpService.get<{ results: Place[] }>(this.SEARCH_URL, {
      ll: `${lat},${lng}`,
      radius: radius.toString(),
      limit: limit.toString(),
    })
    .pipe(
      map(response => response.results.map(p => this.mapPlace(p))),
      tap(places => this.setCache(cacheKey, places)),
    );
  }

  private mapPlace(p: Place): Place {
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
