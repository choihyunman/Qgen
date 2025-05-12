package com.s12p31b204.backend.service;

import com.s12p31b204.backend.domain.Document;
import com.s12p31b204.backend.domain.WorkBook;
import com.s12p31b204.backend.dto.DocumentDto;
import com.s12p31b204.backend.repository.DocumentRepository;
import com.s12p31b204.backend.repository.WorkBookRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final WorkBookRepository workBookRepository;
    private final DocumentRepository documentRepository;
    private final S3Service s3Service;

    @Transactional(readOnly = true)
    public List<DocumentDto> getDocumentsByWorkBookId(Long workBookId) {
        return documentRepository.findAllByWorkBook_WorkBookId(workBookId)
                .stream()
                .map(DocumentDto::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public Long createDocument(MultipartFile file, Long workBookId, String url) {
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
        return doc.getDocumentId();
    }

    @Transactional
    public void deleteDocumentWithS3File(Long documentId) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("문서를 찾을 수 없습니다."));

        // 1. S3 파일 먼저 삭제
        s3Service.deleteFileFromS3(document.getDocumentURL());
        
        // 2. DB 레코드 삭제
        documentRepository.delete(document);
    }
}