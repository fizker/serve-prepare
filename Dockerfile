FROM node:erbium-alpine
WORKDIR /fizker/serve-prepare

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN ln -s /fizker/serve-prepare/index.js /bin/serve-prepare

WORKDIR /root

ENV PORT=80 HTTPS_PORT=443

ENTRYPOINT [ "serve-prepare" ]
CMD [ "serve", "--request=serve-setup-request.json", "--target=target" ]
