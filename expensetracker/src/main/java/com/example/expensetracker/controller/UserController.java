package com.example.expensetracker.controller;

import com.example.expensetracker.dto.UserRequest;
import com.example.expensetracker.dto.UserResponse;
import com.example.expensetracker.service.UserService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;


    // CREATE USER
    @PostMapping
    public ResponseEntity<UserResponse> createUser(
            @Valid @RequestBody UserRequest userRequest) {

        UserResponse response =
                userService.createUser(userRequest);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }


    // GET USER BY ID
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(
            @PathVariable Long id) {

        UserResponse response =
                userService.getUserById(id);

        return ResponseEntity.ok(response);
    }


    // UPDATE USER
    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserRequest userRequest) {

        UserResponse response =
                userService.updateUser(id, userRequest);

        return ResponseEntity.ok(response);
    }


    // DELETE USER
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(
            @PathVariable Long id) {

        userService.deleteUser(id);

        return ResponseEntity.noContent().build();
    }
}