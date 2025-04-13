// src/components/LiveVoiceInterface.tsx
import React, { useEffect, useState, useRef } from 'react'; // Added React and useRef
import {
  LiveKitRoom,
  VideoConference, // This seems unused in the provided code snippet, consider removing if not needed
  useParticipant,
  useTracks,
  RoomAudioRenderer, // Added import
  ParticipantTile, // Added import
  ControlBar // Assuming EnhancedControlBar is a custom component or ControlBar from @livekit/components-react
} from '@livekit/components-react';
import { Room, Track, AudioFrame, LocalParticipant, RemoteParticipant } from 'livekit-client'; // Added AudioFrame, LocalParticipant, RemoteParticipant
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase-config'; // Assuming db is exported from here
import { geminiMultimodal } from '../lib/vertex-ai'; // Assuming geminiMultimodal is exported from here
import { getAuthToken } from '../utils/auth'; // Assuming getAuthToken is exported from here

interface LiveVoiceProps {
  userId: string;
  roomName: string;
}

// Helper function to generate tokens via Firebase (assuming it exists)
async function fetchFirebaseFunctionToken(userId: string, roomName: string): Promise<string> {
  // Ensure getAuthToken is awaited if it's async
  const authToken = await getAuthToken();
  const response = await fetch('/api/generate-livekit-token', { // Consider making the path configurable or relative
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}` // Use the fetched token
    },
    body: JSON.stringify({ userId, roomName })
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch LiveKit token: ${response.statusText}`);
  }
  const data = await response.json();
  return data.token;
}


export default function LiveVoiceInterface({ userId, roomName }: LiveVoiceProps) {
  const [token, setToken] = useState<string>('');
  // Use useRef for the Room object to ensure stability across renders
  const roomRef = useRef<Room | null>(null);
  if (!roomRef.current) {
      roomRef.current = new Room({
          adaptiveStream: true,
          dynacast: true,
          maxRetries: 3
      });
  }
  const room = roomRef.current;


  // Generate LiveKit token through Firebase Function
  useEffect(() => {
    const generateToken = async () => {
      try {
        const fetchedToken = await fetchFirebaseFunctionToken(userId, roomName);
        setToken(fetchedToken);
      } catch (error) {
        console.error("Error generating LiveKit token:", error);
        // Handle token generation error (e.g., show message to user)
      }
    };
    if (userId && roomName) { // Only fetch if userId and roomName are available
        generateToken();
    }
  }, [userId, roomName]);

  // Firebase conversation persistence
  const saveConversationChunk = async (data: {
    text: string;
    audio?: ArrayBuffer; // Make audio optional as per original feedback
    timestamp: number;
  }) => {
    if (!userId) return; // Ensure userId is available
    try {
        await updateDoc(doc(db, 'conversations', userId), {
          chunks: arrayUnion(data)
        });
    } catch (error) {
        console.error("Error saving conversation chunk:", error);
    }
  };

  // Handle real-time interruptions
  const handleInterruption = async (participantId: string) => {
    try {
        await geminiMultimodal.cancelCurrentResponse();
        console.log(`Interruption detected from ${participantId}`);
    } catch (error) {
        console.error("Error handling interruption:", error);
    }
  };

  // Process audio frames with Gemini 2.0
  const processAudioFrame = async (frame: AudioFrame, participant?: RemoteParticipant) => { // participant might be available
    try {
      // Convert audio to text using Gemini's multimodal API
      // Assuming frame.data is ArrayBuffer or similar
      const audioData = frame.data;
      const textResponse = await geminiMultimodal.processAudio(audioData);

      // Save to Firestore
      await saveConversationChunk({
        text: textResponse,
        audio: audioData, // Save the audio data
        timestamp: Date.now()
      });

      // Generate AI response (only process local participant's audio for response generation?)
      // This logic might need refinement based on desired interaction flow
      if (participant?.identity !== room.localParticipant.identity) { // Example: Don't respond to self
          const aiResponse = await geminiMultimodal.generateResponse(textResponse);

          // Convert text to speech and send back
          const audioResponse = await geminiMultimodal.textToSpeech(aiResponse);
          // How to publish this back? Needs a mechanism, e.g., publishing a new track
          // or sending via data channel if Pipecat/server handles TTS playback
          console.log("AI TTS response ready to be sent (implementation needed)");
          // Example: room.localParticipant.publishTrack(audioResponse); // This assumes audioResponse is a valid Track
      }

    } catch (error) {
      console.error('Audio processing error:', error);
    }
  };


  // Conditional rendering based on token availability
  if (!token) {
    return <div>Loading voice interface...</div>; // Or some loading indicator
  }

  return (
    <LiveKitRoom
      room={room}
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL || 'wss://your-livekit-server-url'} // Provide a default or ensure env var is set
      connect={true} // Explicitly enable connection
      audio={true} // Enable audio
      video={false} // Disable video unless needed
      onConnected={async () => {
        console.log("Connected to LiveKit room");
        // Setup listener after connection
        room.on(RoomEvent.AudioFrameReceived, processAudioFrame); // Use RoomEvent enum
        // Enable microphone after connecting
        await room.localParticipant.setMicrophoneEnabled(true);
      }}
      onDisconnected={() => {
          console.log("Disconnected from LiveKit room");
          // Clean up listeners
          room.off(RoomEvent.AudioFrameReceived, processAudioFrame);
      }}
      options={{ // These options are often set in the Room constructor or connect call
        autoSubscribe: true,
        // publishDefaults: { // These are usually set when publishing tracks
        //   screenShareEncoding: 'h264_1080p_30fps_3_3_high'
        // }
      }}
    >
      <div className="voice-interface-container">
        <ParticipantGrid
          userId={userId} // Pass userId if needed inside ParticipantGrid
          onInterruption={handleInterruption}
          // saveConversation={saveConversationChunk} // processAudioFrame handles saving now
          room={room} // Pass room object
        />
        <RoomAudioRenderer />
        {/* Replace EnhancedControlBar with ControlBar or your custom component */}
        <ControlBar />
      </div>
    </LiveKitRoom>
  );
}

// Define ParticipantGrid props including room
interface ParticipantGridProps {
    userId: string;
    onInterruption: (participantId: string) => void;
    room: Room; // Pass the Room object
}

function ParticipantGrid({
  userId, // Keep if needed for specific logic
  onInterruption,
  room // Receive room object
}: ParticipantGridProps) {
  // Get all participant tracks (audio and video if needed)
  const tracks = useTracks([Track.Source.Microphone, Track.Source.Camera]);

  // Filter out local participant's tracks if needed, or handle differently
  const remoteTracks = tracks.filter(trackRef => !trackRef.participant.isLocal);

  return (
    <div className="participant-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', padding: '10px' }}> {/* Basic styling */}
      {/* Optionally render local participant tile separately */}
      {/* <ParticipantTile participant={room.localParticipant} /> */}

      {remoteTracks.map((trackRef) => (
        <ParticipantTile
          key={trackRef.participant.identity}
          participant={trackRef.participant}
          onSpeakingChanged={(speaking) => { // Correct prop name is onSpeakingChanged
            if (speaking) onInterruption(trackRef.participant.identity);
          }}
          // connectionQuality={connectionQuality} // connectionQuality needs to be obtained per participant
        />
      ))}
    </div>
  );
}

// --- Fallback Implementation Placeholder ---
// const [useLiveKit, setUseLiveKit] = useState(true);
// useEffect(() => {
//   const checkConnection = async () => {
//     // This logic needs refinement - checking isConnected immediately might not be reliable
//     // Consider listening to connection state changes
//     if (!room.state === 'connected') { // Check room state
//       const timer = setTimeout(() => {
//         if (room.state !== 'connected') { // Double check after timeout
//             console.log("LiveKit connection failed, attempting fallback...");
//             setUseLiveKit(false);
//             initializeDailyTransport();
//         }
//       }, 5000);
//       return () => clearTimeout(timer); // Cleanup timeout
//     }
//   };
//   // Trigger check after attempting connection (e.g., after token is set)
//   if (token) {
//       checkConnection();
//   }
// }, [room, token]); // Depend on room and token

// const initializeDailyTransport = async () => {
//   console.log("Initializing Daily.co transport (implementation needed)");
//   // Implement Daily.co fallback logic here
// };

// --- RoomEvent Enum (Example - Import from livekit-client) ---
enum RoomEvent {
    AudioFrameReceived = 'audioFrameReceived',
    Connected = 'connected',
    Disconnected = 'disconnected',
    ConnectionQualityChanged = 'connectionQualityChanged',
    // Add other events as needed
}
