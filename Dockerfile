FROM node:12.18-alpine

LABEL maintainer="the.duong@ntq-solution.com.vn"

EXPOSE 3000

ENV NODE_ENV development

WORKDIR /home/node

COPY . /home/node

RUN yarn install --pure-lockfile

RUN yarn build

CMD ["node", "dist/main.js"]
