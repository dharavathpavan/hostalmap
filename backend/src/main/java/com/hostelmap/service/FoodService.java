package com.hostelmap.service;

import com.hostelmap.dto.FoodUpdateDTO;
import com.hostelmap.entity.FoodUpdate;
import com.hostelmap.entity.Hostel;
import com.hostelmap.repository.FoodUpdateRepository;
import com.hostelmap.repository.HostelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FoodService {

    private final FoodUpdateRepository foodUpdateRepository;
    private final HostelRepository hostelRepository;

    @Transactional(readOnly = true)
    public Optional<FoodUpdateDTO> getTodayFood(Long hostelId) {
        return foodUpdateRepository.findByHostelIdAndFoodDate(hostelId, LocalDate.now())
                .or(() -> foodUpdateRepository.findTopByHostelIdOrderByFoodDateDesc(hostelId))
                .map(this::mapToDTO);
    }

    @Transactional
    public FoodUpdateDTO saveFoodUpdate(Long hostelId, FoodUpdateDTO dto) {
        Hostel hostel = hostelRepository.findById(hostelId)
                .orElseThrow(() -> new IllegalArgumentException("Hostel not found: " + hostelId));

        LocalDate date = dto.getFoodDate() != null ? dto.getFoodDate() : LocalDate.now();

        FoodUpdate food = foodUpdateRepository.findByHostelIdAndFoodDate(hostelId, date)
                .orElseGet(() -> {
                    FoodUpdate nu = new FoodUpdate();
                    nu.setHostel(hostel);
                    nu.setFoodDate(date);
                    nu.setCreatedAt(LocalDateTime.now());
                    return nu;
                });

        food.setBreakfast(dto.getBreakfast());
        food.setLunch(dto.getLunch());
        food.setDinner(dto.getDinner());
        if (dto.getImageUrl() != null) {
            food.setImageUrl(dto.getImageUrl());
        }

        FoodUpdate saved = foodUpdateRepository.save(food);
        return mapToDTO(saved);
    }

    private FoodUpdateDTO mapToDTO(FoodUpdate f) {
        return FoodUpdateDTO.builder()
                .id(f.getId())
                .hostelId(f.getHostel().getId())
                .hostelName(f.getHostel().getName())
                .foodDate(f.getFoodDate())
                .breakfast(f.getBreakfast())
                .lunch(f.getLunch())
                .dinner(f.getDinner())
                .imageUrl(f.getImageUrl())
                .build();
    }
}
