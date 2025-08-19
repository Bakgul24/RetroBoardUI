import { ResponseModel } from "./ResponseModel";
import { Comment } from "./comment";

export interface UserCommentResponseModel extends ResponseModel {
    data: Comment[];
}