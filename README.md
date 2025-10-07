# Synthetic Data Marketplace

A web application for exploring, comparing, and evaluating synthetic data tools and technologies. This marketplace provides an overview of both open-source and proprietary synthetic data solutions, complete with features, pricing, and side-by-side comparisons.

## Features

- **Catalog**: Browse open-source and proprietary synthetic data tools
- **Real-time GitHub Metrics**: Automatically fetches star counts and fork data for open-source projects
- **Smart Search**: Filter tools by name, description, or use case
- **Tab Navigation**: Separate views for open-source and proprietary tools
- **Side-by-Side Comparison**: Compare up to 3 tools simultaneously across all attributes
- **Detailed Information**: Access documentation, download links, pricing, and detailed descriptions
- **Responsive Design**: Modern Material-UI interface that works on desktop and mobile

## Tech Stack

- **Frontend**: React 18, Material-UI (MUI), DataGrid
- **Backend**: Flask (Python 3.11), GitHub API integration
- **Web Server**: Nginx (reverse proxy)
- **Containerization**: Docker & Docker Compose

## Prerequisites

Before you begin, ensure you have the following installed:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (version 20.10 or higher)
- Docker Compose (included with Docker Desktop)
- Git

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/ch4444rlie/sd-marketplace-app.git
cd sd-marketplace-app
```

### 2. Start the Application

```bash
docker-compose up --build
```

This single command will:
- Build the React frontend
- Build the Flask backend
- Scrape GitHub for popularity metrics
- Start Nginx web server
- Launch the application

### 3. Access the Application

Open your web browser and navigate to:
```
http://localhost
```

The application will be running and ready to use!

### 4. Stop the Application

Press `Ctrl+C` in the terminal, or run:
```bash
docker-compose down
```

## Project Structure

```
sd-marketplace-app/
├── docker-compose.yml          # Orchestrates all services
├── nginx.conf                  # Nginx reverse proxy configuration
├── backend/
│   ├── Dockerfile             # Backend container configuration
│   ├── app.py                 # Flask API server
│   ├── requirements.txt       # Python dependencies
│   └── data/
│       ├── tools.json         # Tool catalog data
│       └── cache.json         # Generated popularity cache
└── frontend/
    ├── Dockerfile             # Frontend container configuration
    ├── package.json           # Node dependencies
    ├── public/
    │   ├── index.html
    │   └── logos/             # Tool logos
    └── src/
        ├── App.js             # Main React component
        ├── index.js
        └── index.css
```

## How It Works

### Architecture

1. **Frontend (React)**: User interface served by Nginx on port 80
2. **Backend (Flask)**: REST API running on port 5000
3. **Nginx**: Reverse proxy that routes `/tools` requests to Flask and serves React static files
4. **Docker Network**: All containers communicate via Docker's internal network

### Data Flow

```
User Browser → Nginx (port 80) → React App
                ↓
              /tools API request
                ↓
            Flask Backend → GitHub API → Returns tool data with stars/forks
                ↓
            React displays data in DataGrid
```

### GitHub API Integration

On startup, the backend:
1. Loads `tools.json`
2. For each open-source tool with a GitHub repo, fetches star and fork counts
3. Ranks open-source tools by popularity
4. Caches results in `cache.json`

## Troubleshooting

### Port Already in Use

If port 80 is already in use, modify `docker-compose.yml`:

```yaml
services:
  web:
    ports:
      - "8080:80"  # Change to any available port
```

Then access at `http://localhost:8080`

### GitHub API Rate Limiting

The GitHub API has a rate limit of 60 requests/hour for unauthenticated requests. If you see "N/A" for popularity:
- Wait an hour for the rate limit to reset
- Or add a GitHub token (not currently implemented)

### Docker Build Errors

If you encounter build errors:

```bash
# Clean up Docker resources
docker-compose down -v
docker system prune -a

# Rebuild from scratch
docker-compose up --build
```

### Application Not Loading

1. Check all containers are running:
   ```bash
   docker ps
   ```
   You should see `synthetic_market-backend` and `synthetic_market-web`

2. Check backend logs:
   ```bash
   docker-compose logs backend
   ```

3. Check frontend logs:
   ```bash
   docker-compose logs web
   ```

## Development

### Modifying Frontend

1. Edit files in `frontend/src/`
2. Rebuild and restart:
   ```bash
   docker-compose up --build
   ```

### Modifying Backend

1. Edit `backend/app.py` or `backend/data/tools.json`
2. Rebuild and restart:
   ```bash
   docker-compose up --build
   ```

### Adding New Tools

Edit `backend/data/tools.json` and add entries following this format:

```json
{
    "Rank": null,
    "Name": "Tool Name",
    "Logo": "/logos/toolname.png",
    "Documentation": "https://docs.example.com",
    "Download Link": "https://github.com/example/tool",
    "Repo": "example/tool",
    "Type": "Open-Source",
    "Quick One-Liner": "Brief description",
    "Key Features": "Feature 1; Feature 2; Feature 3",
    "Pros": "Advantage 1, Advantage 2",
    "Cons": "Limitation 1, Limitation 2",
    "Popularity": "Loading...",
    "Best For": "Target use case",
    "Price": "Free" or "Contact for pricing"
}
```

Add the logo to `frontend/public/logos/` and rebuild.

## Contributing

This is an educational project. Feel free to fork and modify for your own use.

## Acknowledgments

- Tool data compiled from official documentation and GitHub repositories
- Built with React, Flask, Material-UI, and Docker
- GitHub API for real-time popularity metrics
