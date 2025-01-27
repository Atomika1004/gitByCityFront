import {PointOfInterest} from './pointOfInterest';
import {Route} from './route';

export interface Attachment {
  id: string;
  image: string;
  pointOfInterest: PointOfInterest | null;
  comment: Comment | null;
  route: Route | null;
}
