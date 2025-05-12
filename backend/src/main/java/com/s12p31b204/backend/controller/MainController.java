package com.s12p31b204.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.s12p31b204.backend.domain.User;
import com.s12p31b204.backend.dto.UserInfoResponseDto;
import com.s12p31b204.backend.oauth2.CustomOAuth2User;
import com.s12p31b204.backend.repository.UserRepository;
import com.s12p31b204.backend.util.ApiResponse;
import com.s12p31b204.backend.util.ResponseData;

import jakarta.servlet.http.HttpServletRequest;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@AllArgsConstructor
@RequestMapping("/api")
public class MainController {

    private final UserRepository userRepository;
    @GetMapping("/userinfo")
    public ResponseEntity<ResponseData<UserInfoResponseDto>> getUserInfo(@AuthenticationPrincipal CustomOAuth2User customOAuth2User, HttpServletRequest request) {
        if(customOAuth2User == null) {
            UserInfoResponseDto response = UserInfoResponseDto.builder()
                    .login(false)
                    .build();
            return ApiResponse.success(response, "로그인되어 있지 않습니다.", HttpStatus.OK, request.getRequestURI());
        }
        User user = userRepository.findByUsername(customOAuth2User.getUsername());
        UserInfoResponseDto response = UserInfoResponseDto.builder()
                .login(true)
                .googleEmail(user.getGoogleEmail())
                .nickname(user.getNickname())
                .build();
        return ApiResponse.success(response, "사용자 로그인 확인", HttpStatus.OK, request.getRequestURI());
    }
}
