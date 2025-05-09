package com.s12p31b204.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.s12p31b204.backend.dto.FindNoteTestPaperResponseDto;
import com.s12p31b204.backend.dto.FindNoteTestResponseDto;
import com.s12p31b204.backend.dto.UpdateNoteMemoRequestDto;
import com.s12p31b204.backend.service.NoteService;
import com.s12p31b204.backend.util.ApiResponse;
import com.s12p31b204.backend.util.ResponseData;

import jakarta.servlet.http.HttpServletRequest;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@AllArgsConstructor
@RequestMapping("/api/note")
public class NoteController {

    private final NoteService noteService;

    @GetMapping("/{workBookId}")
    public ResponseEntity<ResponseData<List<FindNoteTestPaperResponseDto>>> getNoteTestPaper(@PathVariable Long workBookId, HttpServletRequest request) {
        try {
            return ApiResponse.success(noteService.getNoteTestPaperByWorkBookId(workBookId), "success", HttpStatus.OK, request.getRequestURI());
        } catch (Exception e) {
            return ApiResponse.failure(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR, request.getRequestURI());
        }
    }

    @GetMapping("/detail/{testId}")
    public ResponseEntity<ResponseData<FindNoteTestResponseDto>> getNoteTest(@PathVariable Long testId, HttpServletRequest request) {
        try {
            return ApiResponse.success(noteService.getNoteTest(testId), "success", HttpStatus.OK, request.getRequestURI());
        } catch (Exception e) {
            return ApiResponse.failure(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR, request.getRequestURI());
        }
    }

    @PatchMapping("/{testId}/memo")
    public ResponseEntity<ResponseData<Void>> updateNoteMemo(@PathVariable Long testId, @RequestBody UpdateNoteMemoRequestDto memoRequest, HttpServletRequest request) {
        try {
            noteService.updateNoteMemo(testId, memoRequest);
            return ApiResponse.success(null, "success", HttpStatus.OK, request.getRequestURI());
        } catch (Exception e) {
            return ApiResponse.failure(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR, request.getRequestURI());
        }
    }

    @PatchMapping("/{testId}/memo/remove")
    public ResponseEntity<ResponseData<Void>> removeNoteMemo(@PathVariable Long testId, HttpServletRequest request) {
        try {
            noteService.removeNoteMemo(testId);
            return ApiResponse.success(null, "success", HttpStatus.OK, request.getRequestURI());
        } catch (Exception e) {
            return ApiResponse.failure(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR, request.getRequestURI());
        }
    }

    
}