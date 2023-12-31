import { AudioCodec } from '../enums';
import { DashConverterOptions, HlsSegmentGroup, M3U8ConverterOptions, StreamManifest } from '../interfaces/video-player';

export type DashManifestData = { [key: string]: any };
export type ParsedDashManifest = DashManifestData & { protocol: 'DASH' };

export class StreamManifestHelper {
  convertToM3U8(manifest: StreamManifest, baseUrl: string, options: M3U8ConverterOptions) {
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

  convertToParsedDash(manifest: StreamManifest, baseUrl: string, options: DashConverterOptions) {
    const parsedManifest: ParsedDashManifest = { protocol: 'DASH' };
    const periodData: DashManifestData = {};
    const adaptationSetList: DashManifestData[] = [];

    for (let i = 0; i < manifest.audioTracks.length; i++) {
      const track = manifest.audioTracks[i];
      // AAC 6.1 and higher are not currently supported by browsers (chrome, firefox...)
      if (track.codecID === AudioCodec.AAC_SURROUND && track.channels >= 7)
        continue;
      const fileUrl = baseUrl.replace(':path', track.uri);
      const adaptationSet: DashManifestData = {};
      const representation: DashManifestData = {};
      const audioChannelConfiguration: DashManifestData = {
        '__children': [],
        'schemeIdUri': 'urn:mpeg:dash:23003:3:audio_channel_configuration:2011',
        'value': track.channels.toString()
      };
      const segmentBase: DashManifestData = {
        'Initialization': { '__children': [], 'range': `${track.dashSegment.initRange.start}-${track.dashSegment.initRange.end}` },
        'Initialization_asArray': [
          { '__children': [], 'range': `${track.dashSegment.initRange.start}-${track.dashSegment.initRange.end}` }
        ],
        '__children': [{
          'Initialization': { '__children': [], 'range': `${track.dashSegment.initRange.start}-${track.dashSegment.initRange.end}` }
        }],
        'indexRangeExact': 'true',
        'indexRange': `${track.dashSegment.indexRange.start}-${track.dashSegment.indexRange.end}`
      };

      representation['AudioChannelConfiguration'] = audioChannelConfiguration;
      representation['AudioChannelConfiguration_asArray'] = [audioChannelConfiguration];
      representation['BaseURL'] = fileUrl;
      representation['BaseURL_asArray'] = [fileUrl];
      representation['SegmentBase'] = segmentBase;
      representation['SegmentBase_asArray'] = [segmentBase];
      representation['__children'] = [
        { 'AudioChannelConfiguration': audioChannelConfiguration },
        { 'BaseURL': fileUrl },
        { 'SegmentBase': segmentBase },
      ];
      representation['id'] = `${track.name} - ${track.codecID} - ${track.language}`;
      representation['mimeType'] = track.mimeType;
      representation['codecs'] = track.codec;
      representation['audioSamplingRate'] = track.samplingRate;
      representation['bandwidth'] = track.bandwidth;
      representation['startWithSAP'] = 1;

      adaptationSet['Representation'] = representation;
      adaptationSet['Representation_asArray'] = [representation];
      adaptationSet['__children'] = [{ 'Representation': representation }];
      adaptationSet['segmentAlignment'] = 'true';
      adaptationSet['id'] = `${track.name} - ${track.codecID} - ${track.language}`;
      adaptationSet['lang'] = track.language;
      adaptationSet['startWithSAP'] = 1;
      adaptationSet['subsegmentAlignment'] = 'true';
      adaptationSet['subsegmentStartsWithSAP'] = 1;

      adaptationSetList.push(adaptationSet);
    }

    {
      const adaptationSet: DashManifestData = {};
      const representationList: DashManifestData[] = [];
      const adaptationSetChildrenList: DashManifestData[] = [];
      for (let i = 0; i < manifest.videoTracks.length; i++) {
        const track = manifest.videoTracks[i];
        const fileUrl = baseUrl.replace(':path', track.uri);
        const representation: DashManifestData = {};
        const segmentBase: DashManifestData = {
          'Initialization': { '__children': [], 'range': `${track.dashSegment.initRange.start}-${track.dashSegment.initRange.end}` },
          'Initialization_asArray': [
            { '__children': [], 'range': `${track.dashSegment.initRange.start}-${track.dashSegment.initRange.end}` }
          ],
          '__children': [{
            'Initialization': { '__children': [], 'range': `${track.dashSegment.initRange.start}-${track.dashSegment.initRange.end}` }
          }],
          'indexRangeExact': 'true',
          'indexRange': `${track.dashSegment.indexRange.start}-${track.dashSegment.indexRange.end}`
        };

        representation['BaseURL'] = fileUrl;
        representation['BaseURL_asArray'] = [fileUrl];
        representation['SegmentBase'] = segmentBase;
        representation['SegmentBase_asArray'] = [segmentBase];
        representation['__children'] = [
          { 'BaseURL': fileUrl },
          { 'SegmentBase': segmentBase },
        ];
        representation['id'] = track.height + 'p';
        representation['mimeType'] = track.mimeType;
        representation['codecs'] = track.codec;
        representation['width'] = track.width;
        representation['height'] = track.height;
        representation['sar'] = track.sar;
        representation['language'] = track.language;
        representation['frameRate'] = track.frameRate;
        representation['bandwidth'] = track.bandwidth;
        representation['startWithSAP'] = 1;

        representationList.push(representation);
        adaptationSetChildrenList.push({ 'Representation': representation });
      }

      adaptationSet['Representation'] = representationList;
      adaptationSet['Representation_asArray'] = representationList;
      adaptationSet['__children'] = adaptationSetChildrenList;
      adaptationSet['segmentAlignment'] = 'true';
      adaptationSet['minWidth'] = Math.min(...manifest.videoTracks.map(t => t.width));
      adaptationSet['minHeight'] = Math.min(...manifest.videoTracks.map(t => t.height));
      adaptationSet['maxWidth'] = Math.max(...manifest.videoTracks.map(t => t.width));
      adaptationSet['maxHeight'] = Math.max(...manifest.videoTracks.map(t => t.height));
      adaptationSet['maxFrameRate'] = Math.max(...manifest.videoTracks.map(t => t.frameRate));
      adaptationSet['par'] = manifest.videoTracks[0]?.par;
      adaptationSet['startWithSAP'] = 1;
      adaptationSet['subsegmentAlignment'] = 'true';
      adaptationSet['subsegmentStartsWithSAP'] = 1;
      adaptationSetList.push(adaptationSet);
    }

    periodData['AdaptationSet'] = adaptationSetList;
    periodData['AdaptationSet_asArray'] = adaptationSetList;
    periodData['__children'] = adaptationSetList.map(a => ({ 'AdaptationSet': a }));
    periodData['duration'] = manifest.totalDuration;

    parsedManifest['Period'] = periodData;
    parsedManifest['Period_asArray'] = [periodData];
    parsedManifest['__children'] = [{ 'Period': periodData }];

    parsedManifest['xmlns'] = 'urn:mpeg:dash:schema:mpd:2011';
    parsedManifest['minBufferTime'] = manifest.videoTracks[0]?.dashSegment.minBufferTime;
    parsedManifest['type'] = 'static';
    parsedManifest['mediaPresentationDuration'] = manifest.videoTracks[0]?.dashSegment.mediaPresentationDuration;
    parsedManifest['maxSubsegmentDuration'] = manifest.videoTracks[0]?.dashSegment.maxSubsegmentDuration;
    parsedManifest['profiles'] = 'urn:mpeg:dash:profile:isoff-on-demand:2011';
    parsedManifest['url'] = '';
    parsedManifest['originalUrl'] = '';
    parsedManifest['baseUri'] = baseUrl.replace(':path', '');
    parsedManifest['loadedTime'] = new Date();
    return parsedManifest;
  }
}

export const streamManifestHelper = new StreamManifestHelper();
