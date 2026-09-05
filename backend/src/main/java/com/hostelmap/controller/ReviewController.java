package com.hostelmap.controller;

import com.hostelmap.dto.ApiResponse;
import com.hostelmap.dto.ReviewDTO;
import com.hostelmap.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/hostels/{id}/reviews")
    public ResponseEntity<ApiResponse<List<ReviewDTO>>> getReviewsForHostel(@PathVariable Long id) {
        List<ReviewDTO> reviews = reviewService.getApprovedReviewsForHostel(id);
        return ResponseEntity.ok(ApiResponse.success(reviews));
    }

    @PostMapping("/hostels/{id}/reviews")
    public ResponseEntity<ApiResponse<ReviewDTO>> submitReview(
            @PathVariable Long id,
            @Valid @RequestBody ReviewDTO reviewDTO) {
        ReviewDTO created = reviewService.createReview(id, reviewDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Review submitted successfully! Thank you for helping fellow students.", created));
    }

    @PostMapping("/reviews/{id}/report")
    public ResponseEntity<ApiResponse<String>> reportReview(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String reason = body != null ? body.get("reason") : "Inappropriate content";
        String reporter = body != null ? body.get("reportedBy") : "Anonymous Student";
        reviewService.reportReview(id, reason, reporter);
        return ResponseEntity.ok(ApiResponse.success("Report received. Our moderation team will investigate."));
    }
}
