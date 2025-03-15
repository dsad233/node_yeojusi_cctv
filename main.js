import express from "express";
import dotenv from "dotenv";
import axios from "axios";
dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended : true }));

app.set("view engine", "ejs");

app.listen(port, () => {
    console.log(port, "로 서버 실행중.");
});

const key = process.env.SERVICE_KEY;
const kakaoKey = process.env.KAKAO_JAVASCRIPT_KEY;

// 여주시 교통 단속 CCTY 위치 GET
app.get('/', async (req, res)=>{
    try {
        const url = `http://api.odcloud.kr/api/15105004/v1/uddi:9ec9834d-e6d7-439a-a3e6-c595770ca115?page=1&perPage=1000&returnType=json&serviceKey=${key}`;
        const getData = await axios.get(url, {})
        .then((res) => res)
        .catch((err) => {
            console.error("axios 에러 발생 : ",err);
            return res.status(500).json({ message : err });
        });
        const find = getData.data.data.filter((item, index, self) => {
            if(item.소재지지번주소.includes("경기도 여주시") && item.설치목적구분.includes("교통단속")){
                return index === self.findIndex((data) => data.위도 === item.위도 && data.경도 === item.경도);
            }
        });
    
        const newMap = find.map((data) => { 
            return { lon : Number(data.경도), lat : Number(data.위도) };
        });
        
        res.render('kakao',{
            KAKAO_JAVASCRIPT_KEY:kakaoKey,
            data : newMap
        });
    } catch(err){
        console.error("서버 에러 발생 : ",err);
        return res.status(500).json({ mesasge: "서버 에러 발생." });
    }
});


// 여주시 버스 정류소 위치 GET
app.get('/bus', async (req, res) => {
    try {
        const busUrl = `https://api.odcloud.kr/api/15109748/v1/uddi:5345f8b5-2142-49b0-812a-af5e18e07893?page=1&perPage=1000&serviceKey=${process.env.BUS_SERVICE_KEY}`;
        const data = await axios.get(busUrl, {})
        .then((res) => res.data.data)
        .catch((err) => {
            console.error("axios 에러 발생 : ",err);
            return res.status(500).json({ message : err });
        });

        const newMap = data.map((data) => {
            return { lon : Number(data.경도), lat : Number(data.위도) };
        });
        
        res.render('busStaykakao', {
            KAKAO_JAVASCRIPT_KEY:kakaoKey,
            data : newMap
        });
    } catch(err){
        console.error("서버 에러 발생 : ",err);
        return res.status(500).json({ mesasge: "서버 에러 발생." });
    }
});