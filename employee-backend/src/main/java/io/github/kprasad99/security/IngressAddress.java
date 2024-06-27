package io.github.kprasad99.security;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties("ingress")
public class IngressAddress {
    private String[] urls;
}
