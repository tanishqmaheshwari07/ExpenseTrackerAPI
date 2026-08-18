package com.example.expensetracker.controller;

import com.example.expensetracker.dto.UserRequest;
import com.example.expensetracker.dto.UserResponse;
import com.example.expensetracker.entity.User;
import com.example.expensetracker.service.UserService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    @PostMapping
    public UserResponse createUser(@RequestBody UserRequest userRequest){
        return userService.createUser(userRequest);
    }

    @GetMapping("/{id}")
    public UserResponse getUserById(@PathVariable Long id){
        return userService.getUserById(id);
    }

    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
    }

    @PutMapping("/{id}")
    public UserResponse updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserRequest userRequest){
        return userService.updateUser(id, userRequest);
    }

}
