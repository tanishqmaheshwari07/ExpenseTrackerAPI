package com.example.expensetracker.controller;

import com.example.expensetracker.config.JwtProperties;
import com.example.expensetracker.dto.ExpenseResponse;
import com.example.expensetracker.dto.ExpenseSummaryResponse;
import com.example.expensetracker.entity.Category;
import com.example.expensetracker.security.JwtAuthenticationFilter;
import com.example.expensetracker.service.ExpenseService;
import com.example.expensetracker.service.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ExpenseController.class)
@AutoConfigureMockMvc(addFilters = false)
class ExpenseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ExpenseService expenseService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockitoBean
    private JwtProperties jwtProperties;

    @Test
    @DisplayName("GET /api/expenses/my-expenses - Should return all user expenses")
    void getMyExpenses_Success() throws Exception {
        ExpenseResponse expenseResponse = ExpenseResponse.builder()
                .id(1L)
                .amount(new BigDecimal("100.00"))
                .description("Team lunch")
                .category(Category.FOOD)
                .date(LocalDate.of(2026, 9, 20))
                .build();

        when(expenseService.getMyExpenses()).thenReturn(List.of(expenseResponse));

        mockMvc.perform(get("/api/expenses/my-expenses")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].id").value(1))
                .andExpect(jsonPath("$.data[0].description").value("Team lunch"))
                .andExpect(jsonPath("$.data[0].amount").value(100.00));
    }

    @Test
    @DisplayName("GET /api/expenses/summary - Should return financial summary")
    void getExpenseSummary_Success() throws Exception {
        ExpenseSummaryResponse summary = ExpenseSummaryResponse.builder()
                .totalAmount(new BigDecimal("250.00"))
                .totalCount(3)
                .startDate(LocalDate.of(2026, 9, 1))
                .endDate(LocalDate.of(2026, 9, 30))
                .categoryBreakdown(Map.of(Category.FOOD, new BigDecimal("250.00")))
                .build();

        when(expenseService.getExpenseSummary(any(), any())).thenReturn(summary);

        mockMvc.perform(get("/api/expenses/summary")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalAmount").value(250.00))
                .andExpect(jsonPath("$.data.totalCount").value(3));
    }
}
