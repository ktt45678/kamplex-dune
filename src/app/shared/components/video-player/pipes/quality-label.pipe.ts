import { Pipe, PipeTransform } from '@angular/core';

import { VideoCodec } from '../../../../core/enums';

@Pipe({
  name: 'qualityLabel',
  standalone: true
})
export class QualityLabelPipe implements PipeTransform {

  transform(height: number, bitrate?: number | null, id?: string | null): string {
    let label = height + 'p';
    if (id) {
      const codec = id.split(' - ')[1];
      if (codec) {
        switch (+codec) {
          case VideoCodec.H265:
            label += ' ';
            label += 'H265';
            break;
          case VideoCodec.VP9:
            label += ' ';
            label += 'VP9';
            break;
          case VideoCodec.AV1:
            label += ' ';
            label += 'AV1';
            break;
          default:
            break;
        }
      }
    }
    if (bitrate) {
      const bitrateKbps = Math.round((bitrate || 0) / 1000);
      label += ' ';
      label += `(${bitrateKbps} Kbps)`;
    }
    return label;
  }

}
