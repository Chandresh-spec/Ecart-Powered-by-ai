FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc libpq-dev curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
RUN python -m pip install --upgrade pip
RUN python -m pip install --no-cache-dir \
    django==6.0.2 \
    djangorestframework \
    djangorestframework-simplejwt \
    django-cors-headers \
    django-filter \
    python-dotenv \
    gunicorn \
    google-genai \
    Pillow \
    whitenoise

# Copy project files
COPY backend/ /app/
COPY frontend/ /app/frontend/

# Copy .env into the container
COPY .env /app/.env

ENV DJANGO_SETTINGS_MODULE=ecommerce.settings
ENV PYTHONPATH=/app

# Collect static files
RUN python manage.py collectstatic --noinput 2>/dev/null || true

# Expose port
EXPOSE 8000

# Run with gunicorn
CMD ["gunicorn", "ecommerce.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3", "--timeout", "120"]
