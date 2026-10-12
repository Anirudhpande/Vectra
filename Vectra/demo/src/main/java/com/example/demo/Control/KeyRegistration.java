package com.example.demo.Control;


import com.example.demo.Model.API;
import com.example.demo.Model.ApiRequest;
import com.example.demo.Security.KeyManager;
import com.example.demo.Service.KeyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class KeyRegistration {

    @PostMapping("/api")
    public String RegisterKey(@RequestBody ApiRequest apiRequest) throws Exception {
        if(apiRequest.getProvider_name() != null && apiRequest.getAPI() !=null) {
            KeyService.registerKey(apiRequest);
            return "Accepted";
        }
        else{
            return "Nah nigga";
        }
    }

    @GetMapping("/api")
    public List<API> ShowKeys(){
        return KeyService.ShowAllApis();
    }

    @GetMapping("/getModels")
    public List<String> getModels(@RequestBody ApiRequest apiRequest) throws Exception {
        API api = KeyService.registerKey(apiRequest);
        if(apiRequest.getAPI() == null){
            return null;
        }

        return KeyService.getModels(api);
    }
}
