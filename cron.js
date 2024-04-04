var cron = require('node-cron');
const axios = require('axios');

const url = 'http://localhost:8070/wcast/addrecord';

function addWeatherRecords() {
    function getRandomFloat(min, max) {
        return Math.random() * (max - min) + min;
    }

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    async function fetchData() {
        const url = 'http://localhost:8070/district/getDistricts';
        const headers = {
            'Content-Type': 'application/json',
            // Add other headers as needed
        };

        try {
            const response = await axios.get(url, { headers });
            return response.data;
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }

    async function postWeatherData(data) {
        const url = 'http://localhost:8070/wcast/addrecord';
        const headers = {
            'authkey': process.env.AUTHKEY
        }
        try {
            const response = await axios.post(url, data ,{headers});
            return response.data;
        } catch (error) {
            console.error('error', error);
            throw error;
        }
    }

    function generateDataForDistrict(district) {
        const temperature = getRandomFloat(25, 35).toFixed(2);
        const humidity = getRandomInt(90, 100);
        const airPressure = getRandomFloat(1000, 1025).toFixed(2);
        const dateTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Colombo' }); // Current date-time
        const isExpired = false;

        return {
            districtId: district.districtId,
            districtName: district.name,
            temperature: parseFloat(temperature),
            humidity,
            airPressure: parseFloat(airPressure),
            dateTime,
            isExpired
        };
    }

    (async () => {
        try {
            const apiResponse = await fetchData();
            const districtArray = apiResponse.map(obj => ({
                districtId: obj.districtId,
                name: obj.name
            }));

            const districtDataArray = await Promise.all(districtArray.map(district => generateDataForDistrict(district)));

            try {
                const weatherResponse = await postWeatherData(districtDataArray);
                console.log(weatherResponse);
            } catch (error) {
                console.log(error);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    })();
}

function deleteWeatherRecords(){

    async function deleteWeatherCall(data) {
        const url = 'http://localhost:8070/wcast/delete';
        const headers = {
            'authkey': process.env.AUTHKEY
        }
        try {
            const response = await axios.delete(url,{headers});
            return response.data;
        } catch (error) {
            console.error('error', error);
            throw error;
        }
    }

    (async () => {
        try {
            const apiResponse = await deleteWeatherCall();
            console.log(apiResponse);
        } catch (error) {
            console.error('Error:', error);
        }
    })();

}

const task = cron.schedule('*/5 * * * * *', addWeatherRecords);
const task2=cron.schedule('*/13 * * * * *', deleteWeatherRecords);

module.exports = task;
