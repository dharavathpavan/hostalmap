package com.hostelmap.service;

import com.hostelmap.dto.RatingBreakdownDTO;
import com.hostelmap.entity.Review;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class RatingService {

    // Weight factors per product specification
    public static final double WEIGHT_FOOD = 0.25;
    public static final double WEIGHT_CLEANLINESS = 0.20;
    public static final double WEIGHT_SAFETY = 0.20;
    public static final double WEIGHT_MANAGEMENT = 0.15;
    public static final double WEIGHT_FACILITIES = 0.10; // Derived from wifi/facilities
    public static final double WEIGHT_VALUE = 0.10;

    /**
     * Calculates the single review weighted score
     */
    public double calculateReviewScore(Review review) {
        if (review == null) return 0.0;
        double food = review.getFoodRating() != null ? review.getFoodRating().doubleValue() : 0.0;
        double clean = review.getCleanlinessRating() != null ? review.getCleanlinessRating().doubleValue() : 0.0;
        double safety = review.getSafetyRating() != null ? review.getSafetyRating().doubleValue() : 0.0;
        double mgmt = review.getManagementRating() != null ? review.getManagementRating().doubleValue() : 0.0;
        double wifi = review.getWifiRating() != null ? review.getWifiRating().doubleValue() : 0.0;
        double val = review.getValueRating() != null ? review.getValueRating().doubleValue() : 0.0;

        double weighted = (food * WEIGHT_FOOD) +
                          (clean * WEIGHT_CLEANLINESS) +
                          (safety * WEIGHT_SAFETY) +
                          (mgmt * WEIGHT_MANAGEMENT) +
                          (wifi * WEIGHT_FACILITIES) +
                          (val * WEIGHT_VALUE);

        return Math.round(weighted * 10.0) / 10.0;
    }

    /**
     * Aggregates a list of approved reviews into an overall weighted score breakdown
     * with recency weighting and recommendation rate
     */
    public RatingBreakdownDTO calculateAggregateRatings(List<Review> reviews) {
        if (reviews == null || reviews.isEmpty()) {
            return RatingBreakdownDTO.builder()
                    .overallScore(0.0)
                    .recentScore(0.0)
                    .totalReviews(0)
                    .food(0.0)
                    .cleanliness(0.0)
                    .safety(0.0)
                    .wifi(0.0)
                    .management(0.0)
                    .value(0.0)
                    .recommendationRate(0.0)
                    .build();
        }

        int count = reviews.size();
        double sumFood = 0, sumClean = 0, sumSafety = 0, sumWifi = 0, sumMgmt = 0, sumVal = 0;
        int recommends = 0;

        // Recency calculation (past 90 days get 1.5x weight)
        LocalDateTime cutoff = LocalDateTime.now().minusDays(90);
        double recentWeightedSum = 0.0;
        double recentWeightsTotal = 0.0;

        for (Review r : reviews) {
            double f = r.getFoodRating().doubleValue();
            double c = r.getCleanlinessRating().doubleValue();
            double s = r.getSafetyRating().doubleValue();
            double w = r.getWifiRating().doubleValue();
            double m = r.getManagementRating().doubleValue();
            double v = r.getValueRating().doubleValue();

            sumFood += f;
            sumClean += c;
            sumSafety += s;
            sumWifi += w;
            sumMgmt += m;
            sumVal += v;

            if (Boolean.TRUE.equals(r.getRecommend())) {
                recommends++;
            }

            double singleScore = calculateReviewScore(r);
            double recencyMultiplier = (r.getCreatedAt() != null && r.getCreatedAt().isAfter(cutoff)) ? 1.5 : 1.0;
            recentWeightedSum += singleScore * recencyMultiplier;
            recentWeightsTotal += recencyMultiplier;
        }

        double avgFood = round1(sumFood / count);
        double avgClean = round1(sumClean / count);
        double avgSafety = round1(sumSafety / count);
        double avgWifi = round1(sumWifi / count);
        double avgMgmt = round1(sumMgmt / count);
        double avgVal = round1(sumVal / count);

        // Overall weighted average using specs
        double overallScore = round1(
                (avgFood * WEIGHT_FOOD) +
                (avgClean * WEIGHT_CLEANLINESS) +
                (avgSafety * WEIGHT_SAFETY) +
                (avgMgmt * WEIGHT_MANAGEMENT) +
                (avgWifi * WEIGHT_FACILITIES) +
                (avgVal * WEIGHT_VALUE)
        );

        double recentScore = recentWeightsTotal > 0 ? round1(recentWeightedSum / recentWeightsTotal) : overallScore;
        double recommendationRate = Math.round(((double) recommends / count) * 100.0);

        return RatingBreakdownDTO.builder()
                .overallScore(overallScore)
                .recentScore(recentScore)
                .totalReviews(count)
                .food(avgFood)
                .cleanliness(avgClean)
                .safety(avgSafety)
                .wifi(avgWifi)
                .management(avgMgmt)
                .value(avgVal)
                .recommendationRate(recommendationRate)
                .build();
    }

    private double round1(double val) {
        return Math.round(val * 10.0) / 10.0;
    }
}
