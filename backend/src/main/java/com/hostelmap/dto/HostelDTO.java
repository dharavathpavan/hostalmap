package com.hostelmap.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HostelDTO {
    private Long id;
    private String name;
    private String description;
    private String address;
    private String area;
    private String city;
    private String state;
    private String pincode;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String hostelType;
    private BigDecimal monthlyRent;
    private BigDecimal deposit;
    private Boolean foodAvailable;
    private Boolean verified;
    private String status;
    private Double distanceKm;

    // Rating summary
    private Double rating;
    private Integer reviewCount;
    private RatingBreakdownDTO ratingBreakdown;

    // Facilities & Food
    private List<String> facilities;
    private FoodUpdateDTO todayFood;
}
