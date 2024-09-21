function createResponse(statusCode, statusMessage, statusDescription = "", data = {}) {
    return {
        response: {
            status: {
                statusCode,
                statusMessage,
                statusDescription
            },
            data
        }
    };
}

module.exports = { createResponse };
