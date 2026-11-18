package com.example.demo.attachments.controller;


import com.example.demo.attachments.dto.AttachmentResponse;
import com.example.demo.attachments.model.Attachment;
import com.example.demo.attachments.service.AttachmentService;
import com.example.demo.auth.service.CurrentUserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/attachments")
public class AttachmentControlller {

    private final AttachmentService attachmentService;
    private final CurrentUserService currentUserService;

    public AttachmentControlller(
            AttachmentService attachmentService,
            CurrentUserService currentUserService
    ){
        this.attachmentService = attachmentService;
        this.currentUserService = currentUserService;
    }

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<AttachmentResponse> upload(
            @RequestParam("file")MultipartFile file,
            Authentication authentication
            ) throws Exception{
        String userId = currentUserService.getCurrentUser(authentication).getId();

        Attachment attachment = attachmentService.upload(file, userId);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(AttachmentResponse.from(attachment));
    }

    @GetMapping
    public ResponseEntity<List<AttachmentResponse>> getLibrary(
            Authentication authentication
    ) {
        String userId = currentUserService.getCurrentUser(authentication).getId();

        List<AttachmentResponse> attachments = attachmentService.getUserAttachments(userId)
                .stream()
                .map(AttachmentResponse::from)
                .toList();

        return ResponseEntity.ok(attachments);
    }

    @GetMapping("/{attachmentId}")
    public ResponseEntity<AttachmentResponse> getAttachment(
            @PathVariable String attachmentId,
            Authentication authentication
    ) {
        String userId = currentUserService.getCurrentUser(authentication).getId();

        Attachment attachment = attachmentService.getAttachment(attachmentId, userId);

        return ResponseEntity.ok(AttachmentResponse.from(attachment));
    }

    @DeleteMapping("/{attachmentId}")
    public ResponseEntity<Void> deleteAttachment(
            @PathVariable String attachmentId,
            Authentication authentication
    ) throws IOException {
        String userId = currentUserService.getCurrentUser(authentication).getId();

        attachmentService.deleteAttachemnt(attachmentId, userId);
        return ResponseEntity.noContent().build();
    }













}
