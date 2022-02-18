const express = require('express');
const mongoose = require('mongoose');
const cors = require("cors");
const app = express();


app.use(cors());

mongoose.connect('mongodb+srv://admin:admin@cluster0.2a6ay.mongodb.net/SAD?retryWrites=true&w=majority')

const geoLocationSchema = {
    latitude: Number,
    longitude: Number,
    date: Number,
}

const GeoLocation = new mongoose.model('GeoLocation', geoLocationSchema);

app.post('/enterData', function(req, res){
    const data = req.query;
    console.log(data);
    const newData = new GeoLocation(data);
    newData.save(function(err){
        if(err){
            res.status(502);
            res.send('can not enter the data');
        }else{
            res.status(200);
            res.send('data entered successfully');
        }
    });

})

app.listen(4000, function(err){
    if(err){
        console.log(err);
    }else{
        console.log("server started at port 4000");
    }
})