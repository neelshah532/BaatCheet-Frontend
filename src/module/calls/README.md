# WebRTC Calling Feature

This module implements video and voice calling functionality using WebRTC technology. It supports both 1-on-1 and group calls (up to 6 people).

## Components

- **CallButton**: Initiates audio or video calls with a contact
- **IncomingCallDialog**: Shows a dialog when there's an incoming call, with options to accept or reject
- **CallInterface**: Main interface for ongoing calls, showing video feeds and call controls
- **VideoView**: Displays a participant's video stream
- **CallControls**: Buttons for muting audio, toggling video, and ending calls

## State Management

Call state is managed through Zustand store with the following features:

- Audio and video streams handling
- Participant management
- Call initialization and joining
- Media toggles

## WebRTC Service

The WebRTC service (src/services/webrtc.ts) handles the underlying peer connections:

- Uses simple-peer library for WebRTC connections
- Manages peer signaling through the Socket.IO connection
- Handles media stream sharing
- Manages peer connection lifecycle

## Events

The calling feature listens for the following Socket.IO events:

- 'incoming-call' - when someone calls the user
- 'call-started' - when a call is initiated
- 'call-joined' - when someone joins a call
- 'call-ended' - when a call ends
- 'call-rejected' - when a call is rejected
- 'call-error' - when an error occurs
- 'user-joined-call' - when a new user joins
- 'user-left-call' - when a user leaves
- 'user-disconnected' - when a user disconnects
- WebRTC signaling events: 'webrtc-offer', 'webrtc-answer', 'webrtc-ice-candidate'
- 'user-media-toggle' - when a user toggles their audio/video

## How It Works

1. A user clicks the call button next to a contact
2. That initiates a WebRTC connection and sends a signal to the backend
3. The recipient gets an incoming call notification
4. When accepted, both users establish a peer-to-peer connection
5. For group calls, each participant establishes connections with every other participant
6. Users can toggle their audio/video during the call
7. When a call ends, all resources are properly cleaned up
