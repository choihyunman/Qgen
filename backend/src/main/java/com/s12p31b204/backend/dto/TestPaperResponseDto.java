package com.s12p31b204.backend.dto;

import java.time.LocalDateTime;

import com.s12p31b204.backend.domain.TestPaper;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.ToString;

@Data
@Builder
@AllArgsConstructor
@ToString
public class TestPaperResponseDto {

    private Long testPaperId;

    private String title;

    private boolean choiceAns;
    private boolean shortAns;
    private boolean OXAns;
    private boolean wordAns;

    private int quantity;

    private LocalDateTime createAt;

    public static TestPaperResponseDto from(TestPaper testPaper) {
        return TestPaperResponseDto.builder()
                .testPaperId(testPaper.getTestPaperId())
                .title(testPaper.getTitle())
                .choiceAns(testPaper.isChoiceAns())
                .shortAns(testPaper.isShortAns())
                .OXAns(testPaper.isOXAns())
                .wordAns(testPaper.isWordAns())
                .quantity(testPaper.getQuantity())
                .createAt(testPaper.getCreateAt())
                .build();
    }
}
