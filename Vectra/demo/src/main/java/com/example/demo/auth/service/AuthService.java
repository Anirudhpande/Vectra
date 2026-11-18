
package com.example.demo.auth.service;

import com.example.demo.user.model.User;
import com.example.demo.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public User processAuthLogin(
            String provider,
            String providerID,
            String username,
            String email,
            String name
    ) {

        if (provider == null || provider.isBlank()) {
            throw new IllegalArgumentException("OAuth provider is required");
        }

        if (providerID == null || providerID.isBlank()) {
            throw new IllegalArgumentException("OAuth provider ID is required");
        }

        if (!provider.equals("github") && !provider.equals("google")) {
            throw new IllegalArgumentException("Unsupported OAuth provider");
        }

        return userRepository
                .findByProviderAndProviderID(provider, providerID)
                .map(existingUser -> {
                    existingUser.setUsername(username);
                    existingUser.setEmail(email);
                    existingUser.setName(name);

                    return userRepository.save(existingUser);
                })
                .orElseGet(() -> {
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
