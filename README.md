# TradeSim — Complete Stage 1–9 Project

A single runnable React + Express + MongoDB trading simulator built from the nine learning stages.

## Requirements

- Node.js 20+
- MongoDB 7+/8+ locally, or Docker Desktop

## Setup

1. Install dependencies:

   npm install

2. Create the frontend env file:

   copy .env.example .env

3. Create `server/.env` from `server/.env.example` and set `JWT_SECRET`.

4. Start MongoDB. With Docker:

   docker compose up -d mongo

5. Start both client and server:

   npm run dev

Frontend: http://localhost:5173
Backend: http://localhost:5000/api/health

## Manual start

Client:

   npm run dev:client

Server:

   npm run dev:server

## Notes

- Prices are simulated in the browser and update every second.
- Portfolio, trades and accounts are stored in MongoDB.
- JWT is stored in localStorage for learning purposes. A production application should normally prefer secure HttpOnly cookies.
- Alerts and auto-sell rules are stored in browser localStorage per authenticated user.
