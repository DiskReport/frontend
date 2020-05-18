FROM node:14
WORKDIR /usr/src/app
EXPOSE 3000
ENTRYPOINT [ "npm", "run" ]
CMD [ "start" ]
COPY nuxt/package.json ./
RUN npm install
# Until https://github.com/apache/incubator-echarts/issues/7451
RUN mv /usr/src/app/node_modules/echarts/lib/langEN.js /usr/src/app/node_modules/echarts/lib/lang.js
COPY nuxt/ .
RUN npm run build
