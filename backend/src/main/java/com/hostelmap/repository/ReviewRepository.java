package com.hostelmap.repository;

import com.hostelmap.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByHostelIdAndStatusOrderByCreatedAtDesc(Long hostelId, Review.ReviewStatus status);
    List<Review> findByStatusOrderByCreatedAtDesc(Review.ReviewStatus status);
    long countByStatus(Review.ReviewStatus status);

    @Query("SELECT r FROM Review r WHERE r.hostel.id = :hostelId AND r.status = 'APPROVED' ORDER BY r.createdAt DESC")
    List<Review> findApprovedByHostelId(@Param("hostelId") Long hostelId);
}
