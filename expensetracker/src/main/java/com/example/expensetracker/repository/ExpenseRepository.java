package com.example.expensetracker.repository;

import com.example.expensetracker.entity.Category;
import com.example.expensetracker.entity.Expense;
import com.example.expensetracker.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByUser(User user);
    List<Expense> findByUserId(Long userId);

    Page<Expense> findByUser(User user, Pageable pageable);
    Page<Expense> findByUserId(Long userId, Pageable pageable);

    Page<Expense> findByUserAndCategory(User user, Category category, Pageable pageable);
    Page<Expense> findByUserIdAndCategory(Long userId, Category category, Pageable pageable);

    Optional<Expense> findByIdAndUserId(Long id, Long userId);
}