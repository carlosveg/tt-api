FROM node:alpine

WORKDIR /tt-retail
COPY package.json .
RUN yarn

COPY . .
CMD yarn dev