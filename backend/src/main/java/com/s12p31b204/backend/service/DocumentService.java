package com.s12p31b204.backend.service;

import com.s12p31b204.backend.domain.Document;
import com.s12p31b204.backend.domain.WorkBook;
import com.s12p31b204.backend.dto.FindDocumentResponseDto;
import com.s12p31b204.backend.repository.DocumentRepository;
import com.s12p31b204.backend.repository.WorkBookRepository;
import com.s12p31b204.backend.util.CustomMultipartFile;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.jsoup.Jsoup;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentService {

    private final WorkBookRepository workBookRepository;
    private final DocumentRepository documentRepository;
    private final S3Service s3Service;

    @Transactional(readOnly = true)
    public List<FindDocumentResponseDto> getDocumentsByWorkBookId(Long workBookId) {
        return documentRepository.findAllByWorkBook_WorkBookId(workBookId)
                .stream()
                .map(document -> FindDocumentResponseDto.from(document, s3Service))
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

    @Transactional(readOnly = true)
    public FindDocumentResponseDto getDocument(Long documentId) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("문서를 찾을 수 없습니다."));
        return FindDocumentResponseDto.from(document, s3Service);
    }

    @Transactional
    public FindDocumentResponseDto convertTextToTxt(Long workBookId, String text) {
        // 1. 텍스트를 임시 파일로 저장
        String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        String fileName = "입력한 텍스트 " + today + ".txt";
        File tempFile = null;
        try {
            tempFile = File.createTempFile("user_text_", ".txt");
            try (FileWriter writer = new FileWriter(tempFile)) {
                writer.write(text);
            }

            // 2. MultipartFile로 변환
            MultipartFile multipartFile = new CustomMultipartFile(tempFile, fileName, "text/plain");

            String url = s3Service.upload(multipartFile, "documents");
            Long documentId = createDocument(multipartFile, workBookId, url);
            return getDocument(documentId);

        } catch (IOException e) {
            throw new RuntimeException("텍스트 파일 변환/업로드 실패: " + e.getMessage());
        } finally {
            if (tempFile != null && tempFile.exists()) {
                tempFile.delete();
            }
        }
    }

    @Transactional
    public FindDocumentResponseDto convertUrlToTxt(Long workBookId, String url) throws IOException {
        try {
            // 1. Jsoup으로 웹페이지 크롤링 및 텍스트 추출
            org.jsoup.nodes.Document doc = Jsoup.connect(url).get();
            String text = doc.text();
            String title = doc.title();

            if(text == null || text.isBlank() || text.length() < 100) {
                throw new RuntimeException("웹페이지의 내용을 추출할 수 없습니다.");
            }

            // 파일명에 사용할 수 없는 문자 제거 (예: \/:*?"<>|)
            String safeTitle = title.replaceAll("[\\\\/:*?\"<>|]", "");
            if (safeTitle.isBlank()) safeTitle = "URL";
            String fileName = "[URL] " + safeTitle + ".txt";

            // 2. 텍스트를 임시 파일로 저장
            File tempFile = null;
            try {
                tempFile = File.createTempFile("web_url_", ".txt");
                try (FileWriter writer = new FileWriter(tempFile)) {
                    writer.write(text);
                }
                MultipartFile multipartFile = new CustomMultipartFile(tempFile, fileName, "text/plain");
                String uploadedUrl = s3Service.upload(multipartFile, "documents");
                Long documentId = createDocument(multipartFile, workBookId, uploadedUrl);
                return getDocument(documentId);
            } finally {
                if (tempFile != null && tempFile.exists()) {
                    tempFile.delete();
                }
            }
        } catch (RuntimeException e) {
            log.error(e.getMessage());
            throw new RuntimeException(e.getMessage());
        } catch (Exception e) {
            log.error(e.getMessage());
            throw new IOException("웹페이지 크롤링/업로드 실패");
        }
    }

    @Transactional(readOnly = true)
    public Document getDocumentEntity(Long documentId) {
        return documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("문서를 찾을 수 없습니다."));
    }
}