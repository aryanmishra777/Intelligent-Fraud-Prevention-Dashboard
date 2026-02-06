
  # Intelligent Fraud Prevention Dashboard

  This is a code bundle for Intelligent Fraud Prevention Dashboard. The original project is available at https://www.figma.com/design/Z9CHfdINh2Fq6PC0LPyc4x/Intelligent-Fraud-Prevention-Dashboard.

  ## Running the code

  Run `npm i` to install the dependencies.

  ### Start the synthetic Risk API (backend)

  In one terminal:

  - `npm run server`

  This starts a minimal Node HTTP server on `http://localhost:5179` with:

  - `POST /api/risk/score`
  - `POST /api/credit/recommend`
  - `POST /api/review/override`

  ### Start the frontend

  In another terminal:

  - `npm run dev`

  The Vite dev server proxies `/api/*` requests to `http://localhost:5179`.
  