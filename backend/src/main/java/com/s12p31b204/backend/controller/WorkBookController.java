package com.s12p31b204.backend.controller;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.s12p31b204.backend.dto.WorkBookRequestDto;
import com.s12p31b204.backend.dto.WorkBookResponseDto;
import com.s12p31b204.backend.service.WorkBookService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/workbooks")
@RequiredArgsConstructor
public class WorkBookController {

    private final WorkBookService workBookService;

    @PostMapping("/{userId}")
    public WorkBookResponseDto createWorkBook(@PathVariable Long userId, @RequestBody WorkBookRequestDto requestDto) {
        return workBookService.createWorkBook(userId, requestDto);
    }    
}