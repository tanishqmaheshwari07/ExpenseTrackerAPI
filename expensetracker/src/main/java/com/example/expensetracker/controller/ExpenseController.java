package com.example.expensetracker.controller;

import com.example.expensetracker.dto.ApiResponse;
import com.example.expensetracker.dto.ExpenseRequest;
import com.example.expensetracker.dto.ExpenseResponse;
import com.example.expensetracker.dto.ExpenseSummaryResponse;
import com.example.expensetracker.dto.PagedResponse;
import com.example.expensetracker.entity.Category;
import com.example.expensetracker.service.ExpenseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
@Tag(name = "Expenses", description = "Endpoints for managing personal expenses, pagination, filtering, and analytics")
@SecurityRequirement(name = "BearerAuth")
public class ExpenseController {

    private final ExpenseService expenseService;

    @Operation(summary = "Create an expense", description = "Creates a new expense record scoped to the authenticated user")
    @PostMapping
    public ResponseEntity<ApiResponse<ExpenseResponse>> createExpense(
            @Valid @RequestBody ExpenseRequest request) {
        ExpenseResponse response = expenseService.createExpense(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(response, "Expense created successfully"));
    }

    @Operation(summary = "Get paginated expenses", description = "Fetch user expenses with optional category and date-range filters")
    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<ExpenseResponse>>> getExpenses(
            @Parameter(description = "Optional category filter")
            @RequestParam(required = false) Category category,
            @Parameter(description = "Optional start date filter (yyyy-MM-dd)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "Optional end date filter (yyyy-MM-dd)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Pageable pageable) {
        Page<ExpenseResponse> page = expenseService.getExpenses(category, startDate, endDate, pageable);
        return ResponseEntity.ok(ApiResponse.ok(PagedResponse.from(page), "Expenses fetched successfully"));
    }

    @Operation(summary = "Get financial analytics summary", description = "Provides total expenditure, category breakdown, and monthly trends")
    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<ExpenseSummaryResponse>> getExpenseSummary(
            @Parameter(description = "Start date for summary calculation")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date for summary calculation")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        ExpenseSummaryResponse summary = expenseService.getExpenseSummary(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.ok(summary, "Expense summary retrieved successfully"));
    }

    @Operation(summary = "Get expense by ID", description = "Retrieves details of a specific expense owned by the current user")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ExpenseResponse>> getExpenseById(
            @PathVariable Long id) {
        ExpenseResponse response = expenseService.getExpenseById(id);
        return ResponseEntity.ok(ApiResponse.ok(response, "Expense retrieved successfully"));
    }

    @Operation(summary = "Update an expense", description = "Updates details of an existing expense record")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ExpenseResponse>> updateExpense(
            @PathVariable Long id,
            @Valid @RequestBody ExpenseRequest request) {
        ExpenseResponse response = expenseService.updateExpense(id, request);
        return ResponseEntity.ok(ApiResponse.ok(response, "Expense updated successfully"));
    }

    @Operation(summary = "Delete an expense", description = "Soft-deletes an existing expense record")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteExpense(
            @PathVariable Long id) {
        expenseService.deleteExpense(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Expense deleted successfully"));
    }

    @Operation(summary = "Get all user expenses list", description = "Retrieves complete list of user expenses without pagination")
    @GetMapping("/my-expenses")
    public ResponseEntity<ApiResponse<List<ExpenseResponse>>> getMyExpenses() {
        List<ExpenseResponse> list = expenseService.getMyExpenses();
        return ResponseEntity.ok(ApiResponse.ok(list, "Expenses retrieved successfully"));
    }
}