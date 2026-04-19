package com.smartcampus.config;

import lombok.RequiredArgsConstructor;
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
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/queue", "/topic");
        registry.setApplicationDestinationPrefixes("/app");
        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        
        // 1. Endpoint for clients using SockJS fallback
        registry.addEndpoint("/ws")
                .setAllowedOrigins(appProperties.getFrontendUrl()) // Explicitly allows React
                .withSockJS();
                
        // 2. Standard WebSocket endpoint 
        // Some modern React STOMP clients prefer native WebSockets over SockJS.
        registry.addEndpoint("/ws")
                .setAllowedOrigins(appProperties.getFrontendUrl());
    }
}