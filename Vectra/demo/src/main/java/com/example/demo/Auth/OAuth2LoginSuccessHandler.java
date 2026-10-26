package com.example.demo.Auth;

import com.example.demo.Model.User;
import com.example.demo.Service.Providers.Provider;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final AuthService authService;

    public OAuth2LoginSuccessHandler(AuthService authService) {
        this.authService = authService;
    }


    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {

        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String provider = oauthToken.getAuthorizedClientRegistrationId();
        String providerID;
        String username;
        String email;
        String name;


        if ("github".equals(provider)) {
            Object githubId = oAuth2User.getAttribute("id");
            providerID = githubId.toString();
            username = oAuth2User.getAttribute("login");
            email = oAuth2User.getAttribute("email");
            name = oAuth2User.getAttribute("name");
        } else {
            providerID = oAuth2User.getName();
            username = oAuth2User.getAttribute("email");
            email = oAuth2User.getAttribute("email");
            name = oAuth2User.getAttribute("name");
        }

        User user = authService.processAuthLogin(
                provider,
                providerID,
                username,
                email,
                name
        );

        response.sendRedirect("/api/me");
    }
}
