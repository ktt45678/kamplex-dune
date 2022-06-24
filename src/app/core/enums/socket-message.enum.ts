export enum SocketMessage {
  REFRESH_MEDIA = 'refresh-media',
  REFRESH_TV_EPISODE = 'refresh-tv-episode',
  REFRESH_MEDIA_VIDEOS = 'refresh-media-videos',
  REFRESH_MOVIE_SUBTITLES = 'refresh-movie-subtitles',
  REFRESH_TV_SUBTITLES = 'refresh-tv-subtitles',
  REFRESH_MOVIE_CHAPTERS = 'refresh-movie-chapters',
  REFRESH_TV_CHAPTERS = 'refresh-tv-chapters',
  SAVE_MOVIE_SOURCE = 'save-movie-source',
  DELETE_MOVIE_SOURCE = 'delete-movie-source',
  ADD_MOVIE_STREAM = 'add-movie-stream',
  SAVE_TV_SOURCE = 'save-tv-source',
  DELETE_TV_SOURCE = 'delete-tv-source',
  ADD_TV_STREAM = 'add-tv-stream',
  MEDIA_PROCESSING_SUCCESS = 'media-processing-success',
  MEDIA_PROCESSING_FAILURE = 'media-processing-failure'
}
