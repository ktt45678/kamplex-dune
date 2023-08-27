import { HlsSegmentGroup, M3U8Options, StreamManifest } from '../interfaces/video-player';

export function convertToM3U8(manifest: StreamManifest, baseUrl: string, options: M3U8Options) {
  let masterStr = `#EXTM3U\n#EXT-X-VERSION:${manifest.hlsVersion}\n`;
  let defaultAudioGroup = manifest.audioTracks[0]?.group || 'audio';

  function generatePlaylist(segmentGroup: HlsSegmentGroup, uri: string) {
    const fileUrl = baseUrl.replace(':path', uri);
    let playlistStr = `#EXTM3U\n#EXT-X-VERSION:${manifest.hlsVersion}\n#EXT-X-TARGETDURATION:${manifest.targetDuration}\n`;
    playlistStr += `#EXT-X-MEDIA-SEQUENCE:${manifest.mediaSequence}\n#EXT-X-PLAYLIST-TYPE:${manifest.playlistType}\n`;
    playlistStr += `#EXT-X-MAP:URI="${fileUrl}",BYTERANGE="${segmentGroup.byterange.length}@${segmentGroup.byterange.offset}"\n`;
    for (let j = 0; j < segmentGroup.segments.length; j++) {
      const segment = segmentGroup.segments[j];
      playlistStr += `#EXTINF:${segment.duration},\n`;
      playlistStr += `#EXT-X-BYTERANGE:${segment.byterange.length}@${segment.byterange.offset}\n`;
      playlistStr += `${fileUrl}\n`;
    }
    playlistStr += '#EXT-X-ENDLIST\n';
    const playlistUri = 'data:application/x-mpegurl;charset=UTF-8,' + encodeURIComponent(playlistStr);
    return playlistUri;
  }

  for (let i = 0; i < manifest.audioTracks.length; i++) {
    const track = manifest.audioTracks[i];
    if (!options.opus && track.name.toLowerCase().startsWith('opus')) // Do not add opus audio tracks
      continue;
    if (track.channels > 6)
      continue;
    const segmentGroup = track.hlsSegment;
    const playlistUri = generatePlaylist(segmentGroup, track.uri);
    const defaultAudio = track.default ? 'YES' : 'NO';
    const autoSelectAudio = track.autoselect ? 'YES' : 'NO';
    masterStr += `#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="${track.group}",NAME="${track.name} - ${track.codecID} - ${track.language}",`;
    masterStr += `DEFAULT=${defaultAudio},AUTOSELECT=${autoSelectAudio},LANGUAGE="${track.language}",CHANNELS="${track.channels}",`;
    masterStr += `URI="${playlistUri}"\n`;
  }
  for (let i = 0; i < manifest.videoTracks.length; i++) {
    const track = manifest.videoTracks[i];
    const segmentGroup = track.hlsSegment;
    const playlistUri = generatePlaylist(segmentGroup, track.uri);
    masterStr += `#EXT-X-STREAM-INF:BANDWIDTH=${track.bandwidth},`;
    masterStr += `RESOLUTION=${track.width}x${track.height},`;
    masterStr += `CODECS="${track.codec}",AUDIO="${defaultAudioGroup}"\n`;
    masterStr += playlistUri + '\n';
  }
  const masterUri = 'data:application/x-mpegurl;charset=UTF-8,' + encodeURIComponent(masterStr);
  //const manifestBlob = new Blob([masterStr], { type: 'application/x-mpegurl' });
  //const masterUri = URL.createObjectURL(manifestBlob);
  return masterUri;
}
