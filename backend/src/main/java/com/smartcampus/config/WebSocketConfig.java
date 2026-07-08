package com.smartcampus.config;

import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor // Automatically creates a constructor for AppProperties
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final AppProperties appProperties; // Brings in your frontend-url from application.yml

    @Override
    public void configureMessageBroker(@NonNull MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/queue", "/topic");
        registry.setApplicationDestinationPrefixes("/app");
        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(@NonNull StompEndpointRegistry registry) {
        
        // 1. Endpoint for clients using SockJS fallback
        registry.addEndpoint("/ws")
                .setAllowedOrigins(
                        appProperties.getFrontendUrl(),
                        "http://localhost:5173",
                        "http://localhost:5174",
                        "http://127.0.0.1:5173",
                        "http://127.0.0.1:5174")
                .withSockJS();
                
        // 2. Standard WebSocket endpoint 
        registry.addEndpoint("/ws")
                .setAllowedOrigins(
                        appProperties.getFrontendUrl(),
                        "http://localhost:5173",
                        "http://localhost:5174",
                        "http://127.0.0.1:5173",
                        "http://127.0.0.1:5174");
    }
}
