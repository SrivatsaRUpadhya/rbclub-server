"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtPayloadSchema = void 0;
const zod_1 = require("zod");
exports.jwtPayloadSchema = zod_1.z.object({
    data: zod_1.z.string(),
    iat: zod_1.z.number(),
    exp: zod_1.z.number(),
    // Add other expected properties here
});
