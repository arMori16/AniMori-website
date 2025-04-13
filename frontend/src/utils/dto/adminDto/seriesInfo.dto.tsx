export interface SeriesInfo{
    AlternitiveNames:string[]
    SeriesName:string,
    Description:string,
    SeriesViewName:string,
    Status:string,
    Type:string,
    ReleaseYear:string,
    Genre:string[],
    Shikimori:string | null,
    Studio:string[],
    AmountOfEpisode:number,
    VoiceActing:string[],
    CurrentEpisode?:number,
    NextEpisodeTime?:string
}