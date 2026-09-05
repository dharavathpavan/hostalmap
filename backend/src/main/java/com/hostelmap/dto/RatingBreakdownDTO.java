package com.hostelmap.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RatingBreakdownDTO {
    private double overallScore; // Weighted 25% Food, 20% Clean, 20% Safety, 15% Mgmt, 10% Facilities, 10% Value
    private double recentScore;
    private int totalReviews;
    private double food;
    private double cleanliness;
    private double safety;
    private double wifi;
    private double management;
    private double value;
    private double recommendationRate; // % students who recommend
}
