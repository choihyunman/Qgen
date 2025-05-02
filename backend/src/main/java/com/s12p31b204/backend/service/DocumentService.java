package com.s12p31b204.backend.service;

import com.s12p31b204.backend.dto.DocumentDto;
import com.s12p31b204.backend.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;

    @Transactional(readOnly = true)
    public List<DocumentDto> getDocumentsByWorkBookId(Long workBookId) {
        return documentRepository.findByWorkBook_WorkBookId(workBookId)
                .stream()
                .map(DocumentDto::new)
                .collect(Collectors.toList());
    }
}