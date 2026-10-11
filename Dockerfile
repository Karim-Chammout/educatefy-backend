FROM node:24-alpine
WORKDIR /app
COPY package.json package-lock.json ./

RUN npm ci
COPY . .
RUN npm run build
EXPOSE 9090

CMD ["sh", "-c", "npm run migrate && npm start"]
