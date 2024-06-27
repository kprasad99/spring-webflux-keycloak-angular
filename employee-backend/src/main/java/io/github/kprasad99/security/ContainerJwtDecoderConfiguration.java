package io.github.kprasad99.security;

import org.springframework.boot.autoconfigure.security.oauth2.resource.IssuerUriCondition;
import org.springframework.boot.autoconfigure.security.oauth2.resource.OAuth2ResourceServerProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Conditional;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.jwt.*;

@Configuration
@EnableConfigurationProperties({OAuth2ResourceServerProperties.class, IngressAddress.class})
public class ContainerJwtDecoderConfiguration {

    @Bean
    @Conditional(IssuerUriCondition.class)
    ReactiveJwtDecoder jwtDecoder(OAuth2ResourceServerProperties properties, IngressAddress address) {
        NimbusReactiveJwtDecoder jwtDecoder = (NimbusReactiveJwtDecoder) ReactiveJwtDecoders
                .fromIssuerLocation(properties.getJwt().getIssuerUri());
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
