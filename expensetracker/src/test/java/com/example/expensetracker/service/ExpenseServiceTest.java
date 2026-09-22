package com.example.expensetracker.service;

import com.example.expensetracker.dto.ExpenseRequest;
import com.example.expensetracker.dto.ExpenseResponse;
import com.example.expensetracker.dto.ExpenseSummaryResponse;
import com.example.expensetracker.entity.Category;
import com.example.expensetracker.entity.Expense;
import com.example.expensetracker.entity.Role;
import com.example.expensetracker.entity.User;
import com.example.expensetracker.exception.ExpenseNotFoundException;
import com.example.expensetracker.repository.ExpenseRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExpenseServiceTest {

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private UserService userService;

    @InjectMocks
    private ExpenseService expenseService;

    private User testUser;
    private Expense testExpense;
    private ExpenseRequest expenseRequest;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .name("Alex Doe")
                .email("alex@example.com")
                .role(Role.ROLE_USER)
                .build();

        testExpense = Expense.builder()
                .id(100L)
                .amount(new BigDecimal("45.50"))
                .description("Grocery shopping")
                .category(Category.FOOD)
                .date(LocalDate.of(2026, 9, 20))
                .user(testUser)
                .isDeleted(false)
                .build();

        expenseRequest = new ExpenseRequest();
        expenseRequest.setAmount(new BigDecimal("45.50"));
        expenseRequest.setDescription("Grocery shopping");
        expenseRequest.setCategory(Category.FOOD);
        expenseRequest.setDate(LocalDate.of(2026, 9, 20));
    }

    @Test
    @DisplayName("Should successfully create an expense for authenticated user")
    void createExpense_Success() {
        when(userService.getCurrentUser()).thenReturn(testUser);
        when(expenseRepository.save(any(Expense.class))).thenReturn(testExpense);

        ExpenseResponse response = expenseService.createExpense(expenseRequest);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(100L);
        assertThat(response.getAmount()).isEqualTo(new BigDecimal("45.50"));
        assertThat(response.getCategory()).isEqualTo(Category.FOOD);
        verify(expenseRepository, times(1)).save(any(Expense.class));
    }

    @Test
    @DisplayName("Should retrieve expense by ID when owned by current user")
    void getExpenseById_Success() {
        when(userService.getCurrentUser()).thenReturn(testUser);
        when(expenseRepository.findByIdAndUserId(100L, 1L)).thenReturn(Optional.of(testExpense));

        ExpenseResponse response = expenseService.getExpenseById(100L);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(100L);
        assertThat(response.getDescription()).isEqualTo("Grocery shopping");
    }

    @Test
    @DisplayName("Should throw ExpenseNotFoundException when expense does not exist")
    void getExpenseById_NotFound_ThrowsException() {
        when(userService.getCurrentUser()).thenReturn(testUser);
        when(expenseRepository.findByIdAndUserId(999L, 1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> expenseService.getExpenseById(999L))
                .isInstanceOf(ExpenseNotFoundException.class)
                .hasMessageContaining("not found");
    }

    @Test
    @DisplayName("Should calculate financial summary accurately across date ranges")
    void getExpenseSummary_Success() {
        Expense expense2 = Expense.builder()
                .id(101L)
                .amount(new BigDecimal("15.00"))
                .description("Bus ticket")
                .category(Category.TRAVEL)
                .date(LocalDate.of(2026, 9, 21))
                .user(testUser)
                .isDeleted(false)
                .build();

        LocalDate start = LocalDate.of(2026, 9, 1);
        LocalDate end = LocalDate.of(2026, 9, 30);

        when(userService.getCurrentUser()).thenReturn(testUser);
        when(expenseRepository.findByUserIdAndDateBetween(1L, start, end))
                .thenReturn(List.of(testExpense, expense2));

        ExpenseSummaryResponse summary = expenseService.getExpenseSummary(start, end);

        assertThat(summary).isNotNull();
        assertThat(summary.getTotalAmount()).isEqualTo(new BigDecimal("60.50"));
        assertThat(summary.getTotalCount()).isEqualTo(2);
        assertThat(summary.getCategoryBreakdown().get(Category.FOOD)).isEqualTo(new BigDecimal("45.50"));
        assertThat(summary.getCategoryBreakdown().get(Category.TRAVEL)).isEqualTo(new BigDecimal("15.00"));
    }
}
