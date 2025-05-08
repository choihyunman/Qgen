package com.s12p31b204.backend.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.s12p31b204.backend.domain.TestHistory;

@Repository
public interface TestHistoryRepository extends JpaRepository<TestHistory, Long> {

}
