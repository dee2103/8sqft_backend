import express from "express";
import { getAgreements, getAgreementDetails } from "../controllers/agreementController.js"; 

const router = express.Router();

router.get('/', getAgreements);

router.get('/details/:id', getAgreementDetails);

export default router;
