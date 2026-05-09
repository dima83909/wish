import { Component, ChangeDetectionStrategy, inject, input, output } from '@angular/core';
import { WishlistService } from '../../services/wishlist.service';
import { PlaceCardComponent } from '../place-card/place-card.component';

@Component({
  selector: 'app-wishlist',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PlaceCardComponent],
  templateUrl: './wishlist.component.html',
})
export class WishlistComponent {
  readonly isOpen = input(false);
  readonly closed = output<void>();

  protected readonly wishlistService = inject(WishlistService);

  close(): void {
    this.closed.emit();
  }
}
