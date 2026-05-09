export interface PlaceIcon {
  prefix: string;
  suffix: string;
}

export interface PlaceCategory {
  fsq_category_id: string;
  name: string;
  short_name?: string;
  icon: PlaceIcon;
}

export interface PlacePhoto {
  prefix: string;
  suffix: string;
}

export interface PlaceTip {
  text: string;
}

export interface PlaceLocation {
  address?: string;
  city?: string;
  locality?: string;
  region?: string;
  country?: string;
  formatted_address?: string;
}

export interface PlaceSocialMedia {
  instagram?: string;
  twitter?: string;
}

export interface Place {
  fsq_place_id: string;
  name: string;
  location: PlaceLocation;
  categories: PlaceCategory[];
  rating?: number;
  photos?: PlacePhoto[];
  tips?: PlaceTip[];
  tel?: string;
  website?: string;
  distance?: number;
  social_media?: PlaceSocialMedia;
}

