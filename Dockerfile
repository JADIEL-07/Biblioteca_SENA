FROM python:3.10-slim

WORKDIR /app

# Instalar dependencias del sistema necesarias (por ejemplo para psycopg2)
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copiar el archivo de dependencias e instalar
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar todo el código (excepto lo excluido en .dockerignore)
COPY . .

# Exponer el puerto del servidor Flask
EXPOSE 5000

# Usar Gunicorn como servidor de producción
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "2", "run:app"]
