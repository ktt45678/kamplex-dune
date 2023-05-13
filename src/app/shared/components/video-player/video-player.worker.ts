/// <reference lib="webworker" />
import { convertToM3U8 } from '../../../core/utils/stream-manifest-helper';

addEventListener('message', ({ data }) => {
  let response = null;
  switch (data.type) {
    case 'manifest-to-m3u8': {
      response = convertToM3U8(data.manifest, data.baseUrl);
    }
  }
  postMessage(response);
});
