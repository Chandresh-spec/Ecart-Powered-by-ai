FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc libpq-dev curl \
    && rm -rf /var/lib/apt/lists/*

RUN python -m pip install --upgrade pip
RUN python -m pip install --no-cache-dir \
    django==6.0.4 \
    djangorestframework \
    djangorestframework-simplejwt \
    django-cors-headers \
    django-filter \
    python-dotenv \
    gunicorn

COPY backend/ /app/
COPY frontend/ /app/frontend/

ENV DJANGO_SETTINGS_MODULE=ecommerce.settings
ENV PYTHONPATH=/app

RUN python manage.py collectstatic --noinput

EXPOSE 8000
CMD ["gunicorn", "ecommerce.wsgi:application", "--bind", "0.0.0.0:8000"]
