package com.example.demo.Auth;

import com.example.demo.Model.User;
import com.example.demo.Repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository){
        this.userRepository = userRepository;
    }

    public User processAuthLogin(
            String provider,
            String providerID,
            String username,
            String email,
            String name
    ) {
        return userRepository.findByProviderAndProviderID(provider, providerID)
                .map( existingUser -> {
                    existingUser.setUsername(username);
                    existingUser.setEmail(email);
                    existingUser.setName(name);

                    return userRepository.save(existingUser);
                }) . orElseGet(() -> {
                    User newUser = new User(
                            null,
                            provider,
                            providerID,
                            username,
                            name,
                            email,
                            "USER"
                    );

                    return userRepository.save(newUser);
                });

    }
}

