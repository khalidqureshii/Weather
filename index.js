import bodyParser from "body-parser"
import axios from "axios"
import express from "express"

const port = 3000;
const app = express();
const apiKEY = "92cc417906aaf9a168cf8c848d2c50ad";
const ninjaKEY = "+MOUaMj7ythhk67PnpepGg==h9QaPCw4FFugn7VK";

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"))

const baseURL = "https://api.openweathermap.org/data/2.5/weather?";

app.get("/", async (req,res) => {
    res.render("index.ejs");
})

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
})  

app.post("/", async(req,res)=>{
    let location = req.body.location_name.toLowerCase(); 
    let state = req.body.state_name.toLowerCase();   
    let country = req.body.country_name.toLowerCase();

    const locFlag = (location!='')?true:false;
    const stateFlag = (state != '')?true:false;
    const countryFlag = (country != '')?true:false;

    if (!locFlag){
        res.render("index.ejs", {message: "Error: No Location entered"});
        return;
    }

    if (locFlag) location = location[0].toUpperCase() + location.substring(1);
    if (stateFlag) state = state[0].toUpperCase() + state.substring(1);
    if (countryFlag) country = country[0].toUpperCase() + country.substring(1);


    let base = `https://api.api-ninjas.com/v1/geocoding?city=${location}`;
    
    if (countryFlag) base = base+`&country=${country}`;

    const result = await axios.get(base, {headers: {'X-Api-Key':ninjaKEY}});
    
    let final = result.data;
    if (final.length > 1){
        let temp = [];
        if (stateFlag) {
            for (let i = 0; i< final.length; i++){
                if (final[i]["state"]  == state && final[i]["name"]==location){
                    temp.push(final[i]);
                }
            }
        }
        if (temp.length > 1 || !stateFlag) {
            let errorMessage = "Please Include ";
            if (!stateFlag) errorMessage += `State`
            if (!countryFlag && !stateFlag) errorMessage += '(Preferably) or Country:  ';
            else if (countryFlag && !stateFlag) errorMessage += ' along with Country: ';
            else if (!countryFlag && stateFlag) errorMessage += "Country along with State: "
            res.render("index.ejs", {message: errorMessage});
            return;
        }
        else if (temp.length == 1) final = temp;
    }

    if (result.data.length==0){
        res.render("index.ejs", {message: "Error: Invalid Location entered"});
        return;
    }
    const lat = final[0]["latitude"];
    const lon = final[0]["longitude"];
    const result2 = await axios.post(baseURL + `lat=${lat}&lon=${lon}&appid=${apiKEY}`);
    res.render("index2.ejs", {locationData: location,weatherData : result2.data["weather"][0], tempData: result2.data["main"], stateData: final[0]["state"], countryData: final[0]["country"]});
})