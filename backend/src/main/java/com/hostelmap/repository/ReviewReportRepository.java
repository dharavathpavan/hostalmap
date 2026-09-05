package com.hostelmap.repository;

import com.hostelmap.entity.ReviewReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewReportRepository extends JpaRepository<ReviewReport, Long> {
    List<ReviewReport> findByStatusOrderByCreatedAtDesc(ReviewReport.ReportStatus status);
}
