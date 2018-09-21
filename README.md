# fire-rtc

serverless webRTC using firebase's realtime database as signaling broker

## Install

```bash
npm install --save fire-rtc firebase
```

## Demo

[fire-rtc-chat](https://github.com/mklan/fire-rtc-chat)

## Usage

All the steps below needs to be executed on both sides, but the `initiator` value is different!


initialize a firebase app

```JavaScript
import firebase from 'firebase';

firebase.initializeApp({
  apiKey: 'XXXXXXXXXXXXXXXXXXX', 
  databaseURL: 'XXXXXXXXXXXXXXXXX', 
  projectId: 'XXXXXXXXXXXXXXXXXX'
});
```

after that create a new fireRTC instance and pass the firebase instance

```JavaScript
import createFireRTC from 'fire-rtc';

const fireRTC = createFireRTC({
      firebase, // pass the firebase instance
      id: 'my first serverless webrtc connection', // choose randomly and share with other party
      initiator: true, // the other party needs to set this to false and join afterwards!
      onSignal: handleSignal, // gets called when the own sdp gets generated
      onConnect: handleConnect, // gets called when the connection is established
      onData: handleData, // gets called each time a new message arrives
    });

function handleSignal (signal) {
  // signal is generated so we can join
  fireRTC.join();
}

function handleConnect () {
  fireRTC.send('hello!')
}

function handleData(data) {
  console.log('new message', data);
}

```

## How does this work?

- When you call the `join` method, the library writes your sdp configuration into the database under the defined id.
- Your partner enters the same id but set initator to `false`. After `join()` his sdp is also written to the database.
- Both of you get notified of the others sdp config via a firebase event.
- After both parties have the other's sdp config, the webRTC connection can be established.
- The sdps are deleted because they are not needed anymore
