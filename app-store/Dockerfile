
FROM        golang:1.16-alpine as builder
WORKDIR     /usr/src/go-web
COPY        main.go /usr/src/go-web/main.go
COPY        go.mod /usr/src/go-web/go.mod
RUN         CGO_ENABLED=0 GOOS=linux GOARCH=amd64 GO111MODULE=on go build -a -v 

FROM        node:14.16.1-alpine3.13 as nmpBuilder
WORKDIR     /opt/workspace
COPY        package.json .
COPY        package-lock.json .

RUN         npm install
COPY         . .
RUN         npm run lint && npm run build-prod

FROM        alpine:3.13

COPY        --from=builder /usr/src/go-web/go-web /usr/local/bin/go-web
COPY        --from=nmpBuilder /opt/workspace/dist/app/ /static/

ENV WEB_PORT=8080
ENV WEB_CONTEXT_PATH=/app-store/

VOLUME /static
EXPOSE ${WEB_PORT}

ENTRYPOINT  ["/usr/local/bin/go-web"]
