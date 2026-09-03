# IPS Mobile (React Native / Expo)

Mobile version of the IPS (Indian Procurement System) app — talks to the same
`ips-backend` you already have running.

## Setup

```bash
npm install
```

### Point it at your backend

Open `src/api/client.js` and set `API_BASE` to your machine's LAN IP
(not `localhost` — that only works if you're testing in a web browser
or iOS simulator on the same machine):

```js
const API_BASE = 'http://192.168.1.5:5000/api'  // <-- your computer's IP
```

Find your IP with `ipconfig` (Windows) or `ifconfig`/`ip addr` (Mac/Linux).
Make sure your phone and computer are on the same Wi-Fi network, and that
`ips-backend`'s `.env` has `CLIENT_ORIGIN` set permissively enough (or `*`)
since mobile requests won't come from `localhost:5173`.

### Run

```bash
npx expo start
```

Scan the QR code with the **Expo Go** app (Android/iOS) to run it on your
phone, or press `a` / `i` for an emulator/simulator.

## Structure

```
App.js                          Navigation root + auth gate
src/
├── api/client.js                Same API contract as the web app, using AsyncStorage for the token
├── context/
│   ├── AuthContext.js
│   └── HistoryContext.js
├── screens/
│   ├── LoginScreen.js           Sign in / sign up
│   ├── ConversationListScreen.js  Home screen — list of past searches (long-press to delete)
│   └── ChatScreen.js            New search or continuing a conversation
└── theme/colors.js              Same palette as the web app's light theme
```

## Notes

- Mirrors the web app's functionality: login/signup, chat-style search,
  follow-up messages, conversation history, delete (long-press a
  conversation in the list).
- Uses the same backend endpoints — no backend changes needed.
- Theme matches the web app's light/paper palette. Dark mode isn't wired up
  yet on mobile (device theme detection can be added later).
