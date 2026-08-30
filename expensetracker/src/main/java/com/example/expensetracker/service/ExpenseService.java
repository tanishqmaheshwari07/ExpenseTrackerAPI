package com.example.expensetracker.service;

import com.example.expensetracker.dto.ExpenseRequest;
import com.example.expensetracker.dto.ExpenseResponse;
import com.example.expensetracker.entity.Category;
import com.example.expensetracker.entity.Expense;
import com.example.expensetracker.entity.User;
import com.example.expensetracker.exception.ExpenseNotOwnedException;
import com.example.expensetracker.mapper.ExpenseMapper;
import com.example.expensetracker.repository.ExpenseRepository;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@AllArgsConstructor
@Transactional
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final UserService userService;

    // CREATE EXPENSE
    public ExpenseResponse createExpense(
            ExpenseRequest request) {

        User currentUser =
                userService.getCurrentUser();

        Expense expense = new Expense();

        expense.setAmount(request.getAmount());
        expense.setDescription(request.getDescription());
        expense.setCategory(request.getCategory());
        expense.setDate(request.getDate());

        expense.setUser(currentUser);

        Expense savedExpense =
                expenseRepository.save(expense);

        return ExpenseMapper.toResponse(savedExpense);
    }

    // GET EXPENSE BY ID
    @Transactional(readOnly = true)
    public ExpenseResponse getExpenseById(Long id) {

        User currentUser =
                userService.getCurrentUser();

        Expense expense =
                expenseRepository
                        .findByIdAndUserId(
                                id,
                                currentUser.getId()
                        )
                        .orElseThrow(() ->
                                new ExpenseNotOwnedException(
                                        "Expense not found or does not belong to you"
                                ));

        return ExpenseMapper.toResponse(expense);
    }

    // UPDATE EXPENSE
    public ExpenseResponse updateExpense(
            Long expenseId,
            ExpenseRequest request) {

        User currentUser =
                userService.getCurrentUser();

        Expense expense =
                expenseRepository
                        .findByIdAndUserId(
                                expenseId,
                                currentUser.getId()
                        )
                        .orElseThrow(() ->
                                new ExpenseNotOwnedException(
                                        "Expense does not belong to current user"
                                ));

        expense.setAmount(request.getAmount());
        expense.setDescription(request.getDescription());
        expense.setCategory(request.getCategory());
        expense.setDate(request.getDate());

        Expense updatedExpense =
                expenseRepository.save(expense);

        return ExpenseMapper.toResponse(updatedExpense);
    }

    // DELETE EXPENSE
    public void deleteExpense(Long expenseId) {

        User currentUser =
                userService.getCurrentUser();

        Expense expense =
                expenseRepository
                        .findByIdAndUserId(
                                expenseId,
                                currentUser.getId()
                        )
                        .orElseThrow(() ->
                                new ExpenseNotOwnedException(
                                        "Expense does not belong to current user"
                                ));

        expenseRepository.delete(expense);
    }

    // GET ALL EXPENSES OF CURRENT USER
    @Transactional(readOnly = true)
    public List<ExpenseResponse> getMyExpenses() {

        User currentUser =
                userService.getCurrentUser();

        List<Expense> expenses =
                expenseRepository.findByUserId(
                        currentUser.getId()
                );

        return expenses.stream()
                .map(ExpenseMapper::toResponse)
                .toList();
    }

    // PAGINATED EXPENSES
    @Transactional(readOnly = true)
    public Page<ExpenseResponse> findAll(
            Pageable pageable) {

        User currentUser =
                userService.getCurrentUser();

        return expenseRepository
                .findByUserId(
                        currentUser.getId(),
                        pageable
                )
                .map(ExpenseMapper::toResponse);
    }

    // CATEGORY FILTER + PAGINATION
    @Transactional(readOnly = true)
    public Page<ExpenseResponse> findByCategory(
            Category category,
            Pageable pageable) {

        User currentUser =
                userService.getCurrentUser();

        return expenseRepository
                .findByUserIdAndCategory(
                        currentUser.getId(),
                        category,
                        pageable
                )
                .map(ExpenseMapper::toResponse);
    }
}