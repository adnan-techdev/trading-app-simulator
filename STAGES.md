# TradeSim — Stage Map

## Stage 1 — Project, Pages and Routing
- Vite React app
- React Router
- Home, Login, Register, Market, Portfolio, Asset Details, Alerts, Leaderboard
- Shared app layout

## Stage 2 — Reusable Components
- Asset data array
- AssetCard
- PageHeader
- SummaryCard
- AppLayout
- Props and `.map()`

## Stage 3 — Interactive UI
- `useState`
- Search
- Market filters
- Watchlist
- Controlled inputs
- Buy/Sell panel UI

## Stage 4 — Portfolio State
- `useReducer`
- Portfolio Context
- BUY / SELL / RESET
- Cash, holdings, average price, trades
- Portfolio value and P&L

## Stage 5 — Browser Persistence
- `localStorage`
- Hydration
- Portfolio survives refresh

## Stage 6 — Live Market Simulation
- PriceFeed Context
- `setInterval`
- `useEffect` cleanup
- `useRef`
- Changing simulated prices

## Stage 7 — Automation
- Notification Context
- Price alerts
- Auto-sell rules
- Automatic notifications
- User-specific browser storage

## Stage 8 — MERN Backend
- Node.js
- Express
- Firebase Firestore
- Firebase Admin SDK
- REST API
- Portfolio synchronization
- Trade persistence
- Leaderboard

## Stage 9 — Authentication
- User model
- Password hashing with bcrypt
- JWT
- Auth Context
- Login/Register
- Protected React routes
- Protected backend routes
- User-specific portfolio/trades
- Logout

## Final flow

Register/Login -> JWT -> Protected React App -> Live Prices -> Buy/Sell -> Reducer -> Local Cache + API -> Firebase Firestore -> Leaderboard

Alerts and Auto-Sell watch the same live price feed and can trigger portfolio actions.
