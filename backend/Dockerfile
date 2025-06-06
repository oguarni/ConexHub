FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Add environment file handling
COPY .env.example .env
RUN if [ "$NODE_ENV" = "development" ]; then \
  apk add --no-cache openssl && \
  sed -i "s/your-secret-key/$(openssl rand -base64 32)/" .env; \
fi

EXPOSE 3001

CMD ["npm", "start"]
