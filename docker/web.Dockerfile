FROM node:20-alpine


WORKDIR /app/apps/web

COPY apps/web/package.json .
COPY apps/web/package-lock.json* .
RUN npm install

COPY apps/web .

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]
