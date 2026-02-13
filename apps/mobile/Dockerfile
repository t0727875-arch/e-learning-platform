FROM node:20-alpine

WORKDIR /app

# Install Expo CLI
RUN npm install -g expo

COPY apps/mobile/package.json apps/mobile/package-lock.json* apps/mobile/
RUN npm install

COPY . .

EXPOSE 8081 19000 19001 19002

CMD ["expo", "start", "--tunnel"]
