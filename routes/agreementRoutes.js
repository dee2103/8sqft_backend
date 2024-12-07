import express from "express";
import { createAgreement, getAgreements, getAgreementDetails } from "../controllers/agreementController.js"; 

const router = express.Router();

router.post('/agreements', createAgreement);

router.get('/agreements', getAgreements);

router.get('/details/:id', getAgreementDetails);

export default router;
