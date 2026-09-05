package com.hostelmap.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewDTO {
    private Long id;
    private Long hostelId;
    private String hostelName;

    // Strict privacy: Never expose real name or user details
    private String authorName; // Defaults to "Anonymous Student"
    private Boolean verifiedStudent;

    @NotNull(message = "Food rating is required")
    @DecimalMin(value = "1.0", message = "Rating must be between 1.0 and 5.0")
    @DecimalMax(value = "5.0", message = "Rating must be between 1.0 and 5.0")
    private BigDecimal foodRating;

    @NotNull(message = "Cleanliness rating is required")
    @DecimalMin(value = "1.0", message = "Rating must be between 1.0 and 5.0")
    @DecimalMax(value = "5.0", message = "Rating must be between 1.0 and 5.0")
    private BigDecimal cleanlinessRating;

    @NotNull(message = "Safety rating is required")
    @DecimalMin(value = "1.0", message = "Rating must be between 1.0 and 5.0")
    @DecimalMax(value = "5.0", message = "Rating must be between 1.0 and 5.0")
    private BigDecimal safetyRating;

    @NotNull(message = "WiFi rating is required")
    @DecimalMin(value = "1.0", message = "Rating must be between 1.0 and 5.0")
    @DecimalMax(value = "5.0", message = "Rating must be between 1.0 and 5.0")
    private BigDecimal wifiRating;

    @NotNull(message = "Management rating is required")
    @DecimalMin(value = "1.0", message = "Rating must be between 1.0 and 5.0")
    @DecimalMax(value = "5.0", message = "Rating must be between 1.0 and 5.0")
    private BigDecimal managementRating;

    @NotNull(message = "Value rating is required")
    @DecimalMin(value = "1.0", message = "Rating must be between 1.0 and 5.0")
    @DecimalMax(value = "5.0", message = "Rating must be between 1.0 and 5.0")
    private BigDecimal valueRating;

    @Size(max = 1000, message = "Comment must not exceed 1000 characters")
    private String comment;

    private Boolean recommend;
    private String status;
    private LocalDateTime createdAt;
    private Double weightedScore;
}
