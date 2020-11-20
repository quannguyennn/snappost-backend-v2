FROM node:12.18-alpine

LABEL maintainer="the.duong@ntq-solution.com.vn"

EXPOSE 3000

WORKDIR /home/node

COPY . /home/node
COPY dist .

RUN yarn install --prod

CMD ["node", "dist/main.js"]