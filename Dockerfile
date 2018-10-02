FROM node:8.12.0

ARG NODE_ENV="production"

ENV CROWI_VERSION v1.8.0
ENV NODE_ENV ${NODE_ENV}

WORKDIR /crowi

ADD . /crowi
RUN npm install --unsafe-perm

CMD npm run start
