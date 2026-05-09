import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaceCardComponent } from './place-card.component';
import { Place } from '../../models/place.model';

const place: Place = {
  fsq_place_id: 'place-1',
  name: 'Test Place',
  location: {},
  categories: [],
};

describe('PlaceCardComponent', () => {
  let component: PlaceCardComponent;
  let fixture: ComponentFixture<PlaceCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaceCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PlaceCardComponent);
    fixture.componentRef.setInput('place', place);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
