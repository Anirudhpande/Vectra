
package com.example.demo.Model;

import jakarta.validation.constraints.NotBlank;

public class ApiRequest {

    @NotBlank(message = "Provider name is required")
    private String provider_name;

    @NotBlank(message = "API key is required")
    private String API;

    public ApiRequest() {
    }

    public ApiRequest(String provider_name, String API) {
        this.provider_name = provider_name;
        this.API = API;
    }

    public String getProvider_name() {
        return provider_name;
    }

    public String getAPI() {
        return API;
    }

    public void setProvider_name(String provider_name) {
        this.provider_name = provider_name;
    }

    public void setAPI(String API) {
        this.API = API;
    }
}
