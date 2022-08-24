import { ExtMediaResult } from './ext-media-result.model';

export interface ExtMediaSuggestions {
  label: string;
  value: string;
  items: ExtMediaResult[];
}
