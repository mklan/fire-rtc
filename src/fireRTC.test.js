import wrtc from 'wrtc';
import createFireRTC from "./fireRTC";



//mock
let initiatorOnValueCallback;
let partnersOnValueCallback;

const initiatorFirebase = {
  app: () => ({
    database: () => ({
      ref: () => ({
        on: (key, callback) => {
          initiatorOnValueCallback = callback
        },
        set: () => {},
        remove: () => {}, // TODO gets called after connect
      }),
    }),
  }),
};

const partnersFirebase = {
  app: () => ({
    database: () => ({
      ref: () => ({
        on: (key, callback) => {
          partnersOnValueCallback = callback
        },
        set: () => {},
        remove: () => {},
      }),
    }),
  }),
};

describe('fireRTC', async () => {
  it('should returns the send method to operate with', () => {
    const fireRTC = createFireRTC({
      peerConfig: {
        wrtc,
      },
      firebase: initiatorFirebase,
      id: '12345',
      initiator: true,
    });

    expect(fireRTC.send).toBeDefined();
    expect(Object.keys(fireRTC).length).toBe(1);
  });

  it('as initiator it should return the offer signal in callback', (done) => {
    createFireRTC({
      peerConfig: {
        wrtc,
      },
      firebase: initiatorFirebase,
      id: '12345',
      initiator: true,
      onSignal: (signal) => {
        expect(signal.type).toBe('offer');
        done();
      },
    });
  });

  it('should trigger the connect callback when connected', (done) => {
    const mockOnConnect = jest.fn();

    createFireRTC({
      peerConfig: {
        wrtc,
      },
      firebase: initiatorFirebase,
      id: '12345',
      initiator: true,
      onConnect: mockOnConnect,
      onSignal: offer => {
        partnersOnValueCallback({
          val: () => ({ offer })
        })
      },
    });

    createFireRTC({
      peerConfig: {
        wrtc,
      },
      firebase: partnersFirebase,
      id: '12345',
      initiator: false,
      onConnect: () => {
        mockOnConnect();
        expect(mockOnConnect.mock.calls.length).toBe(2);
        done();
      },
      onSignal: (answer) => {
        initiatorOnValueCallback({
          val: () => ({ answer })
        })
      },
    });
  });

  it('initiator should receive message at onData callback when partner leverages send method', (done) => {

    const mockData = 'hello you';
    createFireRTC({
      peerConfig: {
        wrtc,
      },
      firebase: initiatorFirebase,
      id: '12345',
      initiator: true,
      onSignal: offer => {
        partnersOnValueCallback({
          val: () => ({ offer })
        })
      },
      onData: (data) => {
        expect(data).toBeDefined();
        done();
      },
    });

    const partnersFireRTC = createFireRTC({
      peerConfig: {
        wrtc,
      },
      firebase: partnersFirebase,
      id: '12345',
      initiator: false,
      onConnect: () => {
        partnersFireRTC.send(mockData);
      },

      onSignal: (answer) => {
        initiatorOnValueCallback({
          val: () => ({ answer })
        })
      },
    });
  });

  it('partner should receive message at onData callback when initiator leverages send method', (done) => {

    const mockData = 'hello you';
    const initiatorFireRTC =  createFireRTC({
      peerConfig: {
        wrtc,
      },
      firebase: initiatorFirebase,
      id: '12345',
      initiator: true,
      onSignal: offer => {
        partnersOnValueCallback({
          val: () => ({ offer })
        })
      },
    });

    createFireRTC({
      peerConfig: {
        wrtc,
      },
      firebase: partnersFirebase,
      id: '12345',
      initiator: false,
      onConnect: () => {
        initiatorFireRTC.send(mockData);
      },
      onData: (data) => {
        expect(data).toBeDefined();
        done();
      },
      onSignal: (answer) => {
        initiatorOnValueCallback({
          val: () => ({ answer })
        })
      },
    });
  });
});
