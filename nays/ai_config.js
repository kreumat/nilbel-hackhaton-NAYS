// AI Chatbot Configuration
const AI_CONFIG = {
    apiKey: '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',
    model: 'google/gemini-2.0-flash-001',

    // Base system prompt - venue context will be injected dynamically
    getSystemPrompt: function (venueContext) {
        return `Sen NAYS (Nilüfer Akıllı Yoğunluk Sistemi) asistanısın. Vatandaşlara mekan bulmalarında yardımcı olursun.

${venueContext}

KURALLAR:
1. KISA cevaplar ver (2-3 cümle MAX). Uzun açıklamalar YAPMA.
2. Sadece sorulana cevap ver, gereksiz bilgi verme.
3. Doluluk verileri haftalık ortalamadır.
4. Kapalı mekanlara açılış saatini söyle.
5. Türkçe konuş, samimi ol, resmi olma.
6. "En boş yer?" diye sorulursa en düşük doluluklu AÇIK mekanı öner.
7. Markdown formatı (**, ##, vb.) KULLANMA.`;
    },

    siteUrl: 'https://nilufer.bel.tr',
    siteName: 'Nilüfer Belediyesi NAYS'
};

/**
 * Generate real-time venue context for AI
 * @returns {string} Formatted venue status
 */
function getVenueContextForAI() {
    if (!venuesData || venuesData.length === 0) {
        return 'MEKAN VERİSİ YÜKLENİYOR...';
    }

    const currentHour = getCurrentHour();
    const timeStr = `${String(currentHour).padStart(2, '0')}:00`;

    let context = `MEKAN DURUMU (Şu an saat ${timeStr}):\n`;

    venuesData.forEach(venue => {
        const isClosed = isVenueClosed(venue);
        const percentage = getOccupancyPercentage(venue);
        const { openHour, closeHour } = getVenueHours(venue);
        const hoursStr = `${String(openHour).padStart(2, '0')}:00-${closeHour === 24 ? '00:00' : String(closeHour).padStart(2, '0') + ':00'}`;

        if (isClosed) {
            context += `• ${venue.name}: KAPALI (Açılış: ${hoursStr})\n`;
        } else {
            const statusText = percentage < 50 ? 'rahat' : percentage < 80 ? 'yoğunlaşıyor' : 'çok yoğun';
            context += `• ${venue.name}: AÇIK - %${percentage} dolu (${statusText}) - Saatler: ${hoursStr}\n`;
        }
    });

    // Add recommendation
    const openVenues = venuesData.filter(v => !isVenueClosed(v));
    if (openVenues.length > 0) {
        const leastOccupied = openVenues.reduce((min, v) =>
            getOccupancyPercentage(v) < getOccupancyPercentage(min) ? v : min
        );
        context += `\nÖNERİ: En az yoğun açık mekan "${leastOccupied.name}" (%${getOccupancyPercentage(leastOccupied)})`;
    } else {
        context += `\nNOT: Şu an tüm mekanlar kapalı.`;
    }

    return context;
}
