package com.smartcampus.controller;

import com.smartcampus.config.AppProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.RedirectView;

@RestController
@RequiredArgsConstructor
public class WebRedirectController {

    private final AppProperties appProperties;

    @GetMapping("/login")
    public RedirectView redirectLogin() {
        return new RedirectView(normalizeBaseUrl(appProperties.getFrontendUrl()) + "/login");
    }

    private String normalizeBaseUrl(String url) {
        if (url == null || url.isBlank()) {
            return "http://localhost:5174";
        }
        return url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
    }
}
