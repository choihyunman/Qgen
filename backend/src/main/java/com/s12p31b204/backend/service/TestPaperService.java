package com.s12p31b204.backend.service;

import java.io.IOException;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Collections;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.atomic.AtomicBoolean;

import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import com.s12p31b204.backend.domain.Document;
import com.s12p31b204.backend.domain.Test;
import com.s12p31b204.backend.domain.TestPaper;
import com.s12p31b204.backend.domain.WorkBook;
import com.s12p31b204.backend.dto.CreateTestPaperEventDto;
import com.s12p31b204.backend.dto.CreateTestPaperRequestDto;
import com.s12p31b204.backend.dto.CreateTestRequestDto;
import com.s12p31b204.backend.dto.CreateTestResponseDto;
import com.s12p31b204.backend.dto.GenerateTestPaperRequestDto;
import com.s12p31b204.backend.dto.GenerateTestRequestDto;
import com.s12p31b204.backend.dto.TestPaperResponseDto;
import com.s12p31b204.backend.dto.UpdateTestPaperRequestDto;
import com.s12p31b204.backend.repository.DocumentRepository;
import com.s12p31b204.backend.repository.TestPaperRepository;
import com.s12p31b204.backend.repository.TestRepository;
import com.s12p31b204.backend.repository.WorkBookRepository;

import jakarta.persistence.EntityManager;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

@Slf4j
@Service
@AllArgsConstructor
@Transactional
public class TestPaperService {

    private final WorkBookRepository workBookRepository;
    private final TestPaperRepository testPaperRepository;
    private final DocumentRepository documentRepository;
    private final TestRepository testRepository;
    private final EmitterService emitterService;
    private final WebClient webClient;
    private final EntityManager entityManager;

    public TestPaperResponseDto generateTestPaper(GenerateTestPaperRequestDto generateTestPaperRequestDto, Long userId) throws Exception {
        WorkBook workBook = workBookRepository.findById(generateTestPaperRequestDto.getWorkBookId())
                .orElseThrow(() -> new NoSuchElementException("해당 문제집을 찾을 수 없습니다"));

        TestPaper testPaper = new TestPaper(
                workBook,
                generateTestPaperRequestDto.getTitle(),
                generateTestPaperRequestDto.getChoiceAns(),
                generateTestPaperRequestDto.getShortAns(),
                generateTestPaperRequestDto.getOxAns(),
                0,
                generateTestPaperRequestDto.getQuantity());
        testPaper = testPaperRepository.save(testPaper);

        List<String> s3Urls = new ArrayList<>();
        for(Long documentId : generateTestPaperRequestDto.getDocumentIds()) {
            Document document = documentRepository.findById(documentId).orElseThrow(() -> {
                throw new NoSuchElementException("해당 자료를 찾을 수 없습니다. : " + documentId);
            });
            s3Urls.add(document.getDocumentURL());
        }

        if(s3Urls.isEmpty()) {
            throw new IllegalArgumentException("자료가 준비되지 않았습니다. : " + testPaper.getTitle());
        }

        List<Test> tests = Collections.synchronizedList(new ArrayList<>());
        TestPaper savedTestPaper = testPaper;
        entityManager.flush();

        try {
            CompletableFuture.runAsync(() -> {
                log.info("Test Generate Request");
                CreateTestResponseDto response = webClient.post()
                        .uri("/api/ai/search/{testPaperId}/", savedTestPaper.getTestPaperId())
                        .bodyValue(new GenerateTestRequestDto(s3Urls, savedTestPaper.getChoiceAns(), savedTestPaper.getOxAns(), savedTestPaper.getShortAns()))
                        .exchangeToMono((apiResponse) -> {
                            if(apiResponse.statusCode().is2xxSuccessful()) {
                                return apiResponse.bodyToMono(CreateTestResponseDto.class);
                            } else {
                                return Mono.error(new RuntimeException("생성 중 오류 발생"));
                            }
                        })
                        .timeout(Duration.ofMinutes(5))
                        .block();
                log.info("questions created");
                log.info("saving questions...");
                for(CreateTestResponseDto.Data data : response.getData()) {
                    if(data.getType() == Test.Type.TYPE_CHOICE) {
                        String explanation = null;
                        if(data.getExplanation() != null) {
                            explanation = "";
                            for(int i = 0; i < data.getExplanation().size(); i++) {
                                String ex = data.getExplanation().get(i);
                                explanation += ex;
                                if(i != data.getExplanation().size() - 1) {
                                    explanation += "///";
                                }
                            }
                        }
                        tests.add(new Test(savedTestPaper, data.getType(), data.getQuestion(), explanation, data.getExplanationType(),
                                data.getOption().get(0), data.getOption().get(1),
                                data.getOption().get(2), data.getOption().get(3),
                                data.getAnswer(), data.getComment()));

                    } else {
                        String aliases = null;
                        if(data.getAliases() != null) {
                            aliases = "";
                            for(int i = 0; i < data.getAliases().size(); i++) {
                                String alias = data.getAliases().get(i);
                                aliases += alias;
                                if(i != data.getAliases().size() - 1) {
                                    aliases += "///";
                                }
                            }
                        }
                        tests.add(new Test(savedTestPaper, data.getType(), data.getQuestion(),
                                aliases, data.getAnswer(), data.getComment()));
                    }
                }


                testRepository.saveAll(tests);
                emitterService.sendEvent(userId,
                        "testpaper created",
                        new CreateTestPaperEventDto(savedTestPaper.getTestPaperId(),
                                savedTestPaper.getTitle(),
                                "COMPLETED"));
            });
        } catch (WebClientResponseException e) {
            HttpStatusCode statusCode = e.getStatusCode();
            String responseBody = e.getResponseBodyAsString();
            log.error(statusCode + " " + responseBody);
            emitterService.sendEvent(userId,
                    "testpaper created",
                    new CreateTestPaperEventDto(savedTestPaper.getTestPaperId(),
                            savedTestPaper.getTitle(),
                            "FAILED"));
        } catch (Exception e) {
            log.error(e.getMessage());
            emitterService.sendEvent(userId,
                    "testpaper created",
                    new CreateTestPaperEventDto(savedTestPaper.getTestPaperId(),
                            savedTestPaper.getTitle(),
                            "FAILED"));
        }

        return TestPaperResponseDto.from(testPaper);
    }


    public TestPaperResponseDto createTestPaper(CreateTestPaperRequestDto createTestPaperRequestDto, Long userId) {
        WorkBook workBook = workBookRepository.findById(createTestPaperRequestDto.getWorkBookId())
                .orElseThrow(() -> new NoSuchElementException("해당 문제집을 찾을 수 없습니다"));

        TestPaper testPaper = new TestPaper(
                workBook,
                createTestPaperRequestDto.getTitle(),
                createTestPaperRequestDto.getChoiceAns(),
                createTestPaperRequestDto.getShortAns(),
                createTestPaperRequestDto.getOxAns(),
                0,
                createTestPaperRequestDto.getQuantity());
        testPaper = testPaperRepository.save(testPaper);
        entityManager.flush();

        AtomicBoolean isSaved = new AtomicBoolean(false);

        List<Test> tests = Collections.synchronizedList(new ArrayList<>());

        List<CompletableFuture<Void>> futures = new ArrayList<>();
        int choiceAns = testPaper.getChoiceAns();
        int oxAns = testPaper.getOxAns();
        int shortAns = testPaper.getShortAns();

        while(choiceAns + oxAns + shortAns >= 10) {
            int rqQuantity = 10;
            int rqChoice = 0;
            int rqOx = 0;
            int rqShort = 0;

            if(choiceAns > 0) {
                rqChoice = Math.min(choiceAns, rqQuantity);
                choiceAns -= rqChoice;
                rqQuantity -= rqChoice;
            }

            if(oxAns > 0 && rqQuantity > 0) {
                rqOx = Math.min(oxAns, rqQuantity);
                oxAns -= rqOx;
                rqQuantity -= rqOx;
            }

            if(shortAns > 0 && rqQuantity > 0) {
                rqShort = Math.min(shortAns, rqQuantity);
                shortAns -= rqShort;
                rqQuantity -= rqShort;
            }

            futures.add(createTest(userId, testPaper, tests, rqChoice, rqOx, rqShort, testPaper.getQuantity(), isSaved));
        }
        if(choiceAns + oxAns + shortAns > 0) {
            futures.add(createTest(userId, testPaper, tests, choiceAns, oxAns, shortAns, testPaper.getQuantity(), isSaved));
        }

        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]));

        return TestPaperResponseDto.from(testPaper);
    }

    @Transactional(readOnly = true)
    public List<TestPaperResponseDto> findTestPaperByWorkBookId(Long workBookId) throws Exception {
            WorkBook workBook = workBookRepository.findById(workBookId).orElseThrow(() -> new NoSuchElementException("해당 문제집을 찾을 수 없습니다"));
            List<TestPaper> testPapers = testPaperRepository.findAllByWorkBook_WorkBookId(workBookId);
            if(testPapers.isEmpty()) {
                return null;
            }
            List<TestPaperResponseDto> response = new ArrayList<>();
            for(TestPaper paper : testPapers) {
                response.add(TestPaperResponseDto.from(paper));
            }
            return response;
    }

    @Transactional(readOnly = true)
    public TestPaper findTestPaperById(Long testPaperId) throws Exception {
        return testPaperRepository.findById(testPaperId).orElseThrow(
                () -> new NoSuchElementException("시험지를 찾을 수 없습니다.")
        );
    }

    @Transactional(readOnly = true)
    public Long findWorkBookByTestPaperId(Long testPaperId) {
        return testPaperRepository.findWorkBookIdByTestPaperId(testPaperId);
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

    public CompletableFuture<Void> createTest(Long userId, TestPaper testPaper, List<Test> tests, int choiceAns, int oxAns, int shortAns, int quantity, AtomicBoolean isSaved) {
        return CompletableFuture.runAsync(() -> {
            try {
                log.info("Test Generate Request");
                CreateTestResponseDto response = webClient.post()
                        .uri("/api/ai/chatgpt/{testPaperId}/", testPaper.getTestPaperId())
                        .bodyValue(new CreateTestRequestDto(choiceAns, oxAns, shortAns))
                        .retrieve()
                        .bodyToMono(CreateTestResponseDto.class)
                        .timeout(Duration.ofMinutes(5))
                        .block();
                for(CreateTestResponseDto.Data data : response.getData()) {
                    if(data.getType() == Test.Type.TYPE_CHOICE) {
                        String explanation = null;
                        if(data.getExplanation() != null) {
                            explanation = "";
                            for(int i = 0; i < data.getExplanation().size(); i++) {
                                String ex = data.getExplanation().get(i);
                                explanation += ex;
                                if(i != data.getExplanation().size() - 1) {
                                    explanation += "///";
                                }
                            }
                        }
                        tests.add(new Test(testPaper, data.getType(), data.getQuestion(), explanation, data.getExplanationType(),
                                data.getOption().get(0), data.getOption().get(1),
                                data.getOption().get(2), data.getOption().get(3),
                                data.getAnswer(), data.getComment()));
                    } else {
                        String aliases = null;
                        if(data.getAliases() != null) {
                            aliases = "";
                            for(int i = 0; i < data.getAliases().size(); i++) {
                                String alias = data.getAliases().get(i);
                                aliases += alias;
                                if(i != data.getAliases().size() - 1) {
                                    aliases += "///";
                                }
                            }
                        }
                        tests.add(new Test(testPaper, data.getType(), data.getQuestion(), aliases,
                                data.getAnswer(), data.getComment()));
                    }
                }

                // 문제를 모두 모으면 저장 -> 동시성 해결(Atomic Type) , synchronyzed 사용도 가능
                if (tests.size() == quantity && isSaved.compareAndSet(false, true)) {
                    testRepository.saveAll(tests);
                    emitterService.sendEvent(
                            userId,
                            "testpaper created",
                            new CreateTestPaperEventDto(testPaper.getTestPaperId(),
                                    testPaper.getTitle(),
                                    "COMPLETED"));
                }
            } catch (Exception e) {
                emitterService.sendEvent(
                        userId,
                        "testpaper created",
                        new CreateTestPaperEventDto(testPaper.getTestPaperId(),
                                testPaper.getTitle(),
                                "FAILED"));
            }
        });
    }

    public String imageToBase64(String classpathResource) throws IOException {
        ClassPathResource resource = new ClassPathResource(classpathResource);
        byte[] bytes = FileCopyUtils.copyToByteArray(resource.getInputStream());
        return Base64.getEncoder().encodeToString(bytes);
    }
}
