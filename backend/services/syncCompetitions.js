const dotenv = require('dotenv');
dotenv.config({path:'../.env'});
const axios = require('axios');
const Competition = require('../models/Competition');
const competitions = [
    { id: '4406', name: 'Liga Argentina' }
]
const API_KEY = process.env.SPORTSDB_API_KEY;

const syncCompetitions = async () => {
    for (const comp of competitions) {
        const url = `https://www.thesportsdb.com/api/v1/json/${API_KEY}/lookupleague.php?id=${comp.id}`;
        const { data } = await axios.get(url);
        const apiComp = data.leagues?.[0];

        if (apiComp) {
            await Competition.findOneAndUpdate(
                { externalId: comp.id },
                {
                    externalId: comp.id,
                    name: apiComp.strLeague,
                    image: apiComp.strBadge || null,
                    image2: apiComp.strLogo || null,
                },
                { upsert: true }
            );
        }
    }
};

module.exports = syncCompetitions;
