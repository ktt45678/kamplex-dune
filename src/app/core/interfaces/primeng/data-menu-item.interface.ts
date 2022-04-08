import { MenuItem } from 'primeng/api';

export interface DataMenuItem<T> extends MenuItem {
  data?: T;
}
