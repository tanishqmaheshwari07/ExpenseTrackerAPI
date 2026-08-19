package com.example.expensetracker.exception;

public class ExpenseNotOwnedException extends RuntimeException {

    public ExpenseNotOwnedException(String message) {
        super(message);
    }
}