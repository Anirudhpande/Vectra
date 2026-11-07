package com.example.demo.Service;

import com.example.demo.Model.User;
import com.example.demo.Repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;

import javax.naming.AuthenticationException;
import java.net.Authenticator;

public class CurrentUserSerivce {

    private final UserRepository userRepository;

    public CurrentUserSerivce(UserRepository userRepository){
        this.userRepository = userRepository;
    }

    public User getCurrentUser(Authentication authentication){

        if(authentication == null || !authentication.isAuthenticated()){
            throw new IllegalStateException("User is not authenticated");
        }

        if(!(authentication instanceof OAuth2AuthenticationToken oauthToken)){
            throw new IllegalStateException("Unsupported authentication type");
        }

        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();

        String provider = oauthToken.getAuthorizedClientRegistrationId();
        String providerID;

        if("github".equals(provider)){
            Object githubId = oauthUser.getAttribute("id");
            providerID = String.valueOf(githubId);
        } else if ("google".equals(provider)) {
            providerID = oauthUser.getName();
        } else{
            throw new IllegalStateException("Unsupported loging provider");
        }

        return userRepository
                .findByProviderAndProviderID(provider, providerID)
                .orElseThrow(() -> new IllegalStateException(
                        "Authenticated user was not found in the database"
                ));
    }
}
