export interface Feedback {
    id?: string,
    retroId: string | undefined,
    categoryId: string;
    content: string;
    score: string;
    isDeleted: boolean;
}