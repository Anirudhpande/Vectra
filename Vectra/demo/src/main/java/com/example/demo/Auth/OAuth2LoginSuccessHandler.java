package com.example.demo.Auth;

import com.example.demo.Model.User;
import com.example.demo.Service.Providers.Provider;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final AuthService authService;
    private final String frontendUrl;
    private final SecurityContextRepository securityContextRepository =
            new HttpSessionSecurityContextRepository();

    public OAuth2LoginSuccessHandler(
            AuthService authService,
            @Value("${vectra.frontend-url:http://localhost:5173}") String frontendUrl
    ) {
        this.authService = authService;
        this.frontendUrl = frontendUrl.replaceAll("/+$", "");
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

        // Make the authenticated OAuth2 principal available to the separate
        // frontend request that follows this redirect.
        securityContextRepository.saveContext(
                SecurityContextHolder.getContext(),
                request,
                response
        );

        // Return to the React application after the server has established the
        // authenticated session. /api/me is a JSON endpoint, not a UI route.
        response.sendRedirect(frontendUrl + "/chat");
    }
}
