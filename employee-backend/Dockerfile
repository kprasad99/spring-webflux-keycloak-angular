# FROM openjdk:17-jre-slim
# FROM amazoncorretto:17

FROM alpine:3.15 as jvmBuilder

RUN apk --no-cache add openjdk17-jdk openjdk17-jmods

ENV JAVA_MINIMAL="/opt/java-minimal"

# build minimal JRE
RUN /usr/lib/jvm/java-17-openjdk/bin/jlink \
    --verbose \
     --add-modules \
        java.base,java.desktop,java.instrument,\
java.management,java.management.rmi,java.naming,java.net.http,java.prefs,\
java.security.jgss,java.security.sasl,java.sql,jdk.management.agent,jdk.management,\
jdk.crypto.ec,jdk.unsupported \
    --compress 2 --strip-debug --no-header-files --no-man-pages \
#    --bind-services \
    --release-info="add:IMPLEMENTOR=Karthik:IMPLEMENTOR_VERSION=jre-17" \
    --output "$JAVA_MINIMAL"

FROM gradle:7.4-jdk17 as builder

WORKDIR /app

COPY gradle /app/gradle
COPY gradlew /app/
COPY build.gradle /app/
COPY settings.gradle /app/

RUN gradle dependencies

COPY src /app/src

RUN gradle build \
    && java -Djarmode=layertools \
    -jar build/libs/*.jar extract \
    --destination /app

FROM alpine:3.15

ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk
ENV PATH="$PATH:$JAVA_HOME/bin"
ENV JAVA_OPTS=""
ENV SERVER_PORT=8080

WORKDIR /app
VOLUME /tmp

COPY --from=jvmBuilder /opt/java-minimal "$JAVA_HOME"

ARG DEPENDENCY=/app

COPY --from=builder ${DEPENDENCY}/dependencies/ ./
COPY --from=builder ${DEPENDENCY}/spring-boot-loader/ ./
COPY --from=builder ${DEPENDENCY}/snapshot-dependencies/ ./
COPY --from=builder ${DEPENDENCY}/application/ ./

EXPOSE ${SERVER_PORT}

ENTRYPOINT ["java", "org.springframework.boot.loader.JarLauncher"]
