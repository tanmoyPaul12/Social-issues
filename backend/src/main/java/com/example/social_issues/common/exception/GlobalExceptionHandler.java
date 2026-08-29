package com.example.social_issues.common.exception;

import com.example.social_issues.auth.dto.AuthResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<AuthResponse> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        log.warn("Database constraint violation: {}", ex.getMessage());
        String message = "A record with this information already exists.";
        if (ex.getMessage() != null && ex.getMessage().contains("phone")) {
            message = "This mobile number is already registered with another account.";
        } else if (ex.getMessage() != null && ex.getMessage().contains("email")) {
            message = "This email is already registered with another account.";
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(AuthResponse.error(message, "DUPLICATE_ENTRY"));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<AuthResponse> handleValidationException(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(err -> err.getDefaultMessage())
                .orElse("Validation failed. Please check your inputs.");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(AuthResponse.error(message, "VALIDATION_FAILED"));
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<AuthResponse> handleResourceNotFoundException(ResourceNotFoundException ex) {
        log.warn("Resource not found: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(AuthResponse.error(
                ex.getMessage(),
                "RESOURCE_NOT_FOUND"
        ));
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<AuthResponse> handleNoResourceFound(NoResourceFoundException ex) {
        log.warn("No route or static resource found: {}", ex.getResourcePath());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(AuthResponse.error(
                "Endpoint or resource not found: " + ex.getResourcePath(),
                "NOT_FOUND"
        ));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<AuthResponse> handleGenericException(Exception ex) {
        log.error("Unhandled exception: {}", ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(AuthResponse.error(
                ex.getMessage() != null ? ex.getMessage() : "Request processing failed. Please try again.",
                "INTERNAL_ERROR"
        ));
    }
}
