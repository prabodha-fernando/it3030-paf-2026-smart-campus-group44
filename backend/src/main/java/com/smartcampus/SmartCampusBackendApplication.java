package com.smartcampus;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import com.smartcampus.config.AppProperties;

@SpringBootApplication
@EnableConfigurationProperties(AppProperties.class)
public class SmartCampusBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(SmartCampusBackendApplication.class, args);
	}

}
