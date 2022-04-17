import mongoose from "mongoose";

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

mongoose.connect('mongodb+srv://admin:admin@cluster0.2a6ay.mongodb.net/SAD?retryWrites=true&w=majority')

const geoLocationSchema = {
    latitude: Number,
    longitude: Number,
    date: Number,
}
const dateU = new Date().getTime();
const dateL = dateU-2592000000;
const GeoLocation = new mongoose.model('GeoLocation', geoLocationSchema);
for(let i=0;i<10000;i+=1){
    const newdata = new GeoLocation({
        latitude: getRandomArbitrary(26, 30),
        longitude: getRandomArbitrary(76, 79),
        date: getRandomInt(dateL, dateU)
    });
    newdata.save();
}

console.log('success');