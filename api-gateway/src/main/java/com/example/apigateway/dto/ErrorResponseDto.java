package com.example.apigateway.dto;

import java.time.Instant;
import java.util.Map;

public record ErrorResponseDto(
        ErrorDetail error
) {
    public static ErrorResponseDto of(String code, String message, String path, String correlationId) {
        return new ErrorResponseDto(
                new ErrorDetail(
                        code,
                        message,
                        Map.of(
                                "timestamp", Instant.now().toString(),
                                "path", path != null ? path : "",
                                "correlationId", correlationId != null ? correlationId : ""
                        )
                )
        );
    }

    public record ErrorDetail(
            String code,
            String message,
            Map<String, Object> details
    ) {}
}
