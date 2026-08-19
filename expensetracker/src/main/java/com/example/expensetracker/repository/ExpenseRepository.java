package com.example.expensetracker.repository;

import com.example.expensetracker.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.expensetracker.entity.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    Page<Expense> findByUserId(Long userId, Pageable pageable);

    Page<Expense> findByCategory(
            Category category,
            Pageable pageable
    );
}