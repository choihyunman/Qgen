package com.s12p31b204.backend.controller;

import java.io.IOException;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.s12p31b204.backend.repository.WorkBookRepository;
import com.s12p31b204.backend.domain.Document;
import com.s12p31b204.backend.domain.WorkBook;
import com.s12p31b204.backend.repository.DocumentRepository;
import com.s12p31b204.backend.service.S3Service;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/document")
public class DocumentController {

    private final S3Service s3Service;
    private final DocumentRepository documentRepository;
    private final WorkBookRepository workBookRepository;

    @PostMapping("/upload")
    public ResponseEntity<Long> uploadDocument(
        @RequestParam("file") MultipartFile file,
        @RequestParam("workBookId") Long workBookId
    ) throws IOException {

        String url = s3Service.upload(file, "documents");

        WorkBook workBook = workBookRepository.findById(workBookId)
            .orElseThrow(() -> new IllegalArgumentException("워크북 없음"));

        Document doc = new Document(
            workBook,
            file.getOriginalFilename(),
            file.getSize(),
            file.getContentType(),
            url
        );

        documentRepository.save(doc);
        return ResponseEntity.ok(doc.getDocumentId());
    }
}
