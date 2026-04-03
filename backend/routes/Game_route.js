const express = require('express');

const { 
    getGameData, 
    getGameItemDetail,
    getLiveEventByIndex,
    getDriverByRank,
    seedGameData, 
    addMarketItem,
    addLiveEvent,
    addUpcomingRelease,
    joinLiveEvent
} = require('../controller/Game_controller');

const router = express.Router();

router.get('/live-event/:index', getLiveEventByIndex);
router.post('/live-event/:index/participate', joinLiveEvent);
router.get('/driver-detail/:rank', getDriverByRank);
router.get('/detail/:category/:id', getGameItemDetail);
router.get('/', getGameData);
router.post('/seed', seedGameData);

router.post('/add-vehicle', addMarketItem);
router.post('/add-event', addLiveEvent); 
router.post('/add-release', addUpcomingRelease);

module.exports = router;