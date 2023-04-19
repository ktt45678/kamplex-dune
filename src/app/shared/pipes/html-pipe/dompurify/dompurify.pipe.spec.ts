import { DompurifyPipe } from './dompurify.pipe';

describe('DompurifyPipe', () => {
  it('create an instance', () => {
    const pipe = new DompurifyPipe();
    expect(pipe).toBeTruthy();
  });
});
