FROM        golang:1.22-alpine3.20 AS builder
WORKDIR     /usr/src/go-web
COPY        go.mod /usr/src/go-web/go.mod
COPY        go.sum /usr/src/go-web/go.sum
RUN         go mod download
COPY        main.go /usr/src/go-web/main.go
RUN         CGO_ENABLED=0 GOOS=linux GOARCH=amd64 GO111MODULE=on go build -a


FROM node:20-alpine3.20 AS npmBuilder

WORKDIR /workspace

RUN npm install -g pnpm

COPY package.json /workspace/package.json
RUN pnpm install

#COPY . /workspace
COPY .eslintrc.json /workspace/.eslintrc.json
COPY ngsw-config.json /workspace/ngsw-config.json
COPY tsconfig.app.json /workspace/tsconfig.app.json
COPY tsconfig.json /workspace/tsconfig.json
COPY tsconfig.spec.json /workspace/tsconfig.spec.json
COPY angular.json /workspace/angular.json
COPY src /workspace/src

RUN pnpm run build-prod


FROM alpine:3.20

ENV WEB_PORT=8080
ENV WEB_CONTEXT_PATH=/app-store/
USER 65532:65532
VOLUME /static
EXPOSE ${WEB_PORT}

COPY --chown=65532:65532 --from=builder /usr/src/go-web/go-web /usr/local/bin/go-web
COPY --chown=65532:65532 --from=npmBuilder /workspace/dist/app/browser /static/

ENTRYPOINT  ["/usr/local/bin/go-web"]
