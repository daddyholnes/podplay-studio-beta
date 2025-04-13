# mcp_server.py
import os
import asyncio
import os
import firebase_admin
from firebase_admin import credentials, firestore
from fastapi import FastAPI
from fastapi_websocket_rpc import WebSocketRPCEnd
from livekit import api as livekit_api, rtc # Renamed to avoid conflict
from livekit.rtc import AudioFrame # Explicit import for type hint

# Pipecat imports
from pipecat.frames.frames import TextFrame, AudioFrame as PipecatAudioFrame # Pipecat also has AudioFrame
from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.runner import PipelineRunner
from pipecat.pipeline.task import PipelineTask
from pipecat.services.openai import OpenAILLMService, WhisperSTTService
from pipecat.services.cartesia import CartesiaTTSService
from pipecat.transports.livekit import LiveKitTransport # Using community transport

app = FastAPI()
endpoint = WebSocketRPCEndpoint()

# Initialize Firebase Admin (assuming service account file path is set)
# IMPORTANT: Replace "path/to/service-account.json" with the actual path
cred_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH", "path/to/service-account.json")
if os.path.exists(cred_path):
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)
    db = firestore.client()
else:
    print(f"Warning: Firebase credentials not found at {cred_path}. Firestore integration will be disabled.")
    db = None

# Initialize LiveKit API (for room management, etc., if still needed separately)
livekit_host = os.getenv("LIVEKIT_HOST", "wss://your-livekit-server") # Use WSS URL
livekit_api_key = os.getenv("LIVEKIT_API_KEY")
livekit_api_secret = os.getenv("LIVEKIT_API_SECRET")

# --- Pipecat Setup ---

# Custom Transport with Firebase Integration
class FirebaseLiveKitTransport(LiveKitTransport):
    def __init__(self, room_url: str, token: str, bot_identity: str, user_id: str, **kwargs):
        super().__init__(room_url=room_url, token=token, bot_identity=bot_identity, **kwargs)
        self.user_id = user_id # Store user ID for Firestore

    async def _on_audio_frame(self, frame: rtc.AudioFrame): # Use livekit.rtc.AudioFrame
        # Original processing
        await super()._on_audio_frame(frame)

        # Send to Firestore for persistence (if db is initialized)
        if db and self.user_id:
            try:
                # Convert frame data if necessary (assuming it's bytes)
                audio_data = frame.data.tobytes() if hasattr(frame.data, 'tobytes') else frame.data
                doc_ref = db.collection("conversations").document(self.user_id)
                await doc_ref.set({
                    "audio_frames": firestore.ArrayUnion([audio_data])
                }, merge=True)
            except Exception as e:
                print(f"Error saving audio frame to Firestore: {e}")

        # TODO: Process through Gemini 2.0 multimodal (if needed)
        # response = await gemini_multimodal.process(frame)
        # await self._send_response(response)

# Pipecat Services (using examples, replace with Gemini/Claude if needed)
stt = WhisperSTTService(api_key=os.getenv("OPENAI_API_KEY"))
llm = OpenAILLMService(api_key=os.getenv("OPENAI_API_KEY"), model="gpt-4") # Example uses GPT-4
tts = CartesiaTTSService(api_key=os.getenv("CARTESIA_API_KEY"), voice_id="CHARON") # Example uses Cartesia

# Define the main Pipecat pipeline
pipeline = Pipeline([stt, llm, tts]) # Transport added dynamically in main

# --- FastAPI Setup (Existing) ---
@app.websocket("/mcp")
async def websocket_rpc(websocket):
    # This endpoint handles general MCP commands via RPC
    await endpoint.main_loop(websocket)

# --- Pipecat Runner (Example Structure) ---
# This needs to be integrated with FastAPI lifecycle, e.g., triggered by an RPC call
async def run_pipecat_for_user(room_url: str, token: str, user_id: str):
    transport = FirebaseLiveKitTransport(
        room_url=room_url,
        token=token,
        bot_identity="AI-Assistant",
        user_id=user_id
        # Add api_key and api_secret if needed by the community transport
        # api_key=livekit_api_key,
        # api_secret=livekit_api_secret,
    )

    # Add transport output to the pipeline for this specific task
    task_pipeline = Pipeline(pipeline.stages + [transport.output()])

    runner = PipelineRunner()
    task = PipelineTask(task_pipeline)

    @transport.event_handler("on_first_participant_joined")
    async def on_first_participant_joined(transport_instance, participant):
        participant_name = participant.get("info", {}).get("userName", "there")
        await task.queue_frame(TextFrame(f"Hello {participant_name}! How can I help you today?"))

    @transport.event_handler("on_participant_left")
    async def on_participant_left(transport_instance, participant, reason):
        print(f"Participant left: {participant.get('identity')}, reason: {reason}")
        await task.cancel()

    print(f"Starting Pipecat task for user {user_id} in room {room_url}")
    await runner.run(task)
    print(f"Pipecat task finished for user {user_id}")

# Example RPC method to start Pipecat (add to endpoint)
@endpoint.method()
async def start_voice_session(room_url: str, token: str, user_id: str):
    # Run Pipecat in the background
    asyncio.create_task(run_pipecat_for_user(room_url, token, user_id))
    return {"status": "Pipecat session starting"}

# Add your other MCP protocol handlers/RPC methods to the endpoint here
# endpoint.add_method(...)

# Note: Running the FastAPI app (e.g., with uvicorn) will start the server.
# The Pipecat task runs separately when start_voice_session is called.
