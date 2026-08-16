package com.example.expensetracker.dto;

import com.example.expensetracker.entity.Category;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class ExpenseResponse {
    private Long id;
    private BigDecimal amount;
    private String description;
    private Category category;
    private LocalDate date;

}
