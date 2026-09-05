package com.hostelmap.controller;

import com.hostelmap.dto.ApiResponse;
import com.hostelmap.entity.Facility;
import com.hostelmap.repository.FacilityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/facilities")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FacilityController {

    private final FacilityRepository facilityRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Facility>>> getAllFacilities() {
        return ResponseEntity.ok(ApiResponse.success(facilityRepository.findAll()));
    }
}
