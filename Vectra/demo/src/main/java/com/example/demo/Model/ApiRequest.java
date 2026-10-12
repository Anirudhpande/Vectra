package com.example.demo.Model;

import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

@Component
public class ApiRequest {
    private String provider_name;
    private String API;

    ApiRequest(
            String provider_name,
            String API
    ){
        this.provider_name = provider_name;
        this.API = API;
    }
    ApiRequest(){

    }

    public String getProvider_name(){
        return provider_name;
    }

    public String getAPI(){
        return API;
    }

    public void setProvider_name(String provider_name){
        this.provider_name = provider_name;
    }

    public void setAPI(String API){
        this.API = API;
    }


}
