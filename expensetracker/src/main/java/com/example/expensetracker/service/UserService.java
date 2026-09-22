package com.example.expensetracker.service;

import com.example.expensetracker.config.JwtProperties;
import com.example.expensetracker.dto.AuthResponse;
import com.example.expensetracker.dto.LoginRequest;
import com.example.expensetracker.dto.RefreshTokenRequest;
import com.example.expensetracker.dto.UserRequest;
import com.example.expensetracker.dto.UserResponse;
import com.example.expensetracker.entity.RefreshToken;
import com.example.expensetracker.entity.Role;
import com.example.expensetracker.entity.User;
import com.example.expensetracker.exception.UnauthorizedAccessException;
import com.example.expensetracker.exception.UserAlreadyExistsException;
import com.example.expensetracker.exception.UserNotFoundException;
import com.example.expensetracker.mapper.UserMapper;
import com.example.expensetracker.repository.RefreshTokenRepository;
import com.example.expensetracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final JwtProperties jwtProperties;

    public UserResponse createUser(UserRequest userRequest) {
        if (userRepository.findByEmail(userRequest.getEmail()).isPresent()) {
            throw new UserAlreadyExistsException("User with email " + userRequest.getEmail() + " already exists");
        }

        User user = User.builder()
                .name(userRequest.getName())
                .email(userRequest.getEmail())
                .password(passwordEncoder.encode(userRequest.getPassword()))
                .role(Role.ROLE_USER)
                .isActive(true)
                .build();

        User savedUser = userRepository.save(user);
        log.info("Registered new user with ID: {}", savedUser.getId());
        return UserMapper.toResponse(savedUser);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        if (!user.isActive()) {
            throw new UnauthorizedAccessException("Account is disabled. Please contact support.");
        }

        String accessToken = jwtService.generateAccessToken(user.getEmail(), user.getRole());
        RefreshToken refreshToken = createRefreshToken(user);

        log.info("User '{}' logged in successfully", user.getEmail());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .tokenType("Bearer")
                .expiresInMs(jwtProperties.getAccessTokenExpirationMs())
                .user(UserMapper.toResponse(user))
                .build();
    }

    public AuthResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken token = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new UnauthorizedAccessException("Invalid or revoked refresh token"));

        if (token.isRevoked() || token.isExpired()) {
            refreshTokenRepository.delete(token);
            throw new UnauthorizedAccessException("Refresh token has expired or was revoked. Please sign in again.");
        }

        User user = token.getUser();
        String newAccessToken = jwtService.generateAccessToken(user.getEmail(), user.getRole());

        // Rotate Refresh Token
        token.setToken(UUID.randomUUID().toString());
        token.setExpiryDate(Instant.now().plusMillis(jwtProperties.getRefreshTokenExpirationMs()));
        RefreshToken rotatedToken = refreshTokenRepository.save(token);

        log.info("Rotated refresh token for user '{}'", user.getEmail());

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(rotatedToken.getToken())
                .tokenType("Bearer")
                .expiresInMs(jwtProperties.getAccessTokenExpirationMs())
                .user(UserMapper.toResponse(user))
                .build();
    }

    private RefreshToken createRefreshToken(User user) {
        refreshTokenRepository.deleteByUser(user);

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString())
                .expiryDate(Instant.now().plusMillis(jwtProperties.getRefreshTokenExpirationMs()))
                .revoked(false)
                .build();

        return refreshTokenRepository.save(refreshToken);
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User currentUser = getCurrentUser();
        if (!currentUser.getId().equals(id) && currentUser.getRole() != Role.ROLE_ADMIN) {
            throw new UnauthorizedAccessException("You are not authorized to view another user's profile");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User with id " + id + " not found"));

        return UserMapper.toResponse(user);
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUserProfile() {
        return UserMapper.toResponse(getCurrentUser());
    }

    public UserResponse updateUser(Long id, UserRequest userRequest) {
        User currentUser = getCurrentUser();
        if (!currentUser.getId().equals(id) && currentUser.getRole() != Role.ROLE_ADMIN) {
            throw new UnauthorizedAccessException("You are not authorized to update another user's profile");
        }

        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User with id " + id + " not found"));

        // If email changed, check for uniqueness
        if (!existingUser.getEmail().equals(userRequest.getEmail())
                && userRepository.findByEmail(userRequest.getEmail()).isPresent()) {
            throw new UserAlreadyExistsException("Email " + userRequest.getEmail() + " is already taken");
        }

        existingUser.setName(userRequest.getName());
        existingUser.setEmail(userRequest.getEmail());
        if (userRequest.getPassword() != null && !userRequest.getPassword().isBlank()) {
            existingUser.setPassword(passwordEncoder.encode(userRequest.getPassword()));
        }

        User updatedUser = userRepository.save(existingUser);
        return UserMapper.toResponse(updatedUser);
    }

    public void deleteUser(Long id) {
        User currentUser = getCurrentUser();
        if (!currentUser.getId().equals(id) && currentUser.getRole() != Role.ROLE_ADMIN) {
            throw new UnauthorizedAccessException("You are not authorized to delete another user's profile");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User with id " + id + " not found"));

        refreshTokenRepository.deleteByUser(user);
        userRepository.delete(user);
        log.info("Deleted user with ID: {}", id);
    }

    @Transactional(readOnly = true)
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null || "anonymousUser".equals(authentication.getName())) {
            throw new UnauthorizedAccessException("User is not authenticated");
        }

        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User with email " + email + " not found"));
    }
}
