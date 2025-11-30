import { HasAdminPipe } from './has-admin-pipe';

describe('HasAdminPipe', () => {
  it('create an instance', () => {
    const pipe = new HasAdminPipe();
    expect(pipe).toBeTruthy();
  });
});
