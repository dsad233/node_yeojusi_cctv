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

app.get('/data', async (req, res) => {
    try {
        const { page } = req.query;
        const url = `http://api.odcloud.kr/api/15105004/v1/uddi:9ec9834d-e6d7-439a-a3e6-c595770ca115?page=${page}&perPage=1000&returnType=json&serviceKey=${key}`;
        const getData = await axios.get(url, {})
        .then((res) => res)
        .catch((err) => console.error(err));

        const find = getData.data.data.filter((data) => data.소재지지번주소.includes("경기도 여주시") && data.설치목적구분.includes("교통단속"));

        return res.status(200).json({ data : find });
    } catch (err){
        console.error("에러 발생", err);
    }
});

// 카카오 지도 api
app.get('/', async (req, res)=>{
    const url = `http://api.odcloud.kr/api/15105004/v1/uddi:9ec9834d-e6d7-439a-a3e6-c595770ca115?page=1&perPage=1000&returnType=json&serviceKey=${key}`;
    const getData = await axios.get(url, {})
    .then((res) => res)
    .catch((err) => console.error(err));
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
});