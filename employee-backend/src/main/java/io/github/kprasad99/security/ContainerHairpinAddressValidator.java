package io.github.kprasad99.security;

import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimNames;
import org.springframework.security.oauth2.jwt.JwtClaimValidator;
import org.springframework.util.Assert;

import java.util.Arrays;
import java.util.List;
import java.util.function.Predicate;
import java.util.stream.Collectors;

public class ContainerHairpinAddressValidator  implements OAuth2TokenValidator<Jwt> {

    private final JwtClaimValidator<String> validator;
    private final List<Predicate<String>> predicates;

    public ContainerHairpinAddressValidator(String issuer, IngressAddress ingress) {
        predicates = Arrays.stream(ingress.getUrls()).map(this::toPredicate).collect(Collectors.toList());
        predicates.add(issuer::equals);
        this.validator = new JwtClaimValidator<>(JwtClaimNames.ISS,
                x -> predicates.stream().reduce(r -> false, Predicate::or).test(x));
    }

    @Override
    public OAuth2TokenValidatorResult validate(Jwt token) {
        Assert.notNull(token, "token cannot be null");
        return this.validator.validate(token);
    }

    private Predicate<String> toPredicate(String validIss) {
        return x-> x.equals(validIss);
    }
}