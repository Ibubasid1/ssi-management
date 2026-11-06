# ssi-management
Browser app for event management for universities

## Dependencies
Node.js = 24.13.1 (or as written in .nvrmc) (npm follows node version)

PostgreSQL = 18.6

## How to Setup
copy the following commands one by one:
```bash
git clone https://github.com/ibubasid1/ssi-management.git
cd ssi-management
npm ci
psql -U postgres -c "CREATE DATABASE ssi_management;" #enter password when requested
cp server/.env.example server/.env #copies example env file. you MUST replace password placeholder with your password
npm run dev #this starts the server
```

Runs on http://localhost:5173
