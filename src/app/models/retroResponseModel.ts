import { ResponseModel } from "./ResponseModel";
import { Retro } from "./retro";

export interface RetroResponseModel extends ResponseModel {
    data?: Retro[];
}