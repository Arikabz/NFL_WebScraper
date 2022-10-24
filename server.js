const PORT = 6969; 
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();

async function weekScrapper(num) {
    const url= `https://www.cbssports.com/nfl/schedule/2022/regular/${num}/`;
    const dataArray = [];
    await axios(url).then((res)=>{
        const html_data = res.data;
        const $ = cheerio.load(html_data);


        const diffSelector = 'div.TableBaseWrapper  tr'
        const oldSelect = 'div.TableBaseWrapper:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > table:nth-child(1) > tbody:nth-child(3) > tr:nth-child(1)'
        const keysFuture = [
            'AwayLogo',
            'Away',
            'HomeLogo',
            'Home',
            'Time',
            'TV',
            'Venue',
            'Buy Tickets',
        ];

        const keysHappened = [
            'AwayLogo',
            'Away',
            'HomeLogo',
            'Home',
            'result',
        ];


        $(diffSelector).each((parentIndex, parentElem) => {
            let keyIndex = 0;
            const gameDetails = {};
            if (parentIndex <=15){
                    let keys;
                    if($(parentElem).children().length>3){
                        keys = keysFuture;
                    }
                    else{
                        keys = keysHappened
                    }
                $(parentElem).children().each((childId, childElem) => {
                    const value = $(childElem).text().trim();
                    const img = $(childElem).find('figure').find('img').attr('data-lazy');
                    if(childId<2){
                        gameDetails[keys[keyIndex]] = img;
                        keyIndex++ 
                        gameDetails[keys[keyIndex]] = value;
                        keyIndex++ 
                    }
                    else if (value){
                        gameDetails[keys[keyIndex]] = value;
                        keyIndex++ 
                    }
                });
                dataArray.push(gameDetails);
            }
        })
    })
    return dataArray;
}

app.get("/api", async (req,res) => {
    try {
        let arr = []
        for (let i = 1; i<=18; i++){
            arr.push(i)
        }
        Promise.all(arr.map(async x=>{
            return await weekScrapper(x);
        })).then((values) => {
                return res.status(200).json({
                    result: values,
                })
            })
    } catch (err) {
        return res.status(500).json({
            err: err.toString(),
        });
    }
});

app.listen(PORT, () => console.log(`Server running on ${PORT}`));
