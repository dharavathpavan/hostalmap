package com.hostelmap.controller;

import com.hostelmap.dto.ApiResponse;
import com.hostelmap.dto.FoodUpdateDTO;
import com.hostelmap.service.FoodService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/hostels/{hostelId}/food")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FoodController {

    private final FoodService foodService;

    @GetMapping("/today")
    public ResponseEntity<ApiResponse<FoodUpdateDTO>> getTodayFood(@PathVariable Long hostelId) {
        return foodService.getTodayFood(hostelId)
                .map(f -> ResponseEntity.ok(ApiResponse.success(f)))
                .orElse(ResponseEntity.ok(ApiResponse.success("No food menu published for today yet.", null)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<FoodUpdateDTO>> updateFood(
            @PathVariable Long hostelId,
            @Valid @RequestBody FoodUpdateDTO dto) {
        FoodUpdateDTO saved = foodService.saveFoodUpdate(hostelId, dto);
        return ResponseEntity.ok(ApiResponse.success("Daily food menu updated successfully", saved));
    }
}
