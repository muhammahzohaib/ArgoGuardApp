const express = require('express');
const { analyzeImage, getHistory, getAnalysisDetail, checkContradictions } = require('../controllers/analyze_controller');
const { protect } = require('../middleware/auth_middleware');

const router = express.Router();

router.post('/', protect, analyzeImage);
router.post('/contradiction', protect, checkContradictions);
router.get('/history', protect, getHistory);
router.get('/:id', protect, getAnalysisDetail);

module.exports = router;
