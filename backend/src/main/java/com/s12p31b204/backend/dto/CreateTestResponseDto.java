package com.s12p31b204.backend.dto;

import java.util.List;

import com.s12p31b204.backend.domain.Test;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class CreateTestResponseDto {
    private boolean success;
    private List<Data> data;

    @lombok.Data
    @NoArgsConstructor
    @AllArgsConstructor
    @ToString
    public static class Data {
        private String question;
        private Test.Type type;
        private List<String> option;
        private String answer;
        private String comment;
    }
}
