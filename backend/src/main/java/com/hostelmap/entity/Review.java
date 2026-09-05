package com.hostelmap.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "hostel_id", nullable = false)
    private Hostel hostel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "food_rating", nullable = false, precision = 2, scale = 1)
    private BigDecimal foodRating;

    @Column(name = "cleanliness_rating", nullable = false, precision = 2, scale = 1)
    private BigDecimal cleanlinessRating;

    @Column(name = "safety_rating", nullable = false, precision = 2, scale = 1)
    private BigDecimal safetyRating;

    @Column(name = "wifi_rating", nullable = false, precision = 2, scale = 1)
    private BigDecimal wifiRating;

    @Column(name = "management_rating", nullable = false, precision = 2, scale = 1)
    private BigDecimal managementRating;

    @Column(name = "value_rating", nullable = false, precision = 2, scale = 1)
    private BigDecimal valueRating;

    @Column(columnDefinition = "TEXT")
    private String comment;

    @Column(nullable = false)
    private Boolean recommend = true;

    @Column(name = "verified_student", nullable = false)
    private Boolean verifiedStudent = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReviewStatus status = ReviewStatus.PENDING;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum ReviewStatus {
        PENDING, APPROVED, REJECTED
    }
}
