import { Router } from 'express';
import authRoutes from './auth.routes';
import pharmacyRoutes from './pharmacy.routes';
import medicationRoutes from './medication.routes';
import stockRoutes from './stock.routes';
import searchRoutes from './search.routes';
import onDutyRoutes from './onDuty.routes';
import reportRoutes from './report.routes';
import alertRoutes from './alert.routes';

export const router = Router();

router.use('/auth', authRoutes);
router.use('/pharmacies', pharmacyRoutes);
router.use('/medications', medicationRoutes);
router.use('/stock', stockRoutes);
router.use('/search', searchRoutes);
router.use('/on-duty', onDutyRoutes);
router.use('/reports', reportRoutes);
router.use('/alerts', alertRoutes);
