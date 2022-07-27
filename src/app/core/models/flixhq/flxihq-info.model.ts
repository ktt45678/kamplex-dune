export interface FlixHQInfo {
  id: string;
  title: string;
  url: string;
  image: string;
  description: string;
  type: 'Movie' | 'TV Series';
  releaseDate?: string;
  genres: string[];
  casts?: string[];
  tags?: string[];
  production?: string;
  duration?: string;
  rating: number;
  episodes: FlixHQEpisode[];
}

export interface FlixHQEpisode {
  id: string;
  title: string;
  number?: number;
  season?: number;
  url: string;
}
