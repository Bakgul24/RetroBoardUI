import { Feedback } from "./feedback";
import { ResponseModel } from "./ResponseModel";

export interface FeedbackResponseModel extends ResponseModel {
    data: Feedback[];
}