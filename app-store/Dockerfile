FROM        golang:1.22-alpine3.20 AS builder
WORKDIR     /usr/src/go-web
COPY        go.mod /usr/src/go-web/go.mod
COPY        go.sum /usr/src/go-web/go.sum
RUN         go mod download
COPY        main.go /usr/src/go-web/main.go
RUN         CGO_ENABLED=0 GOOS=linux GOARCH=amd64 GO111MODULE=on go build -a


FROM        node:20-alpine3.20 AS nmpBuilder
WORKDIR     /opt/workspace
COPY        package.json .
COPY        package-lock.json .

RUN         npm install
COPY         . .
RUN         npm run lint && npm run build-prod

FROM        gcr.io/distroless/static:nonroot

COPY        --from=builder /usr/src/go-web/go-web /usr/local/bin/go-web
COPY        --from=nmpBuilder /opt/workspace/dist/app/ /static/

ENV WEB_PORT=8080
ENV WEB_CONTEXT_PATH=/app-store/

VOLUME /static
EXPOSE ${WEB_PORT}

USER 65532:65532
ENTRYPOINT  ["/usr/local/bin/go-web"]
