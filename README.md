# Agent Anna

A single-page "command matrix" dashboard for an AI chat assistant swarm (agents AA01–AA08), with a live crypto ticker, an agent phonebook, a chat console with voice readout, and media/scrape tools.

Copied from https://agent-anna.github.io/agent-anna/agent-anna/index.html (original by the agent-anna GitHub account).

## How it works
- Everything (HTML, CSS, JavaScript) lives in `index.html`; there are no other files.
- Chat sends messages to the Dahl inference API (`https://inference.dahl.global/v1/chat/completions`, model `MiniMaxAI/MiniMax-M2.7`).
- Without a key, the chat says it is offline and asks for a key (no fake replies).
- The "Server Uplink" (and Google Scrape) talk to a bridge URL you set in **KEYS**. It must be **https://** when the page is served over https (e.g. GitHub Pages), because browsers block https pages from calling plain `http://localhost`. The bridge must also allow CORS from the page's origin. A Cloudflare Tunnel or similar can expose a local bridge over https.

## Setup
Open `index.html` in a browser, click **KEYS**, and paste your own Dahl API key, a GitHub token if you want repo reports, and your https bridge URL if you run one. Click **SECURE CREDENTIALS**. Keys, token and bridge URL are saved only in your browser's localStorage. No keys or tokens are included in this repo.

## Changes from the original
- Server Uplink address is configurable in KEYS instead of hard-coded to `http://localhost:8000`, with https enforcement and clear errors.
- Removed the fake canned chat and press-release replies shown when no API key is set.
- Repo report no longer claims the bridge is "verified".
