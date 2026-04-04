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
    joinLiveEvent,
    incrementDownloadCount,
    postGameReview,
    updateGameItem,
    deleteGameItem
} = require('../controller/Game_controller');

const router = express.Router();

router.get('/live-event/:index', getLiveEventByIndex);
router.post('/live-event/:index/participate', joinLiveEvent);
router.get('/driver-detail/:rank', getDriverByRank);
router.get('/detail/:category/:id', getGameItemDetail);
router.post('/detail/:category/:id/download', incrementDownloadCount);
router.post('/detail/:category/:id/review', postGameReview);
router.put('/item/:category/:id', updateGameItem);
router.delete('/item/:category/:id', deleteGameItem);
router.get('/', getGameData);
router.post('/seed', seedGameData);

router.post('/add-vehicle', addMarketItem);
router.post('/add-event', addLiveEvent); 
router.post('/add-release', addUpcomingRelease);

module.exports = router;