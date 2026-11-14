
package com.example.demo.Control;

import com.example.demo.Model.API;
import com.example.demo.Model.ApiRequest;
import com.example.demo.Model.CredentialResponse;
import com.example.demo.Service.KeyService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/credentials")
public class KeyRegistration {

    private final KeyService keyService;

    public KeyRegistration(KeyService keyService) {
        this.keyService = keyService;
    }

    @PostMapping
    public ResponseEntity<?> registerKey(
            @Valid @RequestBody ApiRequest apiRequest,
            Authentication authentication
    ) throws Exception {

        if (apiRequest.getProvider_name() == null
                || apiRequest.getProvider_name().isBlank()
                || apiRequest.getAPI() == null
                || apiRequest.getAPI().isBlank()) {

            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Provider name and API key are required"));
        }

        API api = keyService.registerKey(apiRequest, authentication);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of(
                        "id", api.getId(),
                        "providerName", api.getProviderName()
                ));
    }

    @GetMapping
    public List<CredentialResponse> showKeys(
            Authentication authentication
    ) {
        return keyService.ShowAllApis(authentication)
                .stream()
                .map(api -> new CredentialResponse(
                        api.getId(),
                        api.getProviderName()
                ))
                .toList();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCredential(
            @PathVariable String id,
            Authentication authentication
    ) {
        if (!keyService.deleteKey(id, authentication)) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }
}
