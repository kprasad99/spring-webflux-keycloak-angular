# FROM openjdk:21-jre-slim
# FROM amazoncorretto:21

FROM alpine:3.20 AS jvmBuilder

RUN apk --no-cache add openjdk21-jdk openjdk21-jmods binutils

ENV JAVA_MINIMAL="/opt/java-minimal"

# build minimal JRE
RUN /usr/lib/jvm/java-21-openjdk/bin/jlink \
    --verbose \
     --add-modules \
        java.base,java.desktop,java.instrument,\
java.management,java.management.rmi,java.naming,java.net.http,java.prefs,\
java.security.jgss,java.security.sasl,java.sql,jdk.management.agent,jdk.management,\
jdk.crypto.ec,jdk.unsupported \
    --compress 2 --strip-debug --no-header-files --no-man-pages \
#    --bind-services \
    --release-info="add:IMPLEMENTOR=Karthik:IMPLEMENTOR_VERSION=jre-21" \
    --output "$JAVA_MINIMAL"

FROM gradle:8.8-jdk21 AS builder

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

FROM alpine:3.20

ENV JAVA_HOME=/usr/lib/jvm/java-21-openjdk
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

ENTRYPOINT ["java", "org.springframework.boot.loader.launch.JarLauncher"]
