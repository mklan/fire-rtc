import Peer from 'simple-peer';

// language=JavaScript
/**
 *
 * @param  {string} id - peer id to identify the webRTC connection.
 * @param {object} firebase - firebase instance
 * @param {boolean} initiator - whether you are initiating the connection
 * @param {string }firebaseNameSpace - optional namespace of your firebase app
 * @param {object} peerConfig - further simple-peer configurations
 * @param {function(p)} onConnect - callback when connected
 * @param {function(data)} onData - callback when data was received
 * @param {function(signal)} onSignal - callback when own signal was generated
 * @param {function(e)} onError - callback when error is thrown
 * @returns {{send: (function(*=): void)}}
 */
const createFireRTC = ({
  id,
  firebase,
  initiator,
  firebaseNameSpace,
  peerConfig = {},
  onConnect = () => {
  },
  onData = () => {
  },
  onSignal = () => {
  },
  onError = () => {
  },
}) => {
  let ownSignal;

  const p = new Peer({ ...peerConfig, initiator, trickle: false });

  function setSignal(signal) {
    firebase.app(firebaseNameSpace).database().ref(`sdp/${id}/${ownSignal.type}`).set(signal);
  }

  /**
   *  listens to other party's sdp
   */
  function listen() {
    const relevantType = initiator ? 'answer' : 'offer';
    const sdpRef = firebase.app(firebaseNameSpace).database().ref(`sdp/${id}`);
    sdpRef.on('value', (s) => {
      if (s.val() && s.val()[relevantType]) p.signal(s.val()[relevantType]);
    });
  }

  if (!initiator) listen();

  p.on('error', onError);

  p.on('signal', (signal) => {
    if (ownSignal) return; // prevents multiple execution, but needs a proper fix
    ownSignal = signal;
    setSignal();
    if (initiator) listen();
    onSignal(signal);
  });

  p.on('connect', () => {
    firebase.app(firebaseNameSpace).database().ref(`sdp/${id}`).remove();
    onConnect(p);
  });

  p.on('data', (data) => {
    onData(data);
  });

  return {
    send: data => p.send(data), // Why does `send: p.send` not work?
  };
};

export default createFireRTC;
