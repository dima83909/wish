import { Injectable, signal, computed } from '@angular/core';
import { Place } from '../models/place.model';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private readonly STORAGE_KEY = 'travel_wishlist';

  private readonly _wishlist = signal<Place[]>(this.loadFromStorage());

  readonly wishlist = this._wishlist.asReadonly();
  readonly count = computed(() => this._wishlist().length);

  isInWishlist(fsq_place_id: string): boolean {
    return this._wishlist().some((p) => p.fsq_place_id === fsq_place_id);
  }

  toggle(place: Place): void {
    if (this.isInWishlist(place.fsq_place_id)) {
      this.remove(place.fsq_place_id);
    } else {
      this.add(place);
    }
  }

  private add(place: Place): void {
    this._wishlist.update((list) => [...list, place]);
    this.saveToStorage();
  }

  private remove(fsq_place_id: string): void {
    this._wishlist.update((list) => list.filter((p) => p.fsq_place_id !== fsq_place_id));
    this.saveToStorage();
  }

  private saveToStorage(): void {
    const storage = this.getStorage();
    if (!storage) return;

    try {
      storage.setItem(this.STORAGE_KEY, JSON.stringify(this._wishlist()));
    } catch {
      // Ignore storage failures, e.g. private mode or quota errors.
    }
  }

  private loadFromStorage(): Place[] {
    const storage = this.getStorage();
    if (!storage) return [];

    try {
      const data = storage.getItem(this.STORAGE_KEY);
      const parsed: unknown = data ? JSON.parse(data) : [];
      return Array.isArray(parsed) ? (parsed as Place[]) : [];
    } catch {
      return [];
    }
  }

  private getStorage(): Storage | null {
    const storage = globalThis.localStorage;

    return storage && typeof storage.getItem === 'function' && typeof storage.setItem === 'function'
      ? storage
      : null;
  }
}
