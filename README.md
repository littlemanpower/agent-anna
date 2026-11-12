# Agent Anna

A single-page "command matrix" dashboard for an AI chat assistant swarm (agents AA01–AA08), with a live crypto ticker, an agent phonebook, a chat console with voice readout, and media/scrape tools.

Copied from https://agent-anna.github.io/agent-anna/agent-anna/index.html (original by the agent-anna GitHub account).

## How it works
- Everything (HTML, CSS, JavaScript) lives in `index.html`; there are no other files.
- Chat sends messages to the Dahl inference API (`https://inference.dahl.global/v1/chat/completions`, model `MiniMaxAI/MiniMax-M2.7`).
- Without a key, the chat shows a canned placeholder reply.
- The "Server Uplink" expects a local bridge at `http://localhost:8000` (change `BRIDGE_BASE` in the script to point elsewhere).

## Setup
Open `index.html` in a browser, click **KEYS**, and paste your own Dahl API key (and GitHub token if you want repo reports). Keys are saved only in your browser's localStorage. No keys or tokens are included in this repo.
