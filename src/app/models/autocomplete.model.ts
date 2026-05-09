export interface AutocompleteSuggestion {
  type: 'place' | 'search' | 'geo';
  text: {
    primary: string;
    secondary: string;
  };
  place?: {
    fsq_place_id: string;
    name: string;
  };
  geo?: {
    name: string;
    center: {
      latitude: number;
      longitude: number;
    };
  };
}
