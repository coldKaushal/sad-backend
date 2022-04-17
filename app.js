// import {GetScore} from "./utilities//score.js";
// const express = require('express');
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import skmeans from "skmeans";
const app = express();
// const mongoose = require('mongoose');
// const cors = require("cors");
// const app = express();


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

});


app.post('/checkSafety', function(req, res){
    console.log(req.query);
    const latitude= req.query.latitude;
    const longitude= req.query.longitude;
    const date = req.query.date;
    const hours = Number((new Date(Number(date))).getHours());
    const uHours = hours+3;
    const lHours = (hours-3+24)%24;
    let data = {};
    console.log(hours);


    GeoLocation.find(
        {latitude: {$gt: Number(latitude)-0.5, $lt: Number(latitude)+0.5},
        longitude: {$gt: Number(longitude)-0.5, $lt: Number(longitude)+0.5},
        date: {$gt: Number(date)-2592000000}
    }).sort({date:1}).exec(function(err, founds){
        if(err){
            res.status(502);
            res.send(err);
        }else{
            founds.forEach(found => {
                const thisDate = new Date(Number(found.date));
                const thisHours = Number(thisDate.getHours());
                const month  = Number(thisDate.getMonth())+1;
                const fullDate = thisDate.getDate() + '-' + month+ '-' + thisDate.getFullYear();
                if(uHours>lHours){
                    if(thisHours>lHours && thisHours<uHours){
                        data[fullDate]==null?data[fullDate]=0: data[fullDate]++;
                    }
                }else{
                    if(thisHours<uHours || thisHours>lHours){
                        data[fullDate]==null?data[fullDate]=0: data[fullDate]++;
                    }
                }
                
            });
            var chartData = [];
            for (const [key, value] of Object.entries(data)) {
                if(value!=0){
                    const newData = {};
                newData.Date = key;
                newData.cases= value;
                chartData.push(newData);
                }
              }
            // GetScore(data);
            res.send(chartData);
        }
    });

    
});

function getScore(data){
    var prob=[];
    var n = data.length;
    for (var i=1;i<n-1;i++){
      var thisProb = 0;
      var count=0;
      for(var j=0;j<n;j++){
        if(j+i<n && data[j+i]!=0){
          thisProb += data[j]/data[j+i];
        }
        else if(j+i<n){
            count++;
        }
      }
      
      thisProb = thisProb*10;
      if(count!=0){
          thisProb = thisProb/count;
      }
      prob.push(thisProb);
    }
    var score=0;
    var count=0;
    var N = prob.length;
    for(var i=0;i<N;i++)
    {
      if(data[i]==0){
        score+=prob[i];
      }else{
        score+=prob[i]*data[i]*0.01*(N-i);
        count+=0.01*(N-i);
      }
    }
    score = score/N;
    score = 10-score;
    return score;
  }

  
app.post('/safetyScore', function(req, res){
    console.log(req.query);
    const latitude= req.query.latitude;
    const longitude= req.query.longitude;
    const date = req.query.date;
    const hours = Number((new Date(Number(date))).getHours());
    const uHours = hours+3;
    const lHours = (hours-3+24)%24;
    let data = {};
    console.log(hours);


    GeoLocation.find(
        {latitude: {$gt: Number(latitude)-0.5, $lt: Number(latitude)+0.5},
        longitude: {$gt: Number(longitude)-0.5, $lt: Number(longitude)+0.5},
        date: {$gt: Number(date)-2592000000}
    }).sort({date:1}).exec(function(err, founds){
        if(err){
            res.sendStatus(502);
            res.send('error');
        }else{
            if(founds){
                founds.forEach(found => {
                    const thisDate = new Date(Number(found.date));
                    const thisHours = Number(thisDate.getHours());
                    const month  = Number(thisDate.getMonth())+1;
                    const fullDate = thisDate.getDate() + '-' + month+ '-' + thisDate.getFullYear();
                    if(uHours>lHours){
                        if(thisHours>lHours && thisHours<uHours){
                            data[fullDate]==null?data[fullDate]=0: data[fullDate]++;
                        }
                    }else{
                        if(thisHours<uHours || thisHours>lHours){
                            data[fullDate]==null?data[fullDate]=0: data[fullDate]++;
                        }
                    }
                    
                });
                var chartData = [];
                for (const [key, value] of Object.entries(data)) {
                    chartData.push(value);
                    }
                    const score = getScore(chartData);
                    // console.log(chartData);
                    // console.log(chartData.length);
                    console.log(score);
                    res.status(200);
                    res.send(String(score));
               
            }else{
                res.status(404);
                res.send('error');
                console.log('no result');
            }
        };

});
})




app.post("/centers", function(req, res){
    console.log(req.query);
    const latitude = req.query.latitude;
    const longitude = req.query.longitude;
    const centers = Number(req.query.centers);
    console.log(centers);
    const date = new Date().getTime();
    let data = [];
    GeoLocation.find({latitude: {$gt: Number(latitude)-0.5, $lt: Number(latitude)+0.5},
    longitude: {$gt: Number(longitude)-0.5, $lt: Number(longitude)+0.5},
    date: {$gt: Number(date)-2592000000}},{latitude: 1, longitude:1, _id:0}, function(err, found){
        if(err){
            res.status(502);
            res.send('error');
        }else{
            if(!found){
                res.status(404);
                res.send('no');
            }else{
                found.forEach(element => {
                    const newData = [element.latitude, element.longitude];
                    data.push(newData);
                });
                const clusters = skmeans(data, centers);
                res.send(clusters.centroids);
                
            }
        }
    } );
    
    
})

app.post("/shistory", function(req, res){
    
    const latitude=req.query.latitude;
    const longitude = req.query.longitude;
    const date = new Date().getTime();
    
    let data = [];
    GeoLocation.find(
        {latitude: {$gt: Number(latitude)-0.5, $lt: Number(latitude)+0.5},
        longitude: {$gt: Number(longitude)-0.5, $lt: Number(longitude)+0.5},
        date: {$gt: Number(date)-2592000000}
    }).sort({date:1}).exec(function(err, founds){
        if(err){
            res.sendStatus(502);
            res.send('error');
        }else{
            if(founds){
                data = founds;
                data.reverse();
                res.send(data);
            }else{
                res.status(404);
                res.send('error');
                console.log('no result');
            }
        };

});
})

app.listen(4000, function(err){
    if(err){
        console.log(err);
    }else{
        console.log("server started at port 4000");
    }
});



