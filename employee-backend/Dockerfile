FROM gradle:9-jdk25-corretto AS builder

WORKDIR /workspace

COPY gradle /workspace/gradle
COPY gradlew /workspace/
COPY build.gradle /workspace/
COPY settings.gradle /workspace/
COPY gradle.properties /workspace/gradle.properties

RUN gradle dependencies

COPY src /workspace/src

RUN gradle build \
    && java -Djarmode=layertools \
    -jar build/libs/employee-backend.jar extract \
    --destination /app


FROM amazoncorretto:25-alpine
ENV JAVA_OPTS=""
ENV SERVER_PORT=8080
ENV SPRING_REACTOR_NETTY_PREFER_NATIVE="true"
ENV JAVA_TOOL_OPTIONS="-XX:+UseContainerSupport \
    -XX:+UseShenandoahGC \
    -XX:+AlwaysPreTouch \
    -Djava.awt.headless=true ${JAVA_OPTS}"

WORKDIR /app
VOLUME /tmp

ARG DEPENDENCY=/app

COPY --from=builder ${DEPENDENCY}/dependencies/ ./
COPY --from=builder ${DEPENDENCY}/spring-boot-loader/ ./
COPY --from=builder ${DEPENDENCY}/snapshot-dependencies/ ./
COPY --from=builder ${DEPENDENCY}/application/ ./

 RUN  apk add --no-cache curl \
      && java -XX:AOTMode=record -XX:AOTConfiguration=app.aotconf \
        -Dspring.context.exit=onRefresh \
        org.springframework.boot.loader.launch.JarLauncher \
      && java -XX:AOTMode=create -XX:AOTConfiguration=app.aotconf -XX:AOTCache=/app/app.aot \
        org.springframework.boot.loader.launch.JarLauncher

EXPOSE ${SERVER_PORT}

ENTRYPOINT ["java", \
    "--enable-native-access=ALL-UNNAMED", \
    "-XX:AOTCache=app.aot", \
    "-XX:+ExitOnOutOfMemoryError", \
    "org.springframework.boot.loader.launch.JarLauncher"]
