export interface Route {
  id: number | null;
  name : string,
  clientId: number | null,
  description : string,
  images: string[];
  // comments: Comment[];
  likes: number[] | null,
  pointOfInterestRoutesDto: number[],
}

export interface Mapa {
  map: ymaps.Map;
}
