FROM node:18.16.0-alpine as base

COPY package.json ./

RUN yarn install

COPY src ./src

COPY tsconfig.json ./tsconfig.json

COPY src/allowedFileTypes.json ./dist/

RUN npm run build

FROM node:18.16.0-alpine

COPY --from=base ./node_modules ./node_modules
COPY --from=base ./package.json ./package.json
COPY --from=base /dist /dist

EXPOSE 3000
CMD ["npm", "run", "start"]