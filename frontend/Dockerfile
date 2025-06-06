FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install --force

# Copy source
COPY . .

# Override TypeScript version
RUN npm install typescript@4.9.5 --save-dev

EXPOSE 3000

CMD ["npm", "start"]