# Etapa 1: Construcción (Node.js)
FROM node:20-alpine AS build

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json* ./

# Instalar dependencias
RUN npm install

# Copiar el código fuente de React
COPY . .

# Compilar la aplicación para producción (genera la carpeta 'dist')
RUN npm run build

# Etapa 2: Servidor Web en Producción (Nginx)
FROM nginx:alpine

# Eliminar la configuración por defecto de Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copiar nuestra configuración personalizada
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos compilados de la etapa anterior a la carpeta pública de Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Exponer el puerto 80 (puerto HTTP estándar)
EXPOSE 80

# Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
