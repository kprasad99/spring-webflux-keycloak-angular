FROM        golang:1.25-alpine AS builder
WORKDIR     /usr/src/go-web
COPY        go.mod /usr/src/go-web/go.mod
COPY        go.sum /usr/src/go-web/go.sum
RUN         go mod download
COPY        main.go /usr/src/go-web/main.go
RUN         CGO_ENABLED=0 GOEXPERIMENT=jsonv2,greenteagc GOOS=linux GOARCH=amd64 GO111MODULE=on go build -a


FROM node:24-alpine AS npmbuilder

WORKDIR /workspace

RUN npm install -g pnpm

COPY package.json /workspace/package.json
COPY pnpm-lock.yaml /workspace/pnpm-lock.yaml
RUN pnpm install

#COPY . /workspace
COPY eslint.config.js /workspace/eslint.config.js
COPY .postcssrc.json /workspace/.postcssrc.json
COPY ngsw-config.json /workspace/ngsw-config.json
COPY tsconfig.app.json /workspace/tsconfig.app.json
COPY tsconfig.json /workspace/tsconfig.json
COPY tsconfig.spec.json /workspace/tsconfig.spec.json
COPY angular.json /workspace/angular.json
COPY public /workspace/public
COPY src /workspace/src

RUN pnpm run build-prod


FROM gcr.io/distroless/static:nonroot

ENV WEB_PORT=8080
ENV WEB_CONTEXT_PATH=/app-store/
USER 65532:65532

EXPOSE ${WEB_PORT}

COPY --chown=65532:65532 --from=builder /usr/src/go-web/go-web /usr/local/bin/go-web
COPY --chown=65532:65532 --from=npmbuilder /workspace/dist/app/browser /static/

ENTRYPOINT  ["/usr/local/bin/go-web"]
