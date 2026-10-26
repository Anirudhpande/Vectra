package com.example.demo.Auth;

public record AuthUserResponse (

    String provider,
    String providerID,
    String username,
    String name,
    String email
){}

