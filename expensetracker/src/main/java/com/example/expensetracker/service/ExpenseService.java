package com.example.expensetracker.service;

import com.example.expensetracker.entity.Expense;
import com.example.expensetracker.exception.ExpenseNotFoundException;
import com.example.expensetracker.repository.ExpenseRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import com.example.expensetracker.exception.ExpenseNotFoundException;

import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;

    public Expense createExpense(Expense expense){
        return expenseRepository.save(expense);
    }

    public List<Expense> findAll(){
        return expenseRepository.findAll();
    }

    public Expense findById(Long id){
        return expenseRepository.findById(id)
                .orElseThrow(() -> new ExpenseNotFoundException("Exception with id" + id + "not found"));
    }

    public void deleteExpense(Long id){
        expenseRepository.deleteById(id);
    }

    public Expense updateExpense(Long id, Expense expense){
        Expense existingExpense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        existingExpense.setAmount(expense.getAmount());
        existingExpense.setDescription(expense.getDescription());
        existingExpense.setCategory(expense.getCategory());
        existingExpense.setDate(expense.getDate());

        return expenseRepository.save(existingExpense);
    }
}
