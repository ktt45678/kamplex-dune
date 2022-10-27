import { IsGrantedPipe } from './is-granted.pipe';

describe('IsGrantedPipe', () => {
  it('create an instance', () => {
    const pipe = new IsGrantedPipe();
    expect(pipe).toBeTruthy();
  });
});
