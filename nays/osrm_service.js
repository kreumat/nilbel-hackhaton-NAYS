// OSRM Service Module - Real-time routing calculations
// Uses OSRM public demo API: https://router.project-osrm.org

const OSRMService = {
    // OSRM public demo API endpoint
    API_BASE: 'https://router.project-osrm.org/route/v1/driving/',

    /**
     * Get route between two points
     */
    async getRoute(startLng, startLat, endLng, endLat) {
        const url = `${this.API_BASE}${startLng},${startLat};${endLng},${endLat}?overview=false`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`OSRM API error: ${response.status}`);
            }

            const data = await response.json();

            if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
                throw new Error('No route found');
            }

            const route = data.routes[0];
            return {
                duration: route.duration,
                distance: route.distance,
                durationMinutes: Math.round(route.duration / 60),
                distanceKm: (route.distance / 1000).toFixed(1)
            };
        } catch (error) {
            console.error('OSRM routing error:', error);
            throw error;
        }
    },

    /**
     * Calculate routes to multiple venues from user location
     */
    async getRoutesToVenues(userLng, userLat, venues) {
        const results = new Map();

        const promises = venues.map(async (venue) => {
            try {
                const route = await this.getRoute(userLng, userLat, venue.lng, venue.lat);
                results.set(venue.id, route);
            } catch (error) {
                console.warn(`Failed to get route to ${venue.name}:`, error);
                results.set(venue.id, null);
            }
        });

        await Promise.all(promises);
        return results;
    }
};

// Location Service - Map-based location picker
const GeoService = {
    // Default location: Acemler Metro İstasyonu
    defaultLocation: {
        lat: 40.213036,
        lng: 29.014854,
        name: 'Acemler Metro İstasyonu'
    },

    // User-selected location (null until user picks)
    userLocation: null,

    // Whether user has explicitly set their location
    locationSet: false,

    /**
     * Check if user has set their location
     */
    hasUserLocation() {
        return this.locationSet && this.userLocation !== null;
    },

    /**
     * Get current location (user's or null if not set)
     */
    getLocation() {
        if (this.hasUserLocation()) {
            return this.userLocation;
        }
        return null; // Return null to show "--"
    },

    /**
     * Get default location for map center
     */
    getDefaultLocation() {
        return this.defaultLocation;
    },

    /**
     * Set user location (called when user confirms on map)
     */
    setUserLocation(lat, lng) {
        this.userLocation = { lat, lng };
        this.locationSet = true;
        console.log('📍 User location set:', this.userLocation);
        return this.userLocation;
    },

    /**
     * Reset user location
     */
    resetLocation() {
        this.userLocation = null;
        this.locationSet = false;
        console.log('📍 User location reset');
    }
};

// Map Picker Modal
const MapPicker = {
    map: null,
    marker: null,
    modal: null,
    selectedLocation: null,
    onConfirmCallback: null,

    /**
     * Initialize the map picker
     */
    init() {
        this.modal = document.getElementById('map-picker-modal');
        const closeBtn = document.getElementById('map-picker-close');
        const confirmBtn = document.getElementById('map-picker-confirm');
        const cancelBtn = document.getElementById('map-picker-cancel');

        if (closeBtn) closeBtn.addEventListener('click', () => this.close());
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.close());
        if (confirmBtn) confirmBtn.addEventListener('click', () => this.confirm());

        // Close on overlay click
        const overlay = this.modal?.querySelector('.modal-overlay');
        if (overlay) overlay.addEventListener('click', () => this.close());

        console.log('🗺️ Map Picker initialized');
    },

    /**
     * Open the map picker modal
     */
    open(onConfirm) {
        if (!this.modal) return;

        this.onConfirmCallback = onConfirm;
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Initialize map after modal is visible
        setTimeout(() => this.initMap(), 100);
    },

    /**
     * Initialize Leaflet map
     */
    initMap() {
        const mapContainer = document.getElementById('location-map');
        if (!mapContainer) return;

        // Get starting location (user's current or default)
        const startLoc = GeoService.userLocation || GeoService.defaultLocation;
        this.selectedLocation = { lat: startLoc.lat, lng: startLoc.lng };

        // Create map if not exists
        if (!this.map) {
            this.map = L.map('location-map').setView([startLoc.lat, startLoc.lng], 14);

            // Add OpenStreetMap tiles
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(this.map);

            // Create draggable marker
            this.marker = L.marker([startLoc.lat, startLoc.lng], {
                draggable: true
            }).addTo(this.map);

            // Update location when marker is dragged
            this.marker.on('dragend', (e) => {
                const pos = e.target.getLatLng();
                this.selectedLocation = { lat: pos.lat, lng: pos.lng };
                this.updateLocationDisplay();
            });

            // Allow clicking on map to move marker
            this.map.on('click', (e) => {
                this.marker.setLatLng(e.latlng);
                this.selectedLocation = { lat: e.latlng.lat, lng: e.latlng.lng };
                this.updateLocationDisplay();
            });
        } else {
            // Map exists, just update view
            this.map.setView([startLoc.lat, startLoc.lng], 14);
            this.marker.setLatLng([startLoc.lat, startLoc.lng]);
            this.map.invalidateSize();
        }

        this.updateLocationDisplay();
    },

    /**
     * Update the location display text
     */
    updateLocationDisplay() {
        const display = document.getElementById('selected-location-text');
        if (display && this.selectedLocation) {
            display.textContent = `${this.selectedLocation.lat.toFixed(6)}, ${this.selectedLocation.lng.toFixed(6)}`;
        }
    },

    /**
     * Confirm location selection
     */
    confirm() {
        if (this.selectedLocation) {
            GeoService.setUserLocation(this.selectedLocation.lat, this.selectedLocation.lng);

            if (this.onConfirmCallback) {
                this.onConfirmCallback(this.selectedLocation);
            }
        }
        this.close();
    },

    /**
     * Close the map picker modal
     */
    close() {
        if (this.modal) {
            this.modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
};

console.log('OSRM Service loaded');
