package com.example.expensetracker.mapper;

import com.example.expensetracker.dto.UserResponse;
import com.example.expensetracker.entity.User;

public class UserMapper {

    private UserMapper() {
        // Utility class
    }

    public static UserResponse toResponse(User user) {
        if (user == null) {
            return null;
        }
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        return response;
    }
}
