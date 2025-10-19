Cybernauts Backend

This is the backend server for the Cybernauts project, built with Node.js, Express, TypeScript, and PostgreSQL.

Setup & Run Locally
1. Clone the repository
git clone https://github.com/ramansh18/cybernauts-backend.git
cd cybernauts-backend

2. Create .env file

Create a .env file in the root directory with the following environment variables:

PORT=5000
DATABASE_URL=postgres://username:password@host:port/dbname
FRONTEND_URL=http://localhost:5173


PORT → The port your server will run on (default 5000)

DATABASE_URL → PostgreSQL connection string

FRONTEND_URL → URL of the frontend for CORS

⚠️ For deployed frontend, replace FRONTEND_URL with the Vercel URL.

3. Install dependencies
npm install

4. Run the server in development
npm run dev


Starts server with hot-reloading (ts-node-dev)

Server should be running at http://localhost:5000

5. Build for production (optional)
npm run build
npm start


Compiles TypeScript to dist/

Starts the compiled JS server

6. Notes

Ensure your PostgreSQL database is running and accessible via DATABASE_URL.

CORS is configured to allow requests from the frontend specified in FRONTEND_URL.

Use npm test to run unit tests with Jest.
