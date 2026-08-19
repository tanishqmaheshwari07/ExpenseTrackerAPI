package com.example.expensetracker.controller;

import com.example.expensetracker.dto.ExpenseRequest;
import com.example.expensetracker.dto.ExpenseResponse;
import com.example.expensetracker.entity.Category;
import com.example.expensetracker.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
@RequestMapping("/api/expenses")
public class ExpenseController {

    private final ExpenseService expenseService;


    // CREATE EXPENSE
    @PostMapping("/user/{userId}")
    public ResponseEntity<ExpenseResponse> createExpense(
            @PathVariable Long userId,
            @Valid @RequestBody ExpenseRequest expenseRequest) {

        ExpenseResponse response =
                expenseService.createExpense(userId, expenseRequest);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }


    // GET ALL EXPENSES + PAGINATION + CATEGORY FILTER
    @GetMapping
    public ResponseEntity<Page<ExpenseResponse>> getExpenses(
            @RequestParam(required = false) Category category,
            Pageable pageable) {

        Page<ExpenseResponse> response;

        if (category != null) {
            response = expenseService.findByCategory(category, pageable);
        } else {
            response = expenseService.findAll(pageable);
        }

        return ResponseEntity.ok(response);
    }


    // GET EXPENSE BY ID
    @GetMapping("/{id}")
    public ResponseEntity<ExpenseResponse> getExpenseById(
            @PathVariable Long id) {

        ExpenseResponse response =
                expenseService.findById(id);

        return ResponseEntity.ok(response);
    }


    // UPDATE EXPENSE
    @PutMapping("/{expenseId}/user/{userId}")
    public ResponseEntity<ExpenseResponse> updateExpense(
            @PathVariable Long expenseId,
            @PathVariable Long userId,
            @Valid @RequestBody ExpenseRequest request) {

        ExpenseResponse response =
                expenseService.updateExpense(
                        expenseId,
                        userId,
                        request
                );

        return ResponseEntity.ok(response);
    }


    // DELETE EXPENSE
    @DeleteMapping("/{expenseId}/user/{userId}")
    public ResponseEntity<Void> deleteExpense(
            @PathVariable Long expenseId,
            @PathVariable Long userId) {

        expenseService.deleteExpense(expenseId, userId);

        return ResponseEntity.noContent().build();
    }


    // GET EXPENSES OF A SPECIFIC USER
    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<ExpenseResponse>> getExpensesByUser(
            @PathVariable Long userId,
            Pageable pageable) {

        Page<ExpenseResponse> response =
                expenseService.findByUserId(userId, pageable);

        return ResponseEntity.ok(response);
    }
}