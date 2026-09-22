package com.example.expensetracker.dto;

import com.example.expensetracker.entity.Category;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseSummaryResponse {

    private BigDecimal totalAmount;
    private long totalCount;
    private LocalDate startDate;
    private LocalDate endDate;
    private Map<Category, BigDecimal> categoryBreakdown;
    private Map<String, BigDecimal> monthlyBreakdown;
}
