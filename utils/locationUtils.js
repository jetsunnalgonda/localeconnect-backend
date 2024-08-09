export function parseLocationData(location) {
    let locationData = {};
    try {
        locationData = typeof location === 'string' ? JSON.parse(location) : location;
    } catch (error) {
        throw new Error('Invalid location data');
    }

    if (locationData && (locationData.latitude === undefined || locationData.longitude === undefined)) {
        throw new Error('Latitude and Longitude must be provided');
    }

    return locationData;
}
