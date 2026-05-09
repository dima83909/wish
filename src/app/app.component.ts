import {
  Component,
  ChangeDetectionStrategy,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { SearchComponent } from './components/search/search.component';
import { WishlistComponent } from './components/wishlist/wishlist.component';
import { WishlistService } from './services/wishlist.service';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SearchComponent, WishlistComponent],
  templateUrl: './app.component.html',
})
export class App {
  private readonly wishlistService = inject(WishlistService);

  readonly hasResults = signal(false);
  readonly isDrawerOpen = signal(false);
  readonly isWishlistPulsing = signal(false);
  readonly wishlistCount = computed(() => this.wishlistService.count());

  private pulseTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect(() => {
      const count = this.wishlistCount();
      if (count === 0) return;

      if (this.pulseTimeout) {
        clearTimeout(this.pulseTimeout);
      }

      setTimeout(() => this.isWishlistPulsing.set(true), 650);
      this.pulseTimeout = setTimeout(() => this.isWishlistPulsing.set(false), 1050);
    });
  }

  setHasResults(hasResults: boolean): void {
    this.hasResults.set(hasResults);
  }

  openWishlist(): void {
    this.isDrawerOpen.set(true);
  }

  closeWishlist(): void {
    this.isDrawerOpen.set(false);
  }
}
