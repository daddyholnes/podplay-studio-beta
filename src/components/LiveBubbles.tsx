import React from 'react';
import { useParticipant, useRoom } from '@livekit/react-components';
import { Canvas, useFrame } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';

function ParticleBubble({ participant }) {
  const meshRef = React.useRef<THREE.Mesh>(null);
  const { audioTrack, videoTrack } = useParticipant(participant);

  const gltf = useGLTF('/quantum-bubble.glb') as any; // Using "any" to avoid complex type definitions for gltf
  const videoTexture = useTexture(videoTrack);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.5;
      meshRef.current.position.y = Math.sin(clock.getElapsedTime()) * 0.2;
    }
  });

  return (
    <Canvas>
      <primitive object={gltf.scene} dispose={null} />
      <mesh ref={meshRef} >
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial map={videoTexture} />
        <positionalAudio
          attach="sound"
          url={audioTrack}
          distanceModel="inverse"
          refDistance={1}
        />
      </mesh>
    </Canvas>
  );
};

useGLTF.preload('/quantum-bubble.glb')

export default function LiveBubbles() {
  const { participants } = useRoom();

  return (
    <div className="bubble-grid">
      {participants.map((p) => (
        <ParticleBubble key={p.sid} participant={p} />
      ))}
    </div>
  );
}
