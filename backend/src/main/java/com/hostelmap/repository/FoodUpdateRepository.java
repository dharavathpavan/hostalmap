package com.hostelmap.repository;

import com.hostelmap.entity.FoodUpdate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface FoodUpdateRepository extends JpaRepository<FoodUpdate, Long> {
    Optional<FoodUpdate> findByHostelIdAndFoodDate(Long hostelId, LocalDate foodDate);
    Optional<FoodUpdate> findTopByHostelIdOrderByFoodDateDesc(Long hostelId);
}
