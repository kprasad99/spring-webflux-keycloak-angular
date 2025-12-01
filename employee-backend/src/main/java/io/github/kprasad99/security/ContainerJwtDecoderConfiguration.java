package io.github.kprasad99.security;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.security.oauth2.server.resource.autoconfigure.OAuth2ResourceServerProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.jwt.*;

import java.util.Objects;

@Configuration
@EnableConfigurationProperties({OAuth2ResourceServerProperties.class, IngressAddress.class})
public class ContainerJwtDecoderConfiguration {

    @Bean
    @ConditionalOnProperty(name = "spring.security.oauth2.resourceserver.jwt.issuer-uri")
    ReactiveJwtDecoder jwtDecoder(OAuth2ResourceServerProperties properties, IngressAddress address) {
        NimbusReactiveJwtDecoder jwtDecoder = (NimbusReactiveJwtDecoder) ReactiveJwtDecoders
                .fromIssuerLocation(Objects.requireNonNull(properties.getJwt().getIssuerUri()));
        if (address.getUrls() != null && address.getUrls().length > 0) {
            var issuerValidator = new ContainerHairpinAddressValidator(properties.getJwt().getIssuerUri(), address);
            var validators = new DelegatingOAuth2TokenValidator<>(JwtValidators.createDefault(), issuerValidator);
            jwtDecoder.setJwtValidator(validators);
        } else {
            jwtDecoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(
                    JwtValidators.createDefaultWithIssuer(properties.getJwt().getIssuerUri())));
        }
        return jwtDecoder;
    }
}
