import wrtc from 'wrtc';
import createFireRTC from "./fireRTC";

//mock
const firebase = {
  app: () => ({
      database: () => ({
        ref: () => ({
          on: () => {},
          set: () => {},
        }),
      }),
  }),
};

describe('fireRTC', async () => {
  it('should return the correct methods to operate with', () => {
    const fireRTC = createFireRTC({
      peerConfig: {
        wrtc,
      },
      firebase,
      id: '12345',
      initiator: true,
    });

    expect(fireRTC.send).toBeDefined();
    expect(Object.keys(fireRTC).length).toBe(1);
  });

  it('as initiator it should return the offer signal in callback', (done) => {
    const fireRTC = createFireRTC({
      peerConfig: {
        wrtc,
      },
      firebase,
      id: '12345',
      initiator: true,
      onSignal: (signal) => {
        expect(signal.type).toBe('offer');
        done();
      },
    });
  });
});
