FROM node:24-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./

RUN npm ci --only=production

COPY . .

RUN mkdir -p uploads

EXPOSE 5000

CMD ["sh", "-c", "npm run migrate && npm start"]
