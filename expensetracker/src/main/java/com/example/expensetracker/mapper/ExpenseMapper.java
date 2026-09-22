package com.example.expensetracker.mapper;

import com.example.expensetracker.dto.ExpenseResponse;
import com.example.expensetracker.entity.Expense;

public class ExpenseMapper {

    private ExpenseMapper() {
        // Utility class
    }

    public static ExpenseResponse toResponse(Expense expense) {
        if (expense == null) {
            return null;
        }
        return ExpenseResponse.builder()
                .id(expense.getId())
                .amount(expense.getAmount())
                .description(expense.getDescription())
                .category(expense.getCategory())
                .date(expense.getDate())
                .createdAt(expense.getCreatedAt())
                .updatedAt(expense.getUpdatedAt())
                .build();
    }
}
