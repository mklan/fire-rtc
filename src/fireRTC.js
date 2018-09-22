import Peer from 'simple-peer';

const fireRTC = function createFireRTC({
  id, // peer id to identify the webRTC connection
  firebase, // firebase instance
  initiator, // whether you initiate the connection
  firebaseNameSpace, // optional firebase namespace
  peerConfig = {}, // further simple-peer configurations
  onConnect = () => {
  }, // callback when connected
  onData = () => {
  }, // callback when data was received
  onSignal = () => {
  }, // callback when own signal is ready (from this point on you can join
  onError = () => {
  }, // callback when error is thrown
}) {
  let ownSignal;

  const p = new Peer({ ...peerConfig, initiator, trickle: false });

  function listen() {
    const relevantType = initiator ? 'answer' : 'offer';
    const sdpRef = firebase.app(firebaseNameSpace).database().ref(`sdp/${id}`);
    sdpRef.on('value', (s) => {
      if (s.val() && s.val()[relevantType]) p.signal(s.val()[relevantType]);
    });
  }

  function join() {
    if (!ownSignal) throw new Error('join failed, due to missing signal');
    if (initiator) listen();
    firebase.app(firebaseNameSpace).database().ref(`sdp/${id}/${ownSignal.type}`).set(ownSignal);
  }

  p.on('error', onError);

  p.on('signal', (signal) => {
    if (ownSignal) return;
    ownSignal = signal;
    join();
    onSignal(signal);
  });

  p.on('connect', () => {
    firebase.app(firebaseNameSpace).database().ref(`sdp/${id}`).remove();
    onConnect(p);
  });

  p.on('data', (data) => {
    onData(data);
  });

  if (!initiator) listen();

  return {
    send: p.send,
  };
};

export default fireRTC;
