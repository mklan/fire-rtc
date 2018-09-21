import Peer from 'simple-peer';

export default function createFireRTC({
                                        firebase, // firebase instance
                                        initiator, // whether you initiate the connection
                                        firebaseNameSpace, // optional firebase namespace
                                        peerConfig = {}, // further simple-peer configurations
                                        debug, // log debug outputs
                                        id, // peer id to identify the webRTC connection
                                        onError = () => {}, // error callback
                                        onConnect = () => {}, // callback when connected
                                        onData = () => {}, // callback when data was received
                                        onSignal = () => {} // callback when own signal is ready (from this point on you can join
                                      }) {

  let ownSignal;
  const p = new Peer({ ...peerConfig, initiator, trickle: false });

  p.on('error', function (err) { console.error('error', err) });

  p.on('signal', function (signal) {
    if (ownSignal) return;
    debug && console.log('SIGNAL', signal);
    ownSignal = signal;
    join();
    onSignal(signal);
  });

  p.on('connect', function () {
    debug && console.log('CONNECTED');
    firebase.app(firebaseNameSpace).database().ref(`sdp/${id}`).remove();
    onConnect(p);
  });

  p.on('data', function (data) {
    debug && console.log('data: ' + data);
    onData(data);
  });

  if(!initiator) listen();

  function listen() {
    const relevantType = initiator ? 'answer' : 'offer';
    const sdpRef = firebase.app(firebaseNameSpace).database().ref(`sdp/${id}`);
    sdpRef.on('value', s => {
      if(s.val() && s.val()[relevantType]) p.signal(s.val()[relevantType]);
    });
  }

  function join() {
    if(!ownSignal) throw new Error('join failed, due to missing signal');
    if(initiator) listen();
    firebase.app(firebaseNameSpace).database().ref(`sdp/${id}/${ownSignal.type}`).set(ownSignal);
  }

  function send(data) {
    try{
      p.send(data);
    } catch ( e) {
      onError(e);
    }
  }

  return {
    send
  };
}
