package com.hostelmap.controller;

import com.hostelmap.dto.ApiResponse;
import com.hostelmap.dto.HostelDTO;
import com.hostelmap.service.HostelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/hostels")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class HostelController {

    private final HostelService hostelService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<HostelDTO>>> getAllHostels() {
        List<HostelDTO> hostels = hostelService.getAllActiveHostels();
        return ResponseEntity.ok(ApiResponse.success(hostels));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<HostelDTO>> getHostelById(@PathVariable Long id) {
        return hostelService.getHostelById(id)
                .map(h -> ResponseEntity.ok(ApiResponse.success(h)))
                .orElse(ResponseEntity.status(404).body(ApiResponse.error("Hostel not found: " + id)));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<HostelDTO>>> searchHostels(@RequestParam(value = "q", defaultValue = "") String query) {
        List<HostelDTO> hostels = hostelService.searchHostels(query);
        return ResponseEntity.ok(ApiResponse.success(hostels));
    }

    @GetMapping("/nearby")
    public ResponseEntity<ApiResponse<List<HostelDTO>>> getNearbyHostels(
            @RequestParam BigDecimal latitude,
            @RequestParam BigDecimal longitude,
            @RequestParam(defaultValue = "15.0") double radius) {
        List<HostelDTO> nearby = hostelService.findNearbyHostels(latitude, longitude, radius);
        return ResponseEntity.ok(ApiResponse.success(nearby));
    }
}
