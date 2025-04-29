package com.s12p31b204.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.s12p31b204.backend.domain.WorkBook;

public interface WorkBookRepository extends JpaRepository<WorkBook, Long> {
}
