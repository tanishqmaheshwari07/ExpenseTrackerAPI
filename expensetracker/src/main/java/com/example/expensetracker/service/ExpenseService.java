package com.example.expensetracker.service;

import com.example.expensetracker.dto.ExpenseRequest;
import com.example.expensetracker.dto.ExpenseResponse;
import com.example.expensetracker.entity.Expense;
import com.example.expensetracker.exception.ExpenseNotFoundException;
import com.example.expensetracker.repository.ExpenseRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@AllArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;


    public ExpenseResponse createExpense(ExpenseRequest expenseRequest){

        Expense expense = new Expense();

        expense.setAmount(expenseRequest.getAmount());
        expense.setDescription(expenseRequest.getDescription());
        expense.setCategory(expenseRequest.getCategory());
        expense.setDate(expenseRequest.getDate());

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


    public void deleteExpense(Long id){
        expenseRepository.deleteById(id);
    }



    public ExpenseResponse updateExpense(Long id, ExpenseRequest expenseRequest) {

        Expense existingExpense = expenseRepository.findById(id)
                .orElseThrow(() ->
                        new ExpenseNotFoundException(
                                "Expense with id " + id + " not found"
                        ));

        existingExpense.setAmount(expenseRequest.getAmount());
        existingExpense.setDescription(expenseRequest.getDescription());
        existingExpense.setCategory(expenseRequest.getCategory());
        existingExpense.setDate(expenseRequest.getDate());

        Expense updatedExpense = expenseRepository.save(existingExpense);

        ExpenseResponse response = new ExpenseResponse();

        response.setId(updatedExpense.getId());
        response.setAmount(updatedExpense.getAmount());
        response.setDescription(updatedExpense.getDescription());
        response.setCategory(updatedExpense.getCategory());
        response.setDate(updatedExpense.getDate());

        return response;
    }

}
