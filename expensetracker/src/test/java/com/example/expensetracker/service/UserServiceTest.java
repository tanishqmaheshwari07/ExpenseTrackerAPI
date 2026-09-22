package com.example.expensetracker.service;

import com.example.expensetracker.config.JwtProperties;
import com.example.expensetracker.dto.AuthResponse;
import com.example.expensetracker.dto.LoginRequest;
import com.example.expensetracker.dto.UserRequest;
import com.example.expensetracker.dto.UserResponse;
import com.example.expensetracker.entity.RefreshToken;
import com.example.expensetracker.entity.Role;
import com.example.expensetracker.entity.User;
import com.example.expensetracker.exception.UserAlreadyExistsException;
import com.example.expensetracker.repository.RefreshTokenRepository;
import com.example.expensetracker.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private JwtProperties jwtProperties;

    @InjectMocks
    private UserService userService;

    private User testUser;
    private UserRequest userRequest;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .name("Alex Doe")
                .email("alex@example.com")
                .password("encodedPassword123")
                .role(Role.ROLE_USER)
                .isActive(true)
                .build();

        userRequest = new UserRequest();
        userRequest.setName("Alex Doe");
        userRequest.setEmail("alex@example.com");
        userRequest.setPassword("rawPassword123");
    }

    @Test
    @DisplayName("Should successfully register a new user")
    void createUser_Success() {
        when(userRepository.findByEmail("alex@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("rawPassword123")).thenReturn("encodedPassword123");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        UserResponse response = userService.createUser(userRequest);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getEmail()).isEqualTo("alex@example.com");
        assertThat(response.getRole()).isEqualTo(Role.ROLE_USER);
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw UserAlreadyExistsException when email already exists")
    void createUser_DuplicateEmail_ThrowsException() {
        when(userRepository.findByEmail("alex@example.com")).thenReturn(Optional.of(testUser));

        assertThatThrownBy(() -> userService.createUser(userRequest))
                .isInstanceOf(UserAlreadyExistsException.class)
                .hasMessageContaining("already exists");

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should successfully login user and return access & refresh tokens")
    void login_Success() {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("alex@example.com");
        loginRequest.setPassword("rawPassword123");

        RefreshToken refreshToken = RefreshToken.builder()
                .id(10L)
                .token("mock-refresh-token")
                .expiryDate(Instant.now().plusSeconds(3600))
                .user(testUser)
                .build();

        when(userRepository.findByEmail("alex@example.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("rawPassword123", "encodedPassword123")).thenReturn(true);
        when(jwtService.generateAccessToken(eq("alex@example.com"), eq(Role.ROLE_USER))).thenReturn("mock-access-token");
        when(jwtProperties.getRefreshTokenExpirationMs()).thenReturn(604800000L);
        when(jwtProperties.getAccessTokenExpirationMs()).thenReturn(900000L);
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenReturn(refreshToken);

        AuthResponse authResponse = userService.login(loginRequest);

        assertThat(authResponse).isNotNull();
        assertThat(authResponse.getAccessToken()).isEqualTo("mock-access-token");
        assertThat(authResponse.getRefreshToken()).isEqualTo("mock-refresh-token");
        assertThat(authResponse.getUser().getEmail()).isEqualTo("alex@example.com");
    }

    @Test
    @DisplayName("Should throw BadCredentialsException when password is wrong")
    void login_InvalidPassword_ThrowsBadCredentials() {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("alex@example.com");
        loginRequest.setPassword("wrongPassword");

        when(userRepository.findByEmail("alex@example.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("wrongPassword", "encodedPassword123")).thenReturn(false);

        assertThatThrownBy(() -> userService.login(loginRequest))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessageContaining("Invalid email or password");
    }
}
