# Frappe Service

Minimal Frappe Builder service for rendering pages from blocks.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Configure Frappe site (if needed)

3. Run service:
```bash
python app.py
```

Or with Docker:
```bash
docker-compose up
```

## API Endpoints

- `POST /api/render-page` - Render page from blocks
- `POST /api/validate-blocks` - Validate block structure
- `GET /api/templates` - Get available templates
- `POST /api/preview` - Generate preview
- `GET /api/health` - Health check

