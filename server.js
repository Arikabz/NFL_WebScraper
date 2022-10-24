const PORT = 6969; 
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();

async function webScraper() {
    const url= "https://www.cbssports.com/nfl/schedule/2022/regular/8/";
    const dataArray = [];
    await axios(url).then((res)=>{
        const html_data = res.data;
        const $ = cheerio.load(html_data);


        const diffSelector = 'div.TableBaseWrapper:nth-child(2) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > table:nth-child(1) > tbody:nth-child(3) > tr'
        const keys = [
            'AwayLogo',
            'Away',
            'HomeLogo',
            'Home',
            'Away',
            'Home',
            'Time',
            'TV',
            'result',
        ];

        $(diffSelector).each((parentIndex, parentElem) => {
            let keyIndex = 0;
            const gameDetails = {};
            if (parentIndex <=16){
                $(parentElem).children().each((childId, childElem) => {
                    const value = $(childElem).text();
                    console.log(value)
                    const img = $(childElem).find('figure').find('img').attr('data-lazy');
                    console.log(img)
                    if(img&&value){
                        gameDetails[keys[keyIndex]] = img;
                        gameDetails[keys[keyIndex+1]] = value;
                        keyIndex += 2
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
        const games = await webScraper();
        return res.status(200).json({
            result: games,
        });
    } catch (err) {
        return res.status(500).json({
            err: err.toString(),
        });
    }
});

app.listen(PORT, () => console.log(`Server running on ${PORT}`));
