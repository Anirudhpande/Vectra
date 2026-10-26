package com.example.demo.Control;

import com.example.demo.Auth.AuthUserResponse;
import com.example.demo.Auth.CurrentUserService;
import com.example.demo.Model.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class HomeController {

    private final CurrentUserService currentUserService;

    public HomeController(CurrentUserService currentUserService){
        this.currentUserService = currentUserService;
    }

    @GetMapping("/api/me")
    public AuthUserResponse me(@AuthenticationPrincipal OAuth2User user){

        OAuth2AuthenticationToken authenticationToken = (OAuth2AuthenticationToken) SecurityContextHolder.getContext().getAuthentication();

        String provider = authenticationToken.getAuthorizedClientRegistrationId();

        Map<String, Object> attribute = user.getAttributes();

        String providerID;
        String username;
        String name;
        String email;

        if("github".equals(provider)) {
            Object githubId = user.getAttribute("id");
            providerID = githubId.toString();
            username = user.getAttribute("login");
            email = user.getAttribute("email");
            name = user.getAttribute("name");
        }
        else{
            providerID = user.getName();
            username = user.getAttribute("email");
            name = user.getAttribute("name");
            email = user.getAttribute("email");
        }

        return new AuthUserResponse(provider, providerID, username, name, email);
    }

    @GetMapping("/api/me/account")
    public AuthUserResponse getMyAccount(
            Authentication authentication
    ){
        User user = currentUserService.getCurrentUser(authentication);

        return new AuthUserResponse(
                user.getProvider(),
                user.getProviderID(),
                user.getUsername(),
                user.getName(),
                user.getEmail()
        );
    }

}
