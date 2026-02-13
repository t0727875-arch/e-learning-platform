FROM node:20-alpine

WORKDIR /app

# copy shared first
COPY packages/shared/package.json packages/shared/
RUN cd packages/shared && npm install

# copy api package files
COPY apps/api/package.json ./
RUN npm install

# copy source
COPY packages packages
COPY apps apps

WORKDIR /app/apps/api

EXPOSE 3000
CMD ["npm", "run", "dev"]
