package com.example.demo.Security;

import com.example.demo.Auth.OAuth2LoginSuccessHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    private static final Logger log = LoggerFactory.getLogger(SecurityConfig.class);

    private final OAuth2LoginSuccessHandler successHandler;


    public SecurityConfig(OAuth2LoginSuccessHandler successHandler){
        this.successHandler = successHandler;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception{
        http.authorizeHttpRequests( auth -> auth
                .requestMatchers("/").permitAll()
                .anyRequest().authenticated())
                .oauth2Login(login-> login.successHandler(successHandler));

        return http.build();
    }
}
