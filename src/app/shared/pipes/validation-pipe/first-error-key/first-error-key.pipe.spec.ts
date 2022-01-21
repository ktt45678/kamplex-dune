import { FirstErrorKeyPipe } from './first-error-key.pipe';

describe('FirstErrorKeyPipe', () => {
  it('create an instance', () => {
    const pipe = new FirstErrorKeyPipe();
    expect(pipe).toBeTruthy();
  });
});
