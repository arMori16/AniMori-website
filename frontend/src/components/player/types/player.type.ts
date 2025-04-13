export enum EnumPlayerQuality{
    '1080p' = '1080p',
    '720p' = '720p',
    '480p' = '480p',
}
export interface HTMLCustomVideoElement extends HTMLVideoElement{
    requestFullScreen?:()=>Promise<void>;
    mozRequestFullScreen?:()=>Promise<void>;
    webkitRequestFullScreen?:()=>Promise<void>;
    msRequestFullScreen?:()=>Promise<void>;
}