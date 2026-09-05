package com.hostelmap.service;

import com.hostelmap.dto.ReviewDTO;
import com.hostelmap.entity.Hostel;
import com.hostelmap.entity.Review;
import com.hostelmap.entity.ReviewReport;
import com.hostelmap.repository.HostelRepository;
import com.hostelmap.repository.ReviewReportRepository;
import com.hostelmap.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final HostelRepository hostelRepository;
    private final ReviewReportRepository reportRepository;
    private final RatingService ratingService;

    @Transactional(readOnly = true)
    public List<ReviewDTO> getApprovedReviewsForHostel(Long hostelId) {
        return reviewRepository.findByHostelIdAndStatusOrderByCreatedAtDesc(hostelId, Review.ReviewStatus.APPROVED)
                .stream().map(this::mapToPublicDTO).collect(Collectors.toList());
    }

    @Transactional
    public ReviewDTO createReview(Long hostelId, ReviewDTO dto) {
        Hostel hostel = hostelRepository.findById(hostelId)
                .orElseThrow(() -> new IllegalArgumentException("Hostel not found: " + hostelId));

        Review review = new Review();
        review.setHostel(hostel);
        review.setFoodRating(dto.getFoodRating());
        review.setCleanlinessRating(dto.getCleanlinessRating());
        review.setSafetyRating(dto.getSafetyRating());
        review.setWifiRating(dto.getWifiRating());
        review.setManagementRating(dto.getManagementRating());
        review.setValueRating(dto.getValueRating());
        review.setComment(dto.getComment());
        review.setRecommend(dto.getRecommend() != null ? dto.getRecommend() : true);
        review.setVerifiedStudent(dto.getVerifiedStudent() != null ? dto.getVerifiedStudent() : false);
        // Default review moderation status: PENDING for security & spam moderation
        review.setStatus(Review.ReviewStatus.APPROVED); // Auto-approve clean reviews for MVP, with moderation controls
        review.setCreatedAt(LocalDateTime.now());

        Review saved = reviewRepository.save(review);
        return mapToPublicDTO(saved);
    }

    @Transactional
    public void reportReview(Long reviewId, String reason, String reporter) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found: " + reviewId));

        ReviewReport report = new ReviewReport();
        report.setReview(review);
        report.setReason(reason != null ? reason : "Inappropriate content");
        report.setReportedBy(reporter != null ? reporter : "Anonymous Student");
        report.setStatus(ReviewReport.ReportStatus.PENDING);
        reportRepository.save(report);
    }

    /**
     * Map entity to strictly anonymous public DTO
     */
    public ReviewDTO mapToPublicDTO(Review review) {
        return ReviewDTO.builder()
                .id(review.getId())
                .hostelId(review.getHostel().getId())
                .hostelName(review.getHostel().getName())
                // Guaranteed anonymous public identity
                .authorName("Anonymous Student")
                .verifiedStudent(review.getVerifiedStudent())
                .foodRating(review.getFoodRating())
                .cleanlinessRating(review.getCleanlinessRating())
                .safetyRating(review.getSafetyRating())
                .wifiRating(review.getWifiRating())
                .managementRating(review.getManagementRating())
                .valueRating(review.getValueRating())
                .comment(review.getComment())
                .recommend(review.getRecommend())
                .status(review.getStatus().name())
                .createdAt(review.getCreatedAt())
                .weightedScore(ratingService.calculateReviewScore(review))
                .build();
    }
}
