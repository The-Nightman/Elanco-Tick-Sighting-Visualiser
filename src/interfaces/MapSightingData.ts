export interface MapSightingData {
  cityName: string;
  nation: string;
  value: number;
  lat: number;
  lon: number;
  species: { speciesName: string; count: number; colour: string }[];
}
