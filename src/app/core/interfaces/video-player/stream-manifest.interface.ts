export interface StreamManifest {
  hlsVersion: number;
  videoTracks: HlsVideoTrack[];
  audioTracks: HlsAudioTrack[];
  totalDuration: number;
  targetDuration: number;
  mediaSequence: number;
  playlistType: string;
}

export interface HlsAudioTrack {
  name: string;
  group: string;
  default: boolean;
  autoselect: boolean;
  language: string;
  title?: string;
  format: string;
  channels: number;
  samplingRate: number;
  codec: string;
  codecID: number;
  bandwidth: number;
  duration: number;
  mimeType: string;
  hlsSegment: HlsSegmentGroup;
  dashSegment: DashSegmentGroup;
  uri: string;
}

export interface HlsVideoTrack {
  codec: string;
  codecID: number;
  width: number;
  height: number;
  par: string;
  sar: string;
  bandwidth: number;
  duration: number;
  format: string;
  language: string;
  mimeType: string;
  frameRate: number;
  hlsSegment: HlsSegmentGroup;
  dashSegment: DashSegmentGroup;
  uri: string;
}

export interface HlsSegmentGroup {
  targetDuration: number;
  byterange: HlsByterange;
  segments: HlsSegment[];
}

export interface HlsSegment {
  timeline: number;
  duration: number;
  byterange: HlsByterange;
}

export interface SegmentMap {
  uri: string;
  byterange: HlsByterange;
}

export interface HlsByterange {
  length: number;
  offset: number;
}

export interface Resolution {
  width: number;
  height: number;
}

export interface DashSegmentGroup {
  minBufferTime: number;
  mediaPresentationDuration: number;
  maxSubsegmentDuration: number;
  indexRange: DashByterange;
  initRange: DashByterange;
}

export interface DashByterange {
  start: number;
  end: number;
}
