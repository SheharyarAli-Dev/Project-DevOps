# Project 2025 — Dockerized Node.js Vault Application

## Overview
This project is a Node.js-based application with full CRUD operations, backed by MongoDB. 
It was developed as part of a Software Construction and Development (SCD) course to demonstrate 
real-world deployment challenges, containerization with Docker, and workflow automation using Docker Compose.

## Features
- 🔍 **Search Records** — Case-insensitive search by name or ID
- 🔃 **Sort Records** — Sort by name or creation date (ascending/descending)
- 📤 **Export Data** — Export all records to a formatted `.txt` file with header metadata
- 💾 **Automatic Backup** — Auto-generates timestamped JSON backups on every add/delete
- 📊 **Vault Statistics** — Displays total records, longest name, earliest/latest dates, and last modified time
- 🍃 **MongoDB Integration** — Replaced in-memory database with persistent MongoDB
- 🔐 **Environment Variables** — Sensitive config managed via `.env` file

## Tech Stack
- Node.js
- MongoDB
- Docker & Docker Compose
- Git (feature branch workflow)

## Project Structure
- `backend/` — Node.js application source
- `backups/` — Auto-generated backup files
- `Dockerfile` — Backend container definition
- `docker-compose.yml` — Multi-service orchestration (backend + MongoDB)
- `.env` — Environment configuration (not committed)

## Getting Started
\```bash
git clone <repo-url>
cd <repo>
docker-compose up --build
\```

