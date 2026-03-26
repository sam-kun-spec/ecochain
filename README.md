# EcoChain — Smart Waste Management Demo

Full-stack single-page demo platform for smart waste pickups and reward points.

- Frontend: React + Vite + Tailwind (port **5173**)
- Backend: Node.js + Express (port **3001**)
- No auth, no database, no external APIs — all data is in-memory.

## Run locally

### 1) Backend (Express)

```bash
cd ecochain/backend
npm install
npm run dev
```

Backend will run at `http://localhost:3001`.

### 2) Frontend (Vite)

Open a second terminal:

```bash
cd ecochain/frontend
npm install
npm run dev
```

Frontend will run at `http://localhost:5173`.

## Demo flow

1. Open `http://localhost:5173/` (Rahul - Citizen) and schedule a pickup (e.g., **2kg Plastic**)
2. Switch to **Collector** (or open `/collector`) and **Accept**, then **Mark Collected**
3. Switch to **Recycling Center** (or open `/recycling`) and **Process**
4. Switch back to **Household** to see updated status counts and points

