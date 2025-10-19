# Cybernauts Backend 🚀

This repository contains the backend source code for the Cybernauts project.

---

## 🛠️ Getting Started

Follow these instructions to get a local copy of the project up and running on your machine for development and testing purposes.

### Prerequisites

Make sure you have the following software installed on your system:
* [Node.js](https://nodejs.org/) (which includes npm)
* [Git](https://git-scm.com/)

---

## ⚙️ Setup and Installation

Follow these steps to set up the project environment.

### 1. Clone the Repository
Open your terminal and clone the repository to your local machine:

```bash
git clone <YOUR_REPOSITORY_URL_HERE>
(Remember to replace <YOUR_REPOSITORY_URL_HERE> with your actual Git URL)

2. Navigate to the Project Directory
Change your current directory to the newly cloned folder:

Bash

cd cybernauts-backend
3. Install Dependencies
Install all the required project dependencies using npm:

Bash

npm install
4. Create Environment File
You'll need to create a .env file to store your environment variables (like database credentials, API keys, etc.).

If you have a .env.example file, you can copy it:

Bash

cp .env.example .env
If not, just create a new file named .env in the root of the project.

5. Add Environment Variables
Open the .env file in your code editor and fill in the necessary values.

Example (.env):

Ini, TOML

# Server Configuration
PORT=8080

# Database Connection
DATABASE_URL="mongodb+srv://user:password@cluster.mongodb.net/your-db-name"

# Authentication
JWT_SECRET="your_super_strong_secret_key"
⚡ Running the Application
Once the installation is complete and your .env file is configured, you can start the development server:

Bash

npm run dev
The server should now be running and listening for requests (e.g., at http://localhost:8080).
