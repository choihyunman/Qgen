package com.s12p31b204.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.s12p31b204.backend.domain.WorkBook;

public interface WorkBookRepository extends JpaRepository<WorkBook, Long> {
    @Query("SELECT w.user.userId FROM WorkBook w")
    Long findUserIdByWorkBookId(Long workBookId);

    List<WorkBook> findByUser_UserId(Long userId);
}
