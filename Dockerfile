FROM python:3.9-slim
RUN pip install fastapi uvicorn[standard] python-socketio livekit-api
COPY . .
CMD ["uvicorn", "mcp_server:app", "--host", "0.0.0.0", "--port", "8080"]
