
package com.example.demo.Control;

import com.example.demo.Model.API;
import com.example.demo.Model.ApiRequest;
import com.example.demo.Service.KeyService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/credentials")
public class KeyRegistration {

    private final KeyService keyService;

    public KeyRegistration(KeyService keyService) {
        this.keyService = keyService;
    }

    @PostMapping
    public ResponseEntity<?> registerKey(
            @RequestBody ApiRequest apiRequest) throws Exception {

        if (apiRequest.getProvider_name() == null
                || apiRequest.getProvider_name().isBlank()
                || apiRequest.getAPI() == null
                || apiRequest.getAPI().isBlank()) {

            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Provider name and API key are required"));
        }

        API api = keyService.registerKey(apiRequest);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of(
                        "id", api.getId(),
                        "providerName", api.getProviderName()
                ));
    }

    @GetMapping
    public List<API> showKeys() {
        return keyService.ShowAllApis();
    }

    @GetMapping("/{id}/models")
    public ResponseEntity<?> getModels(@PathVariable String id)
            throws Exception {

        API api = keyService.exists(id);

        if (api == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Credential not found"));
        }

        return ResponseEntity.ok(keyService.getModels(api));
    }
}
