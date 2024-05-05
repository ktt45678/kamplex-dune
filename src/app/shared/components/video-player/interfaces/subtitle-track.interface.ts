export interface KPSubtitleTrack {
  _id: string;
  src: string;
  content?: string;
  label: string;
  lang: string;
  mimeType: string;
  type: 'vtt' | 'srt' | 'ass' | 'ssa';
}
