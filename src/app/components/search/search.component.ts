import {
  Component,
  ChangeDetectionStrategy,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import {
  Subject,
  switchMap,
  takeUntil,
  catchError,
  EMPTY,
  debounceTime,
  distinctUntilChanged,
  finalize,
} from 'rxjs';
import { Place, AutocompleteSuggestion } from '../../models/place.model';
import { PlacesService } from '../../services/places.service';
import { PlaceCardComponent } from '../place-card/place-card.component';

interface Coordinates {
  latitude: number;
  longitude: number;
}

@Component({
  selector: 'app-search',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, PlaceCardComponent],
  templateUrl: './search.component.html',
})
export class SearchComponent implements OnInit, OnDestroy {
  private readonly placesService = inject(PlacesService);

  readonly queryControl = new FormControl('', { nonNullable: true });
  readonly results = signal<Place[]>([]);
  readonly suggestions = signal<AutocompleteSuggestion[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly hasResults = computed(() => this.results().length > 0);
  readonly wishlistCount = input(0);
  readonly isWishlistPulsing = input(false);
  readonly hasResultsChange = output<boolean>();
  readonly openWishlistRequested = output<void>();

  private searchTrigger$ = new Subject<string>();
  private locationTrigger$ = new Subject<Coordinates>();
  private destroy$ = new Subject<void>();
  private clearSuggestionsTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect(() => {
      this.hasResultsChange.emit(this.hasResults());
    });
  }

  ngOnInit(): void {
    this.queryControl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((query) =>
          this.placesService.autocomplete(query ?? '').pipe(catchError(() => EMPTY)),
        ),
        takeUntil(this.destroy$),
      )
      .subscribe((suggestions) => this.suggestions.set(suggestions));

    this.searchTrigger$
      .pipe(
        switchMap((query) => {
          this.isLoading.set(true);
          this.error.set(null);
          return this.placesService.searchPlaces(query).pipe(
            catchError(() => {
              this.error.set('Something went wrong. Try again.');
              return EMPTY;
            }),
            finalize(() => this.isLoading.set(false)),
          );
        }),
        takeUntil(this.destroy$),
      )
      .subscribe((places) => {
        this.results.set(places);
      });

    this.locationTrigger$
      .pipe(
        switchMap((coords) => {
          this.isLoading.set(true);
          this.error.set(null);
          return this.placesService.searchByLocation(coords.latitude, coords.longitude).pipe(
            catchError(() => {
              this.error.set('Something went wrong. Try again.');
              return EMPTY;
            }),
            finalize(() => this.isLoading.set(false)),
          );
        }),
        takeUntil(this.destroy$),
      )
      .subscribe((places) => {
        this.results.set(places);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.clearSuggestionsTimeout) {
      clearTimeout(this.clearSuggestionsTimeout);
    }
  }

  search(): void {
    const query = this.queryControl.value.trim();
    if (!query) return;
    this.suggestions.set([]);
    this.searchTrigger$.next(query);
  }

  selectSuggestion(suggestion: AutocompleteSuggestion): void {
    this.queryControl.setValue(suggestion.text.primary, { emitEvent: false });
    this.suggestions.set([]);

    if (suggestion.type === 'geo' && suggestion.geo) {
      this.locationTrigger$.next({
        latitude: suggestion.geo.center.latitude,
        longitude: suggestion.geo.center.longitude,
      });
    } else {
      this.searchTrigger$.next(suggestion.text.primary);
    }
  }

  clearSuggestions(): void {
    if (this.clearSuggestionsTimeout) {
      clearTimeout(this.clearSuggestionsTimeout);
    }
    this.clearSuggestionsTimeout = setTimeout(() => this.suggestions.set([]), 150);
  }

  searchByLocation(): void {
    if (!navigator.geolocation) {
      this.error.set('Geolocation is not supported.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => this.locationTrigger$.next(coords),
      () => this.error.set('Could not get your location.'),
    );
  }

  openWishlist(): void {
    this.openWishlistRequested.emit();
  }
}
