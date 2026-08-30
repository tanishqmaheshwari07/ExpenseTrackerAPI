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
        ExpenseResponse response = new ExpenseResponse();
        response.setId(expense.getId());
        response.setAmount(expense.getAmount());
        response.setDescription(expense.getDescription());
        response.setCategory(expense.getCategory());
        response.setDate(expense.getDate());
        return response;
    }
}
