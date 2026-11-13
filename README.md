# Agent Anna

A single-page Cool Hot Sauce (Thailand) portal and chat dashboard for Agent Anna and her crew (AA01 Anna, AA02 Mr. Preach X, AA03 Martin Strayd), with a live crypto ticker, an agent phonebook, and a chat console with voice readout.

Copied from https://agent-anna.github.io/agent-anna/agent-anna/index.html (original by the agent-anna GitHub account).

## How it works
- All HTML, CSS and JavaScript live in `index.html`; images live in `assets/`.
- Chat goes through a Supabase Edge Function (`anna-chat`) that keeps the Dahl API key on the server and calls Dahl (model `deepseek-ai/DeepSeek-V4-Flash-0731`, falling back to `MiniMaxAI/MiniMax-M2.7` and `zai-org/GLM-5.3-Flash` when busy). The key is not in the page source or in localStorage.
- Without a key saved on the server, the chat says it is offline and asks for a key (no fake replies).
- Team notes spoken as "tell Martin/Preach/Anna …" are delivered through the same function.
- Visitors can leave Anna a saved message through a small form. That goes to a separate `anna-message` Edge Function and is stored in `anna_messages` (not readable from the browser). Those notes are meant to be surfaced in the existing Agent Anna team daily report - no new email service.
- An email-updates form is on the page (`#updates`). The matching `anna-subscribe` Edge Function and `anna_subscribers` table are in `supabase/` as files only - they are not deployed or applied yet. Until they go live, the form shows "Signups open soon" and does not pretend a signup succeeded.
- A Share on X button opens the visitor's own X compose window (intent link) with a prefilled line about Anna and Cool Hot Sauce. Nothing is posted by the site.

## Setup
Open the live page, click **KEYS**, paste your Dahl API key once, and click **SAVE KEYS**. The key is stored on the server, so you should not need to paste it again on this site. A GitHub token, if you want repo reports, is still saved only in your browser's localStorage. No secret keys or tokens are included in this repo.

## Changes from the original
- Removed the fake canned chat replies shown when no API key is set.
- Cool Hot Sauce red/black/gold Thailand theme: the real Cool Hot Sauce diamond logo (header + favicon), Kanit font, Thai kanok borders, photo hero and scenes, flavour cards (Black Smoked Red Jalapeno, Green Jalapeno, Red fermented) with "Buy on Lazada" links (URL decoded from the brand's own Lazada QR code).
- Agent roster is Anna, Mr. Preach X, and Martin Strayd.

## Assets and credits
- `assets/bottle-*.png`: Cool Hot Sauce product photos, cropped from images supplied by the brand owner (Mr. Preach X / CoolHotSauce). Brand assets; all rights reserved by the owner.
- `assets/coolhotsauce-logo.png` and `assets/coolhotsauce-favicon-*.png`: the real Cool Hot Sauce diamond logo, cropped from a brand image supplied by the owner (Mr. Preach X / CoolHotSauce). Brand asset; all rights reserved by the owner.
- Scenery photos from Wikimedia Commons, resized and compressed for the web (adaptations of the originals; the CC BY-SA image stays under CC BY-SA 4.0):
  - `assets/white-temple.jpg`: "Chiang Rai - Wat Rong Khun (2026) - img 11" by Chainwit., CC BY 4.0. https://commons.wikimedia.org/wiki/File:Chiang_Rai_-_Wat_Rong_Khun_%E0%B8%A7%E0%B8%B1%E0%B8%94%E0%B8%A3%E0%B9%88%E0%B8%AD%E0%B8%87%E0%B8%82%E0%B8%B8%E0%B9%88%E0%B8%99_(2026)_-_img_11.jpg (https://creativecommons.org/licenses/by/4.0)
  - `assets/tea-hills.jpg`: "Hills & tea farms of Chiang Rai" by cloud.shepherd, CC BY 2.0. https://commons.wikimedia.org/wiki/File:Hills_%26_tea_farms_of_Chiang_Rai_(18197802634).jpg (https://creativecommons.org/licenses/by/2.0)
  - `assets/golden-temple.jpg`: "Wat Rong Khun golden toilet building" by BrokenSphere, CC BY 3.0. https://commons.wikimedia.org/wiki/File:Wat_Rong_Khun_golden_toilet_building.JPG (https://creativecommons.org/licenses/by/3.0)
  - `assets/night-market.jpg`: "DZ6 1772 Twilight market bustle lanterns glow above a lively street..." by PattayaPatrol, CC BY-SA 4.0. https://commons.wikimedia.org/wiki/File:DZ6_1772_Twilight_market_bustle_lanterns_glow_above_a_lively_street_filled_with_food_stalls_shoppers_and_evening_chatter.jpg (https://creativecommons.org/licenses/by-sa/4.0)
- Agent portraits are Unsplash photos loaded from images.unsplash.com.

## TODO
- The owner also sent 4 of his own Thailand photos (White Temple, tea hills, golden temple, night market) that did not reach the build machine. Their copyright is unknown (likely third-party). Only swap them in for the Commons photos once he confirms he took them or has the rights.
- Better product cut-outs: the bottle images are cropped from a chat screenshot and are low resolution. Replace with original high-res product photos.
