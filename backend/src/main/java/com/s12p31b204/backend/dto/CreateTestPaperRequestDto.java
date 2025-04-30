package com.s12p31b204.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class CreateTestPaperRequestDto {
    private Long workBookId;
    private String title;
    private boolean choiceAns;
    private boolean shortAns;
    private boolean OXAns;
    private boolean wordAns;
    private int quantity;
}
