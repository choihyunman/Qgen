package com.s12p31b204.backend.service;

import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.s12p31b204.backend.dto.CreateTestPaperRequestDto;
import com.s12p31b204.backend.dto.TestPaperResponseDto;
import com.s12p31b204.backend.dto.UpdateTestPaperRequestDto;
import com.s12p31b204.backend.domain.TestPaper;
import com.s12p31b204.backend.repository.TestPaperRepository;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@AllArgsConstructor
@Transactional
public class TestPaperService {

    private final TestPaperRepository testPaperRepository;

    public TestPaperResponseDto createTestPaper(CreateTestPaperRequestDto createTestPaperRequestDto) {
        TestPaper testPaper = new TestPaper(
                createTestPaperRequestDto.getTitle(),
                createTestPaperRequestDto.isChoiceAns(),
                createTestPaperRequestDto.isShortAns(),
                createTestPaperRequestDto.isOXAns(),
                createTestPaperRequestDto.isWordAns(),
                createTestPaperRequestDto.getQuantity());
        testPaper = testPaperRepository.save(testPaper);
        return TestPaperResponseDto.from(testPaper);
    }

    @Transactional(readOnly = true)
    public List<TestPaperResponseDto> findTestPaperByWorkBookId(Long workBookId) {
        List<TestPaper> testPapers = testPaperRepository.findByWorkBook_WorkBookId(workBookId);
        List<TestPaperResponseDto> response = new ArrayList<>();
        for(TestPaper paper : testPapers) {
            response.add(TestPaperResponseDto.from(paper));
        }
        return response;
    }
    public void removeTestPaper(Long testPaperId) {
        testPaperRepository.deleteById(testPaperId);
    }

    public TestPaperResponseDto updateTestPaper(UpdateTestPaperRequestDto updateTestPaperRequestDto) {
        TestPaper testPaper = testPaperRepository.findById(updateTestPaperRequestDto.getTestPaperId())
                .orElseThrow(() -> new NoSuchElementException("시험지를 찾을 수 없습니다."));
        testPaper.updateTestPaper(updateTestPaperRequestDto.getTitle());
        return TestPaperResponseDto.from(testPaper);
    }
}
