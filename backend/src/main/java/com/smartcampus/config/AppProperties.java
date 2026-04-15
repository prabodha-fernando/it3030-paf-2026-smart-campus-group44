package com.smartcampus.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

@ConfigurationProperties(prefix = "app")
@Getter
@Setter
public class AppProperties {

    private Jwt jwt = new Jwt();
    private String frontendUrl = "http://localhost:5173";
    private List<String> allowedEmailDomains = List.of("@my.sliit.lk");

    @Getter
    @Setter
    public static class Jwt {
        private String secret;
        private long expirationMs = 900000;
        private long refreshExpirationMs = 604800000;
    }
    
}
