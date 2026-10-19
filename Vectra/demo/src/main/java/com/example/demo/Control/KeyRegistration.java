package com.example.demo.Control;


import com.example.demo.Model.API;
import com.example.demo.Model.ApiRequest;
import com.example.demo.Service.KeyService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class KeyRegistration {

    @PostMapping("/api/credentials")
    public String RegisterKey(@RequestBody ApiRequest apiRequest) throws Exception {
        if(apiRequest.getProvider_name() != null && apiRequest.getAPI() !=null) {
            KeyService.registerKey(apiRequest);
            return "Accepted";
        }
        else{
            return "Nah nigga";
        }
    }

    @GetMapping("/api/credentials")
    public List<API> ShowKeys(){
        return KeyService.ShowAllApis();
    }

    @GetMapping("/api/credentials/{id}/models")
    public List<String> getModels(@PathVariable String id) throws Exception {
        API api = KeyService.exists(id);
        if(api == null){
            return null;
        }
        return KeyService.getModels(api);
    }
}
