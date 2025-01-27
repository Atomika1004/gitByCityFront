import {Route} from './route';

export interface Client {
  id: string;
  fio: string;
  createdRoutes: Route[]
  estimatedRoutes: Route[]
  credential: Credential;
}
