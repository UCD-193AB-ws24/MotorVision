{/*These are the rates at which the data will be read from the device
    will be customizable in the settings page
    and will be essential */}

let readDataRate = 0.0
let sendCrashDataRate = 0.0
let bufferSize = 0

export const setReadDataRate = (value) => {
    readDataRate = value;
}
export const getReadDataRate = () => readDataRate;

export const setSendCrashDataRate = (value) => {
    sendCrashDataRate = value;
}
export const getSendCrashDataRate = () => sendCrashDataRate;

export const setBufferSize = (value) => {
    bufferSize = value;
}
export const getBufferSize = () => bufferSize;