package com.example.expensetracker.service;

import com.example.expensetracker.dto.ExpenseRequest;
import com.example.expensetracker.dto.ExpenseResponse;
import com.example.expensetracker.entity.Category;
import com.example.expensetracker.entity.Expense;
import com.example.expensetracker.entity.User;
import com.example.expensetracker.exception.ExpenseNotFoundException;
import com.example.expensetracker.exception.ExpenseNotOwnedException;
import com.example.expensetracker.exception.UserNotFoundException;
import com.example.expensetracker.repository.ExpenseRepository;
import com.example.expensetracker.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
@AllArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;


    public ExpenseResponse createExpense(Long userId, ExpenseRequest request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "User with id " + userId + " not found"
                        ));

        Expense expense = new Expense();

        expense.setAmount(request.getAmount());
        expense.setDescription(request.getDescription());
        expense.setCategory(request.getCategory());
        expense.setDate(request.getDate());

        expense.setUser(user);

        Expense savedExpense = expenseRepository.save(expense);

        ExpenseResponse response = new ExpenseResponse();

        response.setId(savedExpense.getId());
        response.setAmount(savedExpense.getAmount());
        response.setDescription(savedExpense.getDescription());
        response.setCategory(savedExpense.getCategory());
        response.setDate(savedExpense.getDate());

        return response;
    }



    public List<ExpenseResponse> findAll() {

        List<Expense> expenses = expenseRepository.findAll();

        return expenses.stream()
                .map(expense -> {
                    ExpenseResponse response = new ExpenseResponse();

                    response.setId(expense.getId());
                    response.setAmount(expense.getAmount());
                    response.setDescription(expense.getDescription());
                    response.setCategory(expense.getCategory());
                    response.setDate(expense.getDate());

                    return response;
                })
                .toList();
    }



    public ExpenseResponse findById(Long id) {

        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() ->
                        new ExpenseNotFoundException("Expense with id " + id + " not found"));

        ExpenseResponse response = new ExpenseResponse();

        response.setId(expense.getId());
        response.setAmount(expense.getAmount());
        response.setDescription(expense.getDescription());
        response.setCategory(expense.getCategory());
        response.setDate(expense.getDate());

        return response;
    }


    public void deleteExpense(Long expenseId, Long userId){

        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() ->
                        new ExpenseNotFoundException(
                                "Expense with id " + expenseId + " not found"
                        ));

        if (!expense.getUser().getId().equals(userId)) {
            throw new ExpenseNotOwnedException(
                    "Expense does not belong to this user"
            );
        }

        expenseRepository.delete(expense);

    }




    public ExpenseResponse updateExpense(Long expenseId, Long userId, ExpenseRequest request) {

        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() ->
                        new ExpenseNotFoundException(
                                "Expense with id " + expenseId + " not found"
                        ));
        if(!expense.getUser().getId().equals(userId)){
            throw new RuntimeException("Expense does not belong to this user");
        }

        expense.setAmount(request.getAmount());
        expense.setDescription(request.getDescription());
        expense.setCategory(request.getCategory());
        expense.setDate(request.getDate());

        Expense updatedExpense = expenseRepository.save(expense);

        ExpenseResponse response = new ExpenseResponse();

        response.setId(updatedExpense.getId());
        response.setAmount(updatedExpense.getAmount());
        response.setDescription(updatedExpense.getDescription());
        response.setCategory(updatedExpense.getCategory());
        response.setDate(updatedExpense.getDate());

        return response;

    }

    public Page<ExpenseResponse> findByUserId(
            Long userId,
            Pageable pageable) {

        userRepository.findById(userId)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "User with id " + userId + " not found"
                        ));

        Page<Expense> expenses =
                expenseRepository.findByUserId(userId, pageable);

        return expenses.map(expense -> {
            ExpenseResponse response = new ExpenseResponse();

            response.setId(expense.getId());
            response.setAmount(expense.getAmount());
            response.setDescription(expense.getDescription());
            response.setCategory(expense.getCategory());
            response.setDate(expense.getDate());

            return response;
        });
    }

    public Page<ExpenseResponse> findAll(Pageable pageable){

        Page<Expense> expenses = expenseRepository.findAll(pageable);

        return expenses.map(expense -> {
            ExpenseResponse response = new ExpenseResponse();

            response.setId(expense.getId());
            response.setAmount(expense.getAmount());
            response.setDescription(expense.getDescription());
            response.setCategory(expense.getCategory());
            response.setDate(expense.getDate());

            return response;
        });

    }

    public Page<ExpenseResponse> findByCategory(
            Category category,
            Pageable pageable){

        Page<Expense> expenses =
                expenseRepository.findByCategory(category, pageable);

        return expenses.map(expense -> {
            ExpenseResponse response = new ExpenseResponse();

            response.setId(expense.getId());
            response.setAmount(expense.getAmount());
            response.setDescription(expense.getDescription());
            response.setCategory(expense.getCategory());
            response.setDate(expense.getDate());

            return response;
        });
    }

}
