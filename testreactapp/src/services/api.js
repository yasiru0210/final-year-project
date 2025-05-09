

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8082';



class APIError extends Error {
    constructor(message, status, data = null) {
        super(message);
        this.name = 'APIError';
        this.status = status;
        this.data = data;
    }
}


async function makeRequest(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Accept': 'application/json',
                ...options.headers,
            },
            ...options,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new APIError(
                errorData?.message || 'An error occurred',
                response.status,
                errorData
            );
        }

        return await response.json();
    } catch (error) {
        if (error instanceof APIError) {
            throw error;
        }
        throw new APIError(
            'Network error occurred',
            0,
            { originalError: error.message }
        );
    }
}

/**
 * Submit sketch for identification with feature weights
 */
export async function submitIdentification(sketch, weights) {
    const formData = new FormData();
    formData.append("sketchFile", sketch);
    formData.append("weightsJson", JSON.stringify(weights));

    return makeRequest('/api/identify', {
        method: 'POST',
        body: formData,
    });
}

/**
 * Fetch identification results
 */
export async function fetchResults() {
    return makeRequest('/api/results');
}

/**
 * Upload mugshot to admin database
 */
export async function uploadMugshot(file, data) {
    const formData = new FormData();
    formData.append("file", file);
    Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
    });

    return makeRequest('/api/admin/upload', {
        method: 'POST',
        body: formData,
    });
}

/**
 * Fetch sketch history
 */
export async function fetchSketchHistory() {
    return makeRequest('/api/history');
}

/**
 * Delete sketch from history
 */
export async function deleteSketch(sketchId) {
    return makeRequest(`/api/history/${sketchId}`, {
        method: 'DELETE',
    });
}

/**
 * Verify admin credentials
 */
export async function verifyAdmin(password) {
    return makeRequest('/api/admin/verify', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
    });
}

/**
 * Update feature weights for identification algorithm
 */
export async function updateFeatureWeights(weights) {
    return makeRequest('/api/admin/weights', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(weights),
    });
}

/**
 * Get system statistics
 */
export async function getSystemStats() {
    return makeRequest('/api/stats');
}

// Error handling utility
export function isAPIError(error) {
    return error instanceof APIError;
}

// Export error class for use in components
export { APIError };
  