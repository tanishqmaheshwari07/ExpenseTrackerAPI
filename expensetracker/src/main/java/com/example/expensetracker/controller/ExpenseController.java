package com.example.expensetracker.controller;

import com.example.expensetracker.dto.ExpenseRequest;
import com.example.expensetracker.dto.ExpenseResponse;
import com.example.expensetracker.entity.Expense;
import com.example.expensetracker.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/api/expenses")
public class ExpenseController {

    private final ExpenseService expenseService;

    @PostMapping("/user/{userId}")
    public ExpenseResponse createExpense(
            @PathVariable Long userId,
            @Valid @RequestBody ExpenseRequest expenseRequest) {

        return expenseService.createExpense(userId, expenseRequest);
    }

    @GetMapping
    public List<ExpenseResponse> getExpenses(){
        return expenseService.findAll();
    }
    @GetMapping("/{id}")
    public ExpenseResponse getExpenseById(@PathVariable Long id){
        return expenseService.findById(id);
    }

    @DeleteMapping("/{id}")
    public void deleteExpense(@PathVariable Long id){
        expenseService.deleteExpense(id);
    }

    @PutMapping("/{id}")
    public ExpenseResponse updateExpense(
            @PathVariable Long id,
            @Valid @RequestBody ExpenseRequest expenseRequest) {

        return expenseService.updateExpense(id, expenseRequest);
    }
}
