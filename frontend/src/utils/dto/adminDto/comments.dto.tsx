export interface CommentsDto{
    UserId:number,
    Id:number,
    ParentId?:number,
    CommentText:string,
    SeriesName:string,
    createdAt:string,
    UserName:string,
    Owner?:boolean | null
}