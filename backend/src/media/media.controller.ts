import { BadRequestException, ConflictException, Controller, Get, Param, Post, Res, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { MediaService } from "./media.service";
import { Public } from "src/common/decorators/public.decorator";
import * as path from "path";
import {promises as fs} from "fs";
import { Response } from "express";
import { AtGuard } from "src/common/guards";
import { FileInterceptor } from "@nestjs/platform-express";
import { AdminGuard } from "src/common/guards/admin.guard";





@Controller('/media')
export class MediaController{
    constructor(private readonly service:MediaService){}
    @Public()
    @Get('/:getImage/:type')
    async getImage(@Param('getImage') getImage:string,@Param('type') type:string,@Res() res:Response){
        try{
            const extensions = ['jpg', 'png', 'jpeg', 'webp','avif'];
            let pathImage = ''; // Инициализируем pathImage пустой строкой
            const basePath = path.join(__dirname, '..', '..','..', `public/${type}/${getImage}`);
            
            const extname = await path.extname(basePath);
            const baseName = path.basename(getImage, extname);
            
            
            if (extname) {
                // Если расширение уже есть, отправляем файл
                await fs.access(basePath); // Проверяем наличие файла
                return res.sendFile(basePath); // Возвращаем файл
            }
            for (const ext of extensions) {
                const potentialPath = `${basePath}.${ext}`; // Используем текущее расширение
                try {
                    await fs.access(potentialPath); // Проверяем наличие файла
                    return res.sendFile(potentialPath,(err) => {
                        if (err) {
                            console.error('Error sending file:', err);
                            res.status(500).send('Failed to send file');
                        }
                    });

                } catch (err) {
                    console.error(`File not found: ${potentialPath}`); // Сообщаем, что файл не найден
                }
            }
            return res.status(404).send('Image not found');
        }
        catch(err){
            console.error('Error when tried to read',err);
            return res.status(500).json({error:'Cannot connect to the list of images'})
        }

    }
    @UseGuards(AdminGuard)
    @Post('/upload')
    @UseInterceptors(FileInterceptor('image'))
    async addImage(@UploadedFile() file){
        try{
            const firstPath = path.join(__dirname,'..','..','..',`public/images`);
            const fileName = file.originalname;
            const pathName = path.join(firstPath,fileName);
            const fileExists = await fs
            .access(pathName)
            .then(() => true) // File exists
            .catch(() => false); // File does not exist

            if (fileExists) {
                await fs.rm(pathName);
            }
            await fs.writeFile(pathName,file.buffer).catch((err)=>{
            throw new BadRequestException(`Can't save file to path!\n${err}`);
            })
        }catch(err){
            throw new BadRequestException('Error when tried to upload an image!')
        }
    }
}