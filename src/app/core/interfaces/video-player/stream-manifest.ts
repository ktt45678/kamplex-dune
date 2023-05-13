export interface StreamManifest {
  version: number;
  videoTracks: HlsVideoTrack[];
  audioTracks: HlsAudioTrack[];
  targetDuration: number;
  segmentDuration: number;
  mediaSequence: number;
  playlistType: string;
}

export interface HlsAudioTrack {
  name: string;
  group: string;
  default: boolean;
  autoselect: boolean;
  language: string;
  channels: number;
  samplingRate: number;
  codec: string;
  bandwidth: number;
  duration: number;
  mimeType: string;
  hlsSegment: HlsSegmentGroup;
  dashSegment: DashSegmentGroup;
  uri: string;
}

export interface HlsVideoTrack {
  codecs: string;
  width: number;
  height: number;
  bandwidth: number;
  duration: number;
  mimeType: string;
  frameRate: number;
  hlsSegment: HlsSegmentGroup;
  dashSegment: DashSegmentGroup;
  uri: string;
}

export interface HlsSegmentGroup {
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
