package com.spicyeat.order.web.dto;

import com.spicyeat.order.domain.AddressSnapshot;

public record AddressSnapshotResponse(String label, String line1, String line2, String city, String state, String postalCode) {
    public static AddressSnapshotResponse from(AddressSnapshot snapshot) {
        return new AddressSnapshotResponse(
                snapshot.getLabel(), snapshot.getLine1(), snapshot.getLine2(),
                snapshot.getCity(), snapshot.getState(), snapshot.getPostalCode()
        );
    }
}
