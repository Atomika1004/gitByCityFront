import {Credential} from './credential';

export interface Admin {
  id: number;
  fio: string;
  credential: Credential
}
