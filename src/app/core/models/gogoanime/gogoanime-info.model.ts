export interface GogoanimeInfo {
  id: string;
  title: string;
  url: string;
  genres: string[];
  totalEpisodes: number;
  image: string;
  releaseDate?: string;
  description?: string;
  subOrDub: 'sub' | 'dub';
  type?: string;
  status: 'Ongoing' | 'Completed' | 'Not yet aired' | 'Unknown';
  otherName?: string;
  episodes: GogoanimeEpisode[];
}

export interface GogoanimeEpisode {
  id: string;
  number: number;
  url: string;
}
