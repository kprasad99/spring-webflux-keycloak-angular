# FROM openjdk:11-jre-slim
# FROM amazoncorretto:11
FROM kprasad99/openjdk:11-jre-alpine as builder

ARG DEPENDENCY=target/dependency

COPY ${DEPENDENCY}/BOOT-INF/lib /app/lib
COPY ${DEPENDENCY}/META-INF /app/META-INF
COPY ${DEPENDENCY}/BOOT-INF/classes /app

FROM kprasad99/openjdk:11-jre-alpine

ARG JAVA_OPTS
ENV JAVA_OPTS=$JAVA_OPTS

VOLUME /tmp

COPY --from=builder /app /app

ENTRYPOINT ["java","-cp","app:app/lib/*","io.github.kprasad99.EmployeeBackendApplication"]