const express = require('express');
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const bodyParser = require('body-parser');
const cors = require("cors");

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const server = http.createServer(app);

const fs = require('fs');


const io = new Server(server,{
    cors:{
        origin:"*",
        methods:["GET","POST"],
    }
});


io.on('connection',(socket)=>{
        console.log("User connected",socket.id);

        socket.on("alertAllClients",(data)=>{
            console.log("Data from client",data)
            socket.broadcast.emit("serverUpdate",data);
        })

});

app.post('/makeTheatreOnline',(req,res)=>{

    // console.log(req.body);
    let name = req.body.name;
    let db = fs.readFileSync('./database/db.json');
    // console.log(db);
    db = JSON.parse(db);
    db[name] = req.body;
    // console.log(db)
    let response= fs.writeFileSync('./database/db.json',JSON.stringify(db));
    console.log(response);
    res.send(200)
});

app.post('/getTheatreInfo',(req,res)=>{
    let name = req.body.name;
    // console.log("Looking for theatre" ,name);
    let db = fs.readFileSync('./database/db.json');
    db=JSON.parse(db)
    // console.log(db[name])
    res.send(db[name]);
});

app.post('/bookTickets',(req,res)=>{
    // console.log(req.body)
    let db = fs.readFileSync('./database/db.json');
    db=JSON.parse(db)
    let seating = db[req.body.theatreName].seating;
    // console.log(seating)
    let upDatedSeating = [];
    let selectedChairs = [];
    for(let i=0;i<req.body.selected.length;i++){
        selectedChairs.push(req.body.selected[i].chairno);
    }
    // console.log(selectedChairs);
    for(let i=0;i<seating.length;i++){
        let row =seating[i];
        let newRow =[];
        for(let j=0;j<row.length;j++){
            let chair = row[j].chair;
            let availability = row[j].availability;
            console.log(chair,availability)
            if(!availability){
                    newRow.push({
                        chair:chair,
                        availability:availability
                    })
            }
            else{
                console.log("else block")
                if(selectedChairs.includes(chair)){
                    console.log("pushing False")
                    newRow.push({
                        chair:chair,
                        availability:false
                    })
                    console.log(newRow)
                }
                else{
                    newRow.push({
                        chair:chair,
                        availability:true
                    })
                }
            }
        }
        upDatedSeating.push(newRow)
    }
    console.log(upDatedSeating);

    db[req.body.theatreName].seating = upDatedSeating;
    let response= fs.writeFileSync('./database/db.json',JSON.stringify(db));
    console.log(response);

    res.send(200)
});

server.listen(3001,()=>{
    console.log("SERVER IS RUNNING");
});