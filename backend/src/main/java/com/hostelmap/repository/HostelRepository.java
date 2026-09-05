package com.hostelmap.repository;

import com.hostelmap.entity.Hostel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface HostelRepository extends JpaRepository<Hostel, Long> {
    List<Hostel> findByStatus(Hostel.HostelStatus status);

    @Query("SELECT h FROM Hostel h WHERE h.status = 'ACTIVE' AND (" +
           "LOWER(h.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(h.area) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(h.city) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(h.address) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Hostel> searchHostels(@Param("query") String query);

    @Query(value = "SELECT *, " +
           "(6371 * acos(cos(radians(:lat)) * cos(radians(latitude)) * " +
           "cos(radians(longitude) - radians(:lng)) + sin(radians(:lat)) * " +
           "sin(radians(latitude)))) AS distance " +
           "FROM hostels WHERE status = 'ACTIVE' " +
           "HAVING distance <= :radius " +
           "ORDER BY distance ASC", nativeQuery = true)
    List<Hostel> findNearby(@Param("lat") BigDecimal lat,
                            @Param("lng") BigDecimal lng,
                            @Param("radius") double radius);
}
