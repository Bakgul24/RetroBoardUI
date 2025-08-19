import { ResponseModel } from "./ResponseModel";
import { Team } from "./team";

export interface TeamResponseModel extends ResponseModel {
    data: Team[];
}