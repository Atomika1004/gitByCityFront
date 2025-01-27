export interface PointOfInterest {
  id: number | null;
  name: string;
  description: string;
  clientId: number | null;
  images: string[];
  latitude: number; //широта
  longitude: number; //долгота
  likes: number[] | null;
}


