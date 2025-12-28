// NAYS - Nilüfer Akıllı Yoğunluk Sistemi JavaScript

// Timezone Configuration
const TIMEZONE_OFFSET = 3; // GMT+3 offset for target timezone

/**
 * Get current hour adjusted for target timezone
 * @returns {number} Hour in target timezone (0-23)
 */
function getCurrentHour() {
    const now = new Date();
    // Get UTC hour and add timezone offset
    const utcHour = now.getUTCHours();
    const targetHour = (utcHour + TIMEZONE_OFFSET) % 24;
    return targetHour;
}

/**
 * Get current date in target timezone (DD.MM.YYYY format)
 * @returns {string}
 */
function getCurrentDateFormatted() {
    const now = new Date();
    // Adjust for timezone - add offset hours
    const adjustedTime = new Date(now.getTime() + (TIMEZONE_OFFSET - (now.getTimezoneOffset() / -60)) * 60 * 60 * 1000);
    const day = String(adjustedTime.getDate()).padStart(2, '0');
    const month = String(adjustedTime.getMonth() + 1).padStart(2, '0');
    const year = adjustedTime.getFullYear();
    return `${day}.${month}.${year}`;
}

// Venue data - will be populated from data.json
let venuesData = [];
let rawJsonData = null;

// Category mappings
const categoryMap = {
    'Library': { category: 'kutuphane', categoryLabel: 'Kütüphane' },
    'Cafe': { category: 'kafe', categoryLabel: 'Kafe' },
    'Restaurant': { category: 'lokanta', categoryLabel: 'Lokanta' },
    'Museum': { category: 'muze', categoryLabel: 'Müze' }
};

// Venue metadata (descriptions and images not in JSON)
const venueMetadata = {
    '001': {
        address: 'Görükle, Nilüfer/Bursa (Gençlik Merkezi)',
        description: "Gençlerin yoğun olduğu Görükle'de, dinamik ve ortak çalışma kültürünü destekleyen bir kütüphanedir. 15 bin eserlik koleksiyonu ve 'Tırtıl', 'Dutluk' gibi özel bölümleriyle hizmet verir.",
        image: 'images/gorukle-koza-kutuphane.jpeg'
    },
    '002': {
        address: '29 Ekim Mah. Nilüfer/Bursa',
        description: 'Modern ve samimi atmosferiyle mahalle sakinleri ve gençler için ekonomik bir buluşma noktası. Sokak lezzetleri konsepti ve uygun fiyatlarıyla dikkat çeker.',
        image: 'images/nilbel-29-ekim-kafe.jpeg'
    },
    '003': {
        address: 'Görükle Mah. Nilüfer/Bursa',
        description: 'Öğrenciler ve vatandaşlar için sağlıklı, lezzetli ve ekonomik yemek seçenekleri sunan sosyal bir projedir. Bütçe dostu menüleriyle kaliteli bir beslenme çözümü sunar.',
        image: 'images/gorukle-kent-lokantasi.jpeg'
    },
    '004': {
        address: 'Misi (Gümüştepe) Mah. Nilüfer/Bursa',
        description: "Türk edebiyatının hafızasını canlı tutan yaşayan bir müze. 185'i aşkın yazarın el yazmaları, kişisel eşyaları ve zengin mektup koleksiyonuyla Misi'de hizmet verir.",
        image: 'images/edebiyat-müzesi-ve-arsivi.jpeg'
    }
};

/**
 * Load venue data from JSON file
 */
async function loadVenueData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) throw new Error('Failed to load data.json');
        rawJsonData = await response.json();

        // Transform JSON data to venuesData format
        venuesData = rawJsonData.map(venue => {
            const catInfo = categoryMap[venue.venue_type] || { category: 'other', categoryLabel: 'Diğer' };
            const meta = venueMetadata[venue.venue_id] || {};
            const hours = venue.hours?.weekday || { open: '09:00', close: '18:00' };

            // Get current occupancy from logs
            const currentLog = getCurrentOccupancyLog(venue);
            const currentOccupancy = currentLog ? currentLog.visitor_count : 0;

            // Build hourly data array for chart (today's data)
            const hourlyData = getTodayHourlyData(venue);

            return {
                id: parseInt(venue.venue_id),
                name: venue.venue_name,
                category: catInfo.category,
                categoryLabel: catInfo.categoryLabel,
                address: meta.address || '',
                capacity: venue.max_capacity,
                currentOccupancy: currentOccupancy,
                lat: venue.location.lat,
                lng: venue.location.lng,
                distance: null,
                travelTime: null,
                hours: `${hours.open} - ${hours.close}`,
                hourlyData: hourlyData,
                description: meta.description || '',
                image: meta.image || '',
                closedDays: venue.closed_days || [],
                rawLogs: venue.occupancy_logs
            };
        });

        console.log('📊 Venue data loaded from JSON:', venuesData.length, 'venues');
        return venuesData;
    } catch (error) {
        console.error('❌ Failed to load venue data:', error);
        return [];
    }
}

/**
 * Helper function to parse time string (HH:MM) to total minutes since midnight
 * @param {string} timeStr - Time in "HH:MM" format
 * @returns {number} Total minutes since midnight
 */
function parseTimeToMinutes(timeStr) {
    const parts = timeStr.split(':');
    const hours = parseInt(parts[0], 10) || 0;
    const minutes = parseInt(parts[1], 10) || 0;
    return hours * 60 + minutes;
}

/**
 * Check if a log entry's time falls within ±30 minutes of the target hour
 * For example, for hour=10, this matches 09:30 to 10:30
 * @param {string} logTime - Log entry time (HH:MM format)
 * @param {number} targetHour - Target hour (0-23)
 * @returns {boolean}
 */
function isWithinHourWindow(logTime, targetHour) {
    const logMinutes = parseTimeToMinutes(logTime);
    const targetMinutes = targetHour * 60; // e.g., 10:00 = 600 minutes

    // Window: targetHour - 30 minutes to targetHour + 30 minutes
    const windowStart = targetMinutes - 30;
    const windowEnd = targetMinutes + 30;

    return logMinutes >= windowStart && logMinutes < windowEnd;
}

/**
 * Get average occupancy rate for a specific hour across ALL days
 * Uses ±30 minute window matching: for hour=10, includes entries from 09:30 to 10:30
 * @param {object} venue 
 * @param {number} hour - Hour to get average for (0-23)
 * @returns {number} Average occupancy rate
 */
function getAverageOccupancyForHour(venue, hour) {
    // Support both raw JSON (occupancy_logs) and transformed venue (rawLogs)
    const logs = venue.occupancy_logs || venue.rawLogs;

    if (!logs || logs.length === 0) {
        return 50; // Default fallback
    }

    // Get all logs within ±30 minute window of this hour across all days
    // For hour=10, this matches any entry from 09:30 to 10:29
    const logsForHour = logs.filter(l => isWithinHourWindow(l.time, hour));

    if (logsForHour.length === 0) {
        // No data in this window, find closest hour average
        const { openHour, closeHour } = getVenueHours(venue);

        // If hour is before or after operating hours, return 0
        if (hour < openHour || hour >= closeHour) {
            return 0;
        }

        // Find closest hour that has data (using window matching)
        let closestHour = openHour;
        let minDiff = Math.abs(hour - openHour);

        for (let h = openHour; h < closeHour; h++) {
            const hasData = logs.some(l => isWithinHourWindow(l.time, h));
            if (hasData && Math.abs(hour - h) < minDiff) {
                closestHour = h;
                minDiff = Math.abs(hour - h);
            }
        }

        return getAverageOccupancyForHour(venue, closestHour);
    }

    // Calculate arithmetic average of all logs in the window
    const sum = logsForHour.reduce((acc, log) => acc + log.occupancy_rate, 0);
    return Math.round(sum / logsForHour.length);
}

/**
 * Get current occupancy based on average of all days for current hour
 */
function getCurrentOccupancyLog(venue) {
    const currentHour = getCurrentHour();
    const averageRate = getAverageOccupancyForHour(venue, currentHour);

    // Calculate visitor count based on average rate
    const visitorCount = Math.round((averageRate / 100) * venue.max_capacity);

    return {
        time: `${String(currentHour).padStart(2, '0')}:00`,
        occupancy_rate: averageRate,
        visitor_count: visitorCount
    };
}

/**
 * Get hourly data for chart using AVERAGE of all days for each hour
 */
function getTodayHourlyData(venue) {
    const { openHour, closeHour } = getVenueHours(venue);
    const hourlyAverages = [];

    // Calculate average for each operating hour
    for (let hour = openHour; hour < closeHour; hour++) {
        const avg = getAverageOccupancyForHour(venue, hour);
        hourlyAverages.push(avg);
    }

    return hourlyAverages;
}

/**
 * Format date for JSON matching (DD.MM.YYYY)
 */
function formatDateForJson(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
}

// Routing data cache
let routingData = new Map();
let isLoadingRoutes = false;



// State
let currentCategory = 'all';
let currentSort = 'occupancy';
let selectedVenue = null;

// DOM Elements
const categoryCards = document.querySelectorAll('.category-card');
const venueGrid = document.getElementById('venue-grid');
const sortSelect = document.getElementById('sort-select');
const venueModal = document.getElementById('venue-modal');
const modalClose = document.getElementById('modal-close');
const modalOverlay = document.querySelector('.modal-overlay');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    // Load venue data from JSON first
    await loadVenueData();

    // Render venues with JSON data
    renderVenues();
    setupEventListeners();

    // Initialize map-based location picker (no auto-routing)
    initializeLocationPicker();

    console.log('🏠 NAYS - Nilüfer Akıllı Yoğunluk Sistemi initialized');
});

// Setup Event Listeners
function setupEventListeners() {
    // Category selection
    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            categoryCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            currentCategory = card.dataset.category;
            renderVenues();
        });
    });

    // Sort selection
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            renderVenues();
        });
    }

    // Modal close
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    if (modalOverlay) {
        modalOverlay.addEventListener('click', closeModal);
    }
}

// Calculate occupancy percentage
function getOccupancyPercentage(venue) {
    return Math.round((venue.currentOccupancy / venue.capacity) * 100);
}

// Get status color class
function getStatusClass(percentage) {
    if (percentage < 50) return 'green';
    if (percentage < 80) return 'yellow';
    return 'red';
}

// Get status label
function getStatusLabel(percentage) {
    if (percentage < 50) return 'Rahat';
    if (percentage < 80) return 'Yoğunlaşıyor';
    return 'Çok Yoğun';
}

/**
 * Parse venue hours to get open and close hours
 * Handles both string format ("09:00 - 00:00") and object format ({weekday: {open, close}})
 * @returns {{openHour: number, closeHour: number}}
 */
function getVenueHours(venue) {
    let openHour = 9;
    let closeHour = 18;

    const hours = venue.hours;

    if (!hours) {
        return { openHour, closeHour };
    }

    // Handle string format: "09:00 - 18:00"
    if (typeof hours === 'string') {
        const parts = hours.split(' - ');
        openHour = parseInt(parts[0]?.split(':')[0]) || 9;
        closeHour = parseInt(parts[1]?.split(':')[0]) || 18;
    }
    // Handle object format: {weekday: {open: "09:00", close: "18:00"}}
    else if (typeof hours === 'object') {
        const weekday = hours.weekday || hours.weekend || {};
        openHour = parseInt(weekday.open?.split(':')[0]) || 9;
        closeHour = parseInt(weekday.close?.split(':')[0]) || 18;
    }

    // Handle midnight (00:00) as 24
    if (closeHour === 0) closeHour = 24;

    return { openHour, closeHour };
}

/**
 * Check if venue is currently closed based on Istanbul time
 * @param {object} venue
 * @returns {boolean}
 */
function isVenueClosed(venue) {
    const now = new Date();
    const currentHour = getCurrentHour();
    const { openHour, closeHour } = getVenueHours(venue);

    // Check if current time is outside operating hours
    if (currentHour < openHour || currentHour >= closeHour) {
        return true;
    }

    // Check if venue is closed on this day
    if (venue.closedDays && venue.closedDays.length > 0) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const today = days[now.getDay()];
        if (venue.closedDays.includes(today)) {
            return true;
        }
    }

    return false;
}


// Predict future occupancy based on historical averages
function predictOccupancy(venue, minutesFromNow) {
    const currentHour = getCurrentHour();

    // Calculate arrival hour
    const arrivalHour = currentHour + Math.floor(minutesFromNow / 60);

    // Get venue operating hours
    const { openHour, closeHour } = getVenueHours(venue);

    // If arrival is after closing, venue will be closed
    if (arrivalHour >= closeHour) {
        return 0;
    }

    // If arrival is before opening, use opening hour data
    const targetHour = Math.max(openHour, arrivalHour);

    // Use average occupancy for the arrival hour across ALL days
    return getAverageOccupancyForHour(venue, targetHour);
}

// Sort venues
function sortVenues(venues) {
    return [...venues].sort((a, b) => {
        switch (currentSort) {
            case 'occupancy':
                return getOccupancyPercentage(a) - getOccupancyPercentage(b);
            case 'distance':
                // Handle null distances (put them at end)
                const distA = getVenueRouteData(a.id)?.distanceKm ?? 999;
                const distB = getVenueRouteData(b.id)?.distanceKm ?? 999;
                return parseFloat(distA) - parseFloat(distB);
            case 'name':
                return a.name.localeCompare(b.name, 'tr');
            default:
                return 0;
        }
    });
}

// Filter venues by category
function filterVenues(venues) {
    if (currentCategory === 'all') return venues;
    return venues.filter(v => v.category === currentCategory);
}

// Get route data for a venue
function getVenueRouteData(venueId) {
    return routingData.get(venueId) || null;
}

// Initialize location picker without auto-routing
function initializeLocationPicker() {
    // Initialize the map picker
    MapPicker.init();

    // Setup location picker button
    const openMapBtn = document.getElementById('open-map-picker');
    if (openMapBtn) {
        openMapBtn.addEventListener('click', () => {
            MapPicker.open(onLocationConfirmed);
        });
    }

    // Update UI to show no location set
    updateLocationBanner();

    console.log('📍 Location picker ready - waiting for user to select location');
}

// Called when user confirms location on map
async function onLocationConfirmed(location) {
    console.log('📍 Location confirmed:', location);

    // Update the location banner
    updateLocationBanner();

    // Now calculate routes
    await fetchRoutesToVenues(location.lng, location.lat);
}

// Update location banner UI
function updateLocationBanner() {
    const statusText = document.getElementById('location-status-text');
    const detailText = document.getElementById('location-detail-text');
    const openBtn = document.getElementById('open-map-picker');

    if (GeoService.hasUserLocation()) {
        const loc = GeoService.userLocation;
        if (statusText) statusText.textContent = 'Konumunuz belirlendi';
        if (detailText) detailText.textContent = `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`;
        if (openBtn) {
            openBtn.innerHTML = '<i class="fas fa-edit"></i> Değiştir';
        }
    } else {
        if (statusText) statusText.textContent = 'Konumunuz belirlenmedi';
        if (detailText) detailText.textContent = 'Mesafe hesaplaması için konumunuzu seçin';
        if (openBtn) {
            openBtn.innerHTML = '<i class="fas fa-map"></i> Konum Seç';
        }
    }
}

// Fetch routes to all venues from user location
async function fetchRoutesToVenues(userLng, userLat) {
    console.log(`Fetching routes from user location: ${userLat}, ${userLng}`);

    try {
        routingData = await OSRMService.getRoutesToVenues(userLng, userLat, venuesData);
        console.log('Route data received:', routingData);

        // Re-render venues with real data
        renderVenues();

        // Update recommendation
        updateRecommendation(filterVenues(venuesData));
    } catch (error) {
        console.error('Failed to fetch routes:', error);
    }
}

// Render venue cards
function renderVenues() {
    let venues = filterVenues(venuesData);
    venues = sortVenues(venues);

    venueGrid.innerHTML = venues.map(venue => {
        const percentage = getOccupancyPercentage(venue);

        // Check if venue is currently closed
        const venueClosed = isVenueClosed(venue);
        const statusClass = venueClosed ? 'closed' : getStatusClass(percentage);
        const statusLabel = venueClosed ? 'Kapalı' : getStatusLabel(percentage);

        // Get real route data from OSRM
        const routeData = getVenueRouteData(venue.id);
        const distance = routeData ? routeData.distanceKm : null;
        const travelTime = routeData ? routeData.durationMinutes : null;

        // Check if user has set location
        const hasLocation = GeoService.hasUserLocation();

        // Use real travel time for prediction, fallback to 15 min if unavailable
        const predictedOccupancy = predictOccupancy(venue, travelTime || 15);
        const predictedStatusClass = getStatusClass(predictedOccupancy);

        // Display "--" if no location set, or actual values if calculated
        const distanceDisplay = !hasLocation ? '<span class="no-location-text">--</span>' :
            (distance !== null ? `${distance} km` : '<span class="loading-text">...</span>');
        const travelTimeDisplay = !hasLocation ? '<span class="no-location-text">--</span>' :
            (travelTime !== null ? `${travelTime} dk` : '<span class="loading-text">...</span>');

        // Occupancy display: show "Kapalı" if closed, else show percentage
        const occupancyDisplay = venueClosed
            ? '<span class="venue-occupancy closed">Kapalı</span>'
            : `<span class="venue-occupancy ${statusClass}">${percentage}% Dolu</span>`;

        return `
			<div class="venue-card ${venueClosed ? 'venue-closed' : ''}" data-venue-id="${venue.id}">
				<div class="venue-image" style="${venue.image ? `background-image: url('${venue.image}'); background-size: cover; background-position: center;` : `background: linear-gradient(135deg, ${getGradientForCategory(venue.category)});`}">
					<i class="fas ${getCategoryIcon(venue.category)}" style="${venue.image ? 'display: none;' : ''}"></i>
					<span class="venue-category-badge">
						<i class="fas ${getCategoryIcon(venue.category)}"></i>
						${venue.categoryLabel}
					</span>
					<span class="venue-status-badge ${statusClass}">${statusLabel}</span>
				</div>
				<div class="venue-info">
					<h4 class="venue-name">${venue.name}</h4>
					<p class="venue-address"><i class="fas fa-map-marker-alt"></i> ${venue.address}</p>
					<div class="occupancy-bar" ${venueClosed ? 'style="display: none;"' : ''}>
						<div class="occupancy-fill ${statusClass}" style="width: ${percentage}%"></div>
					</div>
					<div class="venue-meta">
						${occupancyDisplay}
						<span class="venue-distance"><i class="fas fa-car"></i> ${distanceDisplay} • ${travelTimeDisplay}</span>
					</div>
				</div>
			</div>
		`;
    }).join('');

    // Add click listeners to venue cards
    document.querySelectorAll('.venue-card').forEach(card => {
        card.addEventListener('click', () => {
            const venueId = parseInt(card.dataset.venueId);
            openModal(venueId);
        });
    });

    // Update recommendation
    updateRecommendation(venues);
}

// Get gradient colors for category
function getGradientForCategory(category) {
    const gradients = {
        kutuphane: '#667eea 0%, #764ba2 100%',
        kafe: '#f093fb 0%, #f5576c 100%',
        muze: '#4facfe 0%, #00f2fe 100%',
        lokanta: '#ff9a9e 0%, #fecfef 99%, #fecfef 100%'
    };
    return gradients[category] || '#667eea 0%, #764ba2 100%';
}

// Get category icon
function getCategoryIcon(category) {
    const icons = {
        kutuphane: 'fa-book',
        kafe: 'fa-coffee',
        muze: 'fa-university',
        lokanta: 'fa-utensils'
    };
    return icons[category] || 'fa-building';
}

// Update AI recommendation - only shows open venues
function updateRecommendation(venues) {
    const recommendationText = document.getElementById('recommendation-text');
    if (!recommendationText || venues.length === 0) return;

    // Filter out closed venues
    const openVenues = venues.filter(venue => !isVenueClosed(venue));

    // If all venues are closed
    if (openVenues.length === 0) {
        recommendationText.innerHTML = '<i class="fas fa-moon"></i> Şu an tüm mekanlar kapalı. Açılış saatlerini kontrol edin.';
        return;
    }

    // Find least occupied OPEN venue
    const leastOccupied = openVenues.reduce((min, venue) => {
        return getOccupancyPercentage(venue) < getOccupancyPercentage(min) ? venue : min;
    }, openVenues[0]);

    const percentage = getOccupancyPercentage(leastOccupied);
    const routeData = getVenueRouteData(leastOccupied.id);
    const travelTimeText = routeData ? `${routeData.durationMinutes} dakikada` : 'kısa sürede';
    recommendationText.innerHTML = `Şu an en az yoğun mekan: <strong>${leastOccupied.name}</strong> (%${percentage} doluluk). Oraya ${travelTimeText} ulaşabilirsiniz.`;
}

// Open venue modal
function openModal(venueId) {
    const venue = venuesData.find(v => v.id === venueId);
    if (!venue) return;

    selectedVenue = venue;

    // Check if venue is closed
    const venueClosed = isVenueClosed(venue);

    // Get occupancy data
    const percentage = getOccupancyPercentage(venue);
    const statusClass = venueClosed ? 'closed' : getStatusClass(percentage);
    const statusLabel = venueClosed ? 'Kapalı' : getStatusLabel(percentage);

    // Get real route data
    const routeData = getVenueRouteData(venue.id);
    const hasUserLocation = GeoService.hasUserLocation();
    const travelTime = routeData ? routeData.durationMinutes : null;

    const predictedOccupancy = predictOccupancy(venue, travelTime || 15);
    const predictedStatusClass = getStatusClass(predictedOccupancy);

    // Update modal content
    document.getElementById('modal-venue-name').textContent = venue.name;
    document.getElementById('modal-status').innerHTML = `<span class="status-badge ${statusClass}">${statusLabel}</span>`;
    document.getElementById('modal-address').textContent = venue.address;
    document.getElementById('modal-hours').textContent = venue.hours;
    document.getElementById('modal-capacity').textContent = `Kapasite: ${venue.capacity} kişi`;

    // Handle closed venue - hide occupancy ring
    const occupancySection = document.querySelector('.modal-body .capacity-details');
    const occupancyCircle = document.querySelector('.modal-body .occupancy-circle');

    if (venueClosed) {
        // Venue is closed - hide occupancy display
        if (occupancyCircle) occupancyCircle.style.display = 'none';
        document.getElementById('modal-percentage').textContent = '--';
        document.getElementById('modal-current-people').textContent = '--';
    } else {
        // Venue is open - show occupancy
        if (occupancyCircle) occupancyCircle.style.display = '';
        document.getElementById('modal-percentage').textContent = `${percentage}%`;
        document.getElementById('modal-current-people').textContent = venue.currentOccupancy;
    }

    document.getElementById('modal-max-capacity').textContent = venue.capacity;

    // Show ETA section with prompt or real data
    const predictionSection = document.querySelector('.prediction-card');
    const travelTimeElement = document.getElementById('modal-travel-time');
    const predictionResult = document.getElementById('modal-prediction');

    if (!hasUserLocation || !travelTime) {
        // No location - show prompt message instead of hiding
        if (predictionSection) {
            predictionSection.style.display = '';
            predictionSection.classList.add('no-location');
        }
        if (travelTimeElement) travelTimeElement.textContent = '--';
        if (predictionResult) {
            predictionResult.innerHTML = '<i class="fas fa-map-marker-alt"></i> Varış tahmini için lütfen konumunuzu belirleyin.';
        }
    } else {
        // Location available - show prediction data
        if (predictionSection) {
            predictionSection.style.display = '';
            predictionSection.classList.remove('no-location');
        }
        if (travelTimeElement) travelTimeElement.textContent = `${travelTime} dakika`;

        // Update prediction
        const predictionMessage = predictedOccupancy < 50
            ? 'Rahatça yer bulabilirsiniz.'
            : predictedOccupancy < 80
                ? 'Yer bulma ihtimaliniz yüksek.'
                : 'Yer bulmakta zorlanabilirsiniz.';
        if (predictionResult) {
            predictionResult.innerHTML = `Tahmini doluluk: <strong class="${predictedStatusClass}">${predictedOccupancy}%</strong> - ${predictionMessage}`;
        }
    }

    // Update occupancy circle (only if not closed)
    const circleProgress = document.querySelector('.circle-progress');
    if (circleProgress && !venueClosed) {
        circleProgress.style.strokeDasharray = `${percentage}, 100`;
        circleProgress.style.stroke = getStatusColor(statusClass);
    }

    // Render hourly chart with dynamic axis
    renderHourlyChart(venue);

    // Update directions link
    const directionsLink = document.getElementById('modal-directions');
    if (directionsLink) {
        directionsLink.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.name + ', ' + venue.address)}`;
        directionsLink.target = '_blank';
    }

    // Show modal
    venueModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Get status color
function getStatusColor(statusClass) {
    const colors = {
        green: '#22c55e',
        yellow: '#f59e0b',
        red: '#ef4444'
    };
    return colors[statusClass] || '#22c55e';
}

// Close modal
function closeModal() {
    venueModal.classList.remove('active');
    document.body.style.overflow = '';
    selectedVenue = null;
}

// Render hourly chart using historical averages
function renderHourlyChart(venue) {
    const chartContainer = document.getElementById('hourly-chart');
    const chartLabels = document.getElementById('chart-labels');
    if (!chartContainer) return;

    const currentHour = getCurrentHour();
    const { openHour, closeHour } = getVenueHours(venue);

    // Build chart bars with WEEKLY AVERAGES for operating hours
    let barsHtml = '';
    let labelsHtml = '';

    for (let hour = openHour; hour < closeHour; hour++) {
        // Use average across all days for this hour
        const value = getAverageOccupancyForHour(venue, hour);
        const isCurrent = hour === currentHour;
        const statusClass = getStatusClass(value);

        barsHtml += `<div class="chart-bar ${isCurrent ? 'current' : ''}" style="height: ${value}%; background-color: ${getStatusColor(statusClass)};" title="${hour}:00 - ${value}% (haftalık ort.)"></div>`;
        labelsHtml += `<span>${String(hour).padStart(2, '0')}</span>`;
    }

    chartContainer.innerHTML = barsHtml;

    // Update labels if the element exists
    if (chartLabels) {
        chartLabels.innerHTML = labelsHtml;
    }
}

// Mobile navigation toggle (if needed)
document.addEventListener('DOMContentLoaded', () => {
    const targetBurger = document.querySelector('.target-burger');
    const mainNav = document.querySelector('.main-nav');

    if (targetBurger && mainNav) {
        targetBurger.addEventListener('click', () => {
            targetBurger.classList.toggle('active');
            mainNav.classList.toggle('active');
        });
    }
});

// Keyboard accessibility
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && venueModal.classList.contains('active')) {
        closeModal();
    }
});

// Setup Chatbot Logic
document.addEventListener('DOMContentLoaded', () => {
    setupChatbot();
});

function setupChatbot() {
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send-btn');
    const messagesContainer = document.getElementById('chat-messages');

    if (!chatInput || !sendBtn || !messagesContainer) return;

    // Send message on button click
    sendBtn.addEventListener('click', sendMessage);

    // Send message on Enter key
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    async function sendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        // Add user message
        addMessage(text, 'user');
        chatInput.value = '';
        chatInput.disabled = true;
        sendBtn.disabled = true;

        // Show typing indicator
        const typingId = addTypingIndicator();

        try {
            // Generate dynamic venue context for AI
            const venueContext = getVenueContextForAI();
            const systemPrompt = AI_CONFIG.getSystemPrompt(venueContext);

            // Call OpenRouter API
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${AI_CONFIG.apiKey}`,
                    'HTTP-Referer': AI_CONFIG.siteUrl,
                    'X-Title': AI_CONFIG.siteName,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: AI_CONFIG.model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: text }
                    ]
                })
            });

            if (!response.ok) throw new Error('API Error');

            const data = await response.json();
            const aiText = data.choices[0]?.message?.content || 'Üzgünüm, bir sorun oluştu.';

            // Remove typing indicator and add AI message
            removeTypingIndicator(typingId);
            addMessage(aiText, 'ai');

        } catch (error) {
            console.error('Chat Error:', error);
            removeTypingIndicator(typingId);
            addMessage('Bağlantı hatası oluştu. Lütfen tekrar deneyin.', 'error');
        } finally {
            chatInput.disabled = false;
            sendBtn.disabled = false;
            chatInput.focus();
        }
    }

    function addMessage(text, type) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${type}`;
        msgDiv.textContent = text;
        messagesContainer.appendChild(msgDiv);
        scrollToBottom();
    }

    function addTypingIndicator() {
        const id = 'typing-' + Date.now();
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message typing';
        msgDiv.id = id;
        msgDiv.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
        messagesContainer.appendChild(msgDiv);
        scrollToBottom();
        return id;
    }

    function removeTypingIndicator(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }

    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

console.log('NAYS - Nilüfer Akıllı Yoğunluk Sistemi initialized');
