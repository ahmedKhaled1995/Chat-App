const generateMessage = (text, senderName) => {
    return {
        text,
        createdAt: new Date().getTime(),
        senderName
    };
};

const generateLocationMessage = (locationObj, senderName) => {
    return {
        urlString: `https://www.google.com/maps?q=${locationObj.lat},${locationObj.long}`,
        createdAt: new Date().getTime(),
        senderName
    };
};

module.exports = {
    generateMessage,
    generateLocationMessage
};