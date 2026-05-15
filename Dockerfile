FROM python:3.10-slim

WORKDIR /app

# No se requiere gcc ni libpq-dev porque requirements.txt usa psycopg2-binary precompilado

# Copiar el archivo de dependencias e instalar
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar todo el código (excepto lo excluido en .dockerignore)
COPY . .

# Exponer el puerto del servidor Flask
EXPOSE 5000

# Comando para inicializar la DB y luego arrancar Gunicorn
CMD ["bash", "-c", "flask --app run init-db && gunicorn --bind 0.0.0.0:5000 --workers 2 'run:app'"]
