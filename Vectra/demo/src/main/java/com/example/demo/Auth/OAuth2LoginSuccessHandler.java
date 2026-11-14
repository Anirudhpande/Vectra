
package com.example.demo.Auth;

import com.example.demo.Service.Providers.Provider;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
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

        if (!(authentication instanceof OAuth2AuthenticationToken oauthToken)) {
            throw new ServletException("Unsupported authentication type");
        }

        OAuth2User oauthUser = oauthToken.getPrincipal();

        String provider = oauthToken.getAuthorizedClientRegistrationId();
        String providerID;
        String username;
        String email;
        String name;

        if ("github".equals(provider)) {

            Object githubId = oauthUser.getAttribute("id");

            if (githubId == null) {
                throw new ServletException("GitHub account ID is missing");
            }

            providerID = String.valueOf(githubId);
            username = oauthUser.getAttribute("login");
            email = oauthUser.getAttribute("email");
            name = oauthUser.getAttribute("name");

        } else if ("google".equals(provider)) {

            providerID = oauthUser.getName();
            username = oauthUser.getAttribute("email");
            email = oauthUser.getAttribute("email");
            name = oauthUser.getAttribute("name");

        } else {
            throw new ServletException("Unsupported OAuth2 provider");
        }

        if (providerID == null || providerID.isBlank()) {
            throw new ServletException("OAuth2 provider ID is missing");
        }

        authService.processAuthLogin(
                provider,
                providerID,
                username,
                email,
                name
        );

        securityContextRepository.saveContext(
                SecurityContextHolder.getContext(),
                request,
                response
        );

        response.sendRedirect(frontendUrl + "/chat");
    }
}
