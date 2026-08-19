package com.example.expensetracker.service;

import com.example.expensetracker.dto.UserRequest;
import com.example.expensetracker.dto.UserResponse;
import com.example.expensetracker.entity.User;
import com.example.expensetracker.exception.UserNotFoundException;
import com.example.expensetracker.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserResponse createUser(UserRequest userRequest) {

        User user = new User();

        user.setName(userRequest.getName());
        user.setEmail(userRequest.getEmail());
        user.setPassword(userRequest.getPassword());

        User savedUser = userRepository.save(user);

        UserResponse response = new UserResponse();

        response.setId(savedUser.getId());
        response.setName(savedUser.getName());
        response.setEmail(savedUser.getEmail());

        return response;
    }

    public UserResponse getUserById(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "User with id " + id + " not found"
                        ));

        UserResponse response = new UserResponse();

        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());

        return response;
    }

    public void deleteUser(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "User with id " + id + " not found"
                        ));

        userRepository.delete(user);
    }

    public UserResponse updateUser(
            Long id,
            UserRequest userRequest) {

        User existingUser = userRepository.findById(id)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "User with id " + id + " not found"
                        ));

        existingUser.setName(userRequest.getName());
        existingUser.setEmail(userRequest.getEmail());
        existingUser.setPassword(userRequest.getPassword());

        User updatedUser =
                userRepository.save(existingUser);

        UserResponse response = new UserResponse();

        response.setId(updatedUser.getId());
        response.setName(updatedUser.getName());
        response.setEmail(updatedUser.getEmail());

        return response;
    }
}