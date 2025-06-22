# Stage 1: Build the React application with the correct API URL
FROM node:18-alpine AS builder

WORKDIR /app

# -- FIX: Add ARG and ENV to receive the API URL at build time --
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

COPY package*.json ./
RUN npm install

COPY . .

# The build process will now embed the correct backend URL
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:1.25-alpine

# Copy the built app from the builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Copy the custom Nginx configuration
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Create log directory and set permissions for the nginx user
RUN mkdir -p /var/lib/nginx/logs && \
    chown -R nginx:nginx /var/lib/nginx/logs && \
    chmod -R 755 /var/lib/nginx

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]