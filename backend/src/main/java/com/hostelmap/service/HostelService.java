package com.hostelmap.service;

import com.hostelmap.dto.FoodUpdateDTO;
import com.hostelmap.dto.HostelDTO;
import com.hostelmap.dto.RatingBreakdownDTO;
import com.hostelmap.entity.Facility;
import com.hostelmap.entity.FoodUpdate;
import com.hostelmap.entity.Hostel;
import com.hostelmap.entity.Review;
import com.hostelmap.repository.FacilityRepository;
import com.hostelmap.repository.FoodUpdateRepository;
import com.hostelmap.repository.HostelRepository;
import com.hostelmap.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HostelService {

    private final HostelRepository hostelRepository;
    private final ReviewRepository reviewRepository;
    private final FoodUpdateRepository foodUpdateRepository;
    private final FacilityRepository facilityRepository;
    private final RatingService ratingService;

    @Transactional(readOnly = true)
    public List<HostelDTO> getAllActiveHostels() {
        List<Hostel> hostels = hostelRepository.findByStatus(Hostel.HostelStatus.ACTIVE);
        return hostels.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<HostelDTO> getHostelById(Long id) {
        return hostelRepository.findById(id).map(this::mapToDTO);
    }

    @Transactional(readOnly = true)
    public List<HostelDTO> searchHostels(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllActiveHostels();
        }
        return hostelRepository.searchHostels(query.trim())
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<HostelDTO> findNearbyHostels(BigDecimal lat, BigDecimal lng, double radiusKm) {
        List<Hostel> hostels = hostelRepository.findNearby(lat, lng, radiusKm);
        return hostels.stream().map(h -> {
            HostelDTO dto = mapToDTO(h);
            dto.setDistanceKm(calculateDistanceKm(lat.doubleValue(), lng.doubleValue(),
                    h.getLatitude().doubleValue(), h.getLongitude().doubleValue()));
            return dto;
        }).collect(Collectors.toList());
    }

    public HostelDTO mapToDTO(Hostel hostel) {
        List<Review> approvedReviews = reviewRepository.findApprovedByHostelId(hostel.getId());
        RatingBreakdownDTO ratingBreakdown = ratingService.calculateAggregateRatings(approvedReviews);

        Optional<FoodUpdate> foodOpt = foodUpdateRepository.findByHostelIdAndFoodDate(hostel.getId(), LocalDate.now())
                .or(() -> foodUpdateRepository.findTopByHostelIdOrderByFoodDateDesc(hostel.getId()));

        FoodUpdateDTO foodDTO = foodOpt.map(f -> FoodUpdateDTO.builder()
                .id(f.getId())
                .hostelId(hostel.getId())
                .hostelName(hostel.getName())
                .foodDate(f.getFoodDate())
                .breakfast(f.getBreakfast())
                .lunch(f.getLunch())
                .dinner(f.getDinner())
                .imageUrl(f.getImageUrl())
                .foodRating(ratingBreakdown.getFood())
                .build()).orElse(null);

        List<String> facilityNames = hostel.getFacilities() != null ?
                hostel.getFacilities().stream().map(Facility::getName).collect(Collectors.toList()) :
                List.of();

        return HostelDTO.builder()
                .id(hostel.getId())
                .name(hostel.getName())
                .description(hostel.getDescription())
                .address(hostel.getAddress())
                .area(hostel.getArea())
                .city(hostel.getCity())
                .state(hostel.getState())
                .pincode(hostel.getPincode())
                .latitude(hostel.getLatitude())
                .longitude(hostel.getLongitude())
                .hostelType(hostel.getHostelType().name())
                .monthlyRent(hostel.getMonthlyRent())
                .deposit(hostel.getDeposit())
                .foodAvailable(hostel.getFoodAvailable())
                .verified(hostel.getVerified())
                .status(hostel.getStatus().name())
                .rating(ratingBreakdown.getOverallScore())
                .reviewCount(ratingBreakdown.getTotalReviews())
                .ratingBreakdown(ratingBreakdown)
                .facilities(facilityNames)
                .todayFood(foodDTO)
                .build();
    }

    private double calculateDistanceKm(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(6371 * c * 10.0) / 10.0;
    }
}
