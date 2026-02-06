# Server Rescue & Redeployment Plan

## Goal Description

Fix the deployment on `192.168.0.99` to ensure it is completely isolated from the developer's machine (`localhost`). We will perform a "Clean Slate" deployment: removing the existing server deployment, clearing containers, and ensuring the new build hardcodes the correct server IP for the frontend-backend connection.

## User Review Required
>
> [!WARNING]
> **Data Deletion**: This plan includes a step to **DELETE** the existing application folder and stop services on the server. Confirm this is acceptable.
> **Isolation**: The system will be configured to run strictly on `192.168.0.99`. It will NOT share data with your local machine.

## Proposed Changes

### 1. Server Cleanup (The "Purge")

We will execute commands on the server to:

- Stop running containers (`docker compose down`).
- Remove the project directory (`rm -rf /home/n8n/ConsejoRedaccion`).
- Prune Docker build cache to ensure we don't accidentally reuse a "localhost" baking.

### 2. Configuration Hardening

#### [MODIFY] [deploy.sh](file:///home/aagudelo/Test/ConsejoRedaccion/deploy.sh)

- Add a "Pre-flight" step to kill processes on the server.
- Ensure `NEXT_PUBLIC_API_URL` is explicitly set to `http://192.168.0.99:8002` during the build process.
- Force `docker compose build --no-cache` to prevent stale config.

### 3. Execution (Redeployment)

- Run the updated `deploy.sh`.
- Validate access from a *different* device (not your laptop) to ensure it works.

## Verification

- **Network Check**: Use `curl http://192.168.0.99:8002` from local terminal.
- **Frontend Check**: Open `http://192.168.0.99:3002` in a browser.
- **Independence Check**: Disconnect your laptop's backend server (localhost) and verify the server still works.
