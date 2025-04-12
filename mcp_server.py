# mcp_server.py
import os
from fastapi import FastAPI
from fastapi_websocket_rpc import WebSocketRPCEndpoint
from livekit import api

app = FastAPI()
endpoint = WebSocketRPCEndpoint()

# Initialize LiveKit
livekit_host = os.getenv("LIVEKIT_HOST", "livekit.podplaystudio.web.app")
svc = api.LiveKitAPI(
    api_key=os.getenv("LIVEKIT_KEY"),
    api_secret=os.getenv("LIVEKIT_SECRET")
)

@app.websocket("/mcp")
async def websocket_rpc(websocket):
    await endpoint.main_loop(websocket)

# Add your MCP protocol handlers here
