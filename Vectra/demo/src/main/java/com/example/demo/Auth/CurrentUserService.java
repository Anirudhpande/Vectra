package com.example.demo.Auth;

import com.example.demo.Model.User;
import com.example.demo.Repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
public class CurrentUserService {

    private final UserRepository userRepository;

    public CurrentUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }


    public User getCurrentUser(Authentication authentication){

        if(authentication == null || !authentication.isAuthenticated()){
            throw new IllegalArgumentException("User is not authenticated");
        }

        if(!(authentication instanceof OAuth2AuthenticationToken ouathToken)){
            throw new IllegalArgumentException("Unsupported authentication type");
        }

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String provider = ouathToken.getAuthorizedClientRegistrationId();
        String providerID;

        if("github".equals(provider)){
            providerID = String.valueOf(oAuth2User.getAttribute("id"));
        } else if ("google".equals(provider)) {
            providerID = oAuth2User.getName();
        }
        else{
            throw new IllegalArgumentException("Unsupported login provider");
        }

        return userRepository
                .findByProviderAndProviderID(provider, providerID)
                .orElseThrow(() -> new IllegalStateException(
                        "Authenticated user was not found in the database"
                ));
    }
}
