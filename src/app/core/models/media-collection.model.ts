import { Media } from './media.model';

export interface MediaCollection {
  _id: string;
  name: string;
  mediaCount: number;
  posterUrl?: string;
  thumbnailPosterUrl?: string;
  smallPosterUrl?: string;
  fullPosterUrl?: string;
  posterColor?: number;
  posterPlaceholder?: string;
  backdropUrl?: string;
  thumbnailBackdropUrl?: string;
  smallBackdropUrl?: string;
  fullBackdropUrl?: string;
  backdropColor?: number;
  backdropPlaceholder?: string;
  media?: Media[];
  createdAt: Date;
  updatedAt: Date;
  _translated?: boolean;
}
