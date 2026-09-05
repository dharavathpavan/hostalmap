package com.hostelmap.controller;

import com.hostelmap.dto.ApiResponse;
import com.hostelmap.dto.HostelDTO;
import com.hostelmap.entity.Hostel;
import com.hostelmap.entity.Review;
import com.hostelmap.entity.ReviewReport;
import com.hostelmap.repository.*;
import com.hostelmap.service.HostelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminController {

    private final HostelRepository hostelRepository;
    private final ReviewRepository reviewRepository;
    private final ReviewReportRepository reportRepository;
    private final FoodUpdateRepository foodUpdateRepository;
    private final HostelService hostelService;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAdminStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalHostels", hostelRepository.count());
        stats.put("totalReviews", reviewRepository.count());
        stats.put("pendingReviews", reviewRepository.countByStatus(Review.ReviewStatus.PENDING));
        stats.put("pendingReports", reportRepository.findByStatusOrderByCreatedAtDesc(ReviewReport.ReportStatus.PENDING).size());
        stats.put("totalFoodUpdates", foodUpdateRepository.count());
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @PostMapping("/hostels")
    public ResponseEntity<ApiResponse<HostelDTO>> createHostel(@RequestBody Hostel hostel) {
        Hostel saved = hostelRepository.save(hostel);
        return ResponseEntity.ok(ApiResponse.success("Hostel created successfully", hostelService.mapToDTO(saved)));
    }

    @PutMapping("/hostels/{id}")
    public ResponseEntity<ApiResponse<HostelDTO>> updateHostel(@PathVariable Long id, @RequestBody Hostel hostel) {
        return hostelRepository.findById(id).map(existing -> {
            existing.setName(hostel.getName());
            existing.setDescription(hostel.getDescription());
            existing.setAddress(hostel.getAddress());
            existing.setArea(hostel.getArea());
            existing.setCity(hostel.getCity());
            existing.setMonthlyRent(hostel.getMonthlyRent());
            existing.setDeposit(hostel.getDeposit());
            existing.setLatitude(hostel.getLatitude());
            existing.setLongitude(hostel.getLongitude());
            existing.setHostelType(hostel.getHostelType());
            existing.setFoodAvailable(hostel.getFoodAvailable());
            existing.setVerified(hostel.getVerified());
            existing.setStatus(hostel.getStatus());
            Hostel saved = hostelRepository.save(existing);
            return ResponseEntity.ok(ApiResponse.success("Hostel updated successfully", hostelService.mapToDTO(saved)));
        }).orElse(ResponseEntity.status(404).body(ApiResponse.error("Hostel not found")));
    }

    @PatchMapping("/hostels/{id}/status")
    public ResponseEntity<ApiResponse<String>> toggleHostelStatus(@PathVariable Long id, @RequestParam Hostel.HostelStatus status) {
        return hostelRepository.findById(id).map(h -> {
            h.setStatus(status);
            hostelRepository.save(h);
            return ResponseEntity.ok(ApiResponse.success("Hostel status updated to " + status, null));
        }).orElse(ResponseEntity.status(404).body(ApiResponse.error("Hostel not found")));
    }

    @GetMapping("/reviews")
    public ResponseEntity<ApiResponse<List<Review>>> getReviews(@RequestParam(required = false) Review.ReviewStatus status) {
        List<Review> reviews = (status != null) ?
                reviewRepository.findByStatusOrderByCreatedAtDesc(status) :
                reviewRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(reviews));
    }

    @PatchMapping("/reviews/{id}/status")
    public ResponseEntity<ApiResponse<String>> updateReviewStatus(
            @PathVariable Long id,
            @RequestParam Review.ReviewStatus status) {
        return reviewRepository.findById(id).map(r -> {
            r.setStatus(status);
            reviewRepository.save(r);
            return ResponseEntity.ok(ApiResponse.success("Review status updated to " + status, null));
        }).orElse(ResponseEntity.status(404).body(ApiResponse.error("Review not found")));
    }

    @GetMapping("/reports")
    public ResponseEntity<ApiResponse<List<ReviewReport>>> getReports() {
        return ResponseEntity.ok(ApiResponse.success(
                reportRepository.findByStatusOrderByCreatedAtDesc(ReviewReport.ReportStatus.PENDING)));
    }

    @PatchMapping("/reports/{id}/status")
    public ResponseEntity<ApiResponse<String>> updateReportStatus(
            @PathVariable Long id,
            @RequestParam ReviewReport.ReportStatus status) {
        return reportRepository.findById(id).map(rep -> {
            rep.setStatus(status);
            reportRepository.save(rep);
            return ResponseEntity.ok(ApiResponse.success("Report updated to " + status, null));
        }).orElse(ResponseEntity.status(404).body(ApiResponse.error("Report not found")));
    }
}
