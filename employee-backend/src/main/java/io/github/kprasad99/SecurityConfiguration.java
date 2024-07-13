package io.github.kprasad99;

import static org.springframework.security.config.Customizer.withDefaults;

import org.springframework.boot.autoconfigure.security.oauth2.resource.IssuerUriCondition;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Conditional;
import org.springframework.context.annotation.Configuration;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.annotation.method.configuration.EnableReactiveMethodSecurity;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtAuthenticationConverterAdapter;
import org.springframework.security.web.server.SecurityWebFilterChain;

import io.github.kprasad99.security.GrantedAuthoritiesExtractor;
import reactor.core.publisher.Mono;


@Configuration
@EnableWebFluxSecurity
@EnableReactiveMethodSecurity
@Conditional(IssuerUriCondition.class)
public class SecurityConfiguration {

	@Bean
	public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
		http.authorizeExchange(exchanges -> exchanges.pathMatchers("/actuator/**").permitAll().anyExchange().authenticated()).oauth2ResourceServer(oauth2 -> oauth2
				.jwt(withDefaults()).jwt(jwt -> jwt.jwtAuthenticationConverter(grantedAuthoritiesExtractor())))
				.csrf(ServerHttpSecurity.CsrfSpec::disable);
		return http.build();
	}

	private Converter<Jwt, Mono<AbstractAuthenticationToken>> grantedAuthoritiesExtractor() {
		JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
		jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(new GrantedAuthoritiesExtractor());
		return new ReactiveJwtAuthenticationConverterAdapter(jwtAuthenticationConverter);
	}





}
