/// <reference lib="webworker" />
import { streamManifestHelper } from '../../../core/utils/stream-manifest-helper';

addEventListener('message', ({ data }) => {
  let response = null;
  const { id, request } = data;
  switch (request.type) {
    case 'manifest-to-m3u8': {
      response = streamManifestHelper.convertToM3U8(request.manifest, request.baseUrl, request.options);
      break;
    }
    case 'manifest-to-parsed-dash': {
      response = streamManifestHelper.convertToParsedDash(request.manifest, request.baseUrl, request.options);
      break;
    }
    case 'utf8-decode': {
      response = new TextDecoder().decode(request.source);
      break;
    }
  }
  postMessage({ id, response });
});
