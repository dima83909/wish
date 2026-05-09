import { Component, ChangeDetectionStrategy, inject, input, computed, signal } from '@angular/core';
import { Place } from '../../models/place.model';
import { WishlistService } from '../../services/wishlist.service';

interface FlyingHeart {
  id: number;
  x: number;
  y: number;
  deltaX: number;
  deltaY: number;
}

@Component({
  selector: 'app-place-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './place-card.component.html',
  styles: [
    `
      .card {
        background: var(--color-card);
        border: 1px solid var(--color-border);
        box-shadow: var(--shadow-warm);
        transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
      }
      .card:hover {
        transform: translateY(-6px);
        border-color: var(--color-primary);
        box-shadow: var(--shadow-warm-hover);
      }
      .card:hover .card-img {
        transform: scale(1.035);
      }
      .card-img {
        object-fit: contain;
        transition: transform 0.4s ease;
      }
      .category-badge {
        background: rgba(255, 255, 255, 0.9);
        color: var(--color-text);
        border: 1px solid var(--color-border);
        backdrop-filter: blur(8px);
      }
      .flying-heart {
        position: fixed;
        left: var(--start-x);
        top: var(--start-y);
        z-index: 80;
        pointer-events: none;
        color: var(--color-primary);
        font-size: 28px;
        text-shadow: 0 8px 22px rgba(255, 171, 138, 0.45);
        animation: fly-heart 0.85s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      }
      @keyframes fly-heart {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.6); }
        15% { opacity: 1; transform: translate(-50%, -70%) scale(1.35); }
        100% { opacity: 0; transform: translate(calc(-50% + var(--delta-x)), calc(-50% + var(--delta-y))) scale(0.35); }
      }
    `,
  ],
})
export class PlaceCardComponent {
  readonly place = input.required<Place>();
  private readonly wishlistService = inject(WishlistService);
  readonly flyingHearts = signal<FlyingHeart[]>([]);
  readonly isHovered = signal(false);
  private flyingHeartId = 0;

  isInWishlist = computed(() => this.wishlistService.isInWishlist(this.place().fsq_place_id));

  photoUrl = computed(() => {
    const photo = this.place().photos?.[0];
    if (!photo) return null;
    return `${photo.prefix}400x300${photo.suffix}`;
  });

  categoryIconUrl = computed(() => {
    const icon = this.place().categories?.[0]?.icon;
    if (!icon) return null;
    return `${icon.prefix}88${icon.suffix}`;
  });

  btnLabel = computed(() => {
    if (!this.isInWishlist()) return 'Save';
    return this.isHovered() ? 'Remove' : 'Saved';
  });

  btnStyle = computed(() => {
    if (!this.isInWishlist()) {
      return this.isHovered()
        ? 'background: var(--color-primary); color: #ffffff; border: 1px solid var(--color-primary); box-shadow: var(--shadow-warm)'
        : 'background: #ffffff; color: var(--color-muted); border: 1px solid var(--color-border); box-shadow: var(--shadow-warm)';
    }
    if (this.isHovered()) {
      return 'background: rgba(220,38,38,0.08); color: #DC2626; border: 1px solid rgba(220,38,38,0.3)';
    }
    return 'background: var(--color-primary); color: #ffffff; border: 1px solid var(--color-primary); box-shadow: var(--shadow-warm)';
  });

  toggleWishlist(event?: MouseEvent): void {
    const wasInWishlist = this.isInWishlist();
    this.wishlistService.toggle(this.place());
    if (!wasInWishlist && event) {
      this.launchFlyingHeart(event);
    }
  }

  formatDistance(meters: number): string {
    return meters >= 1000 ? (meters / 1000).toFixed(1) + ' km' : meters + ' m';
  }

  private launchFlyingHeart(event: MouseEvent): void {
    const id = this.flyingHeartId++;
    const target = document.querySelector<HTMLElement>('[data-wishlist-target]');
    const targetRect = target?.getBoundingClientRect();
    const targetX = targetRect ? targetRect.left + targetRect.width / 2 : window.innerWidth - 72;
    const targetY = targetRect ? targetRect.top + targetRect.height / 2 : window.innerHeight - 138;
    const heart: FlyingHeart = {
      id,
      x: event.clientX,
      y: event.clientY,
      deltaX: targetX - event.clientX,
      deltaY: targetY - event.clientY,
    };
    this.flyingHearts.update(hearts => [...hearts, heart]);
    setTimeout(() => {
      this.flyingHearts.update(hearts => hearts.filter(item => item.id !== id));
    }, 900);
  }
}
