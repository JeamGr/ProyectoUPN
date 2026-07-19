import { } from 'express';

declare global {
    namespace Express {
        interface Request {
            dto?: any;
        }
    }
}