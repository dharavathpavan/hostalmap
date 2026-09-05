package com.hostelmap.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FoodUpdateDTO {
    private Long id;
    private Long hostelId;
    private String hostelName;

    @NotNull(message = "Food date is required")
    private LocalDate foodDate;

    @NotBlank(message = "Breakfast menu is required")
    private String breakfast;

    @NotBlank(message = "Lunch menu is required")
    private String lunch;

    @NotBlank(message = "Dinner menu is required")
    private String dinner;

    private String imageUrl;
    private Double foodRating; // Aggregated student food rating
}
