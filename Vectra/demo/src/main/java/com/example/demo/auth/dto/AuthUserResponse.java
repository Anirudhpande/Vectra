package com.example.demo.auth.dto;

public record AuthUserResponse (

    String provider,
    String providerID,
    String username,
    String name,
    String email
){}

