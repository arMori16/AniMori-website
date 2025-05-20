import { BadRequestException, Body, ConflictException, Controller, Get, Param, Post, Res, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
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
    @Post('/upload/poster')
    @UseInterceptors(FileInterceptor('image'))
    async changeSeriesPoster(@UploadedFile() file,@Body('seriesName') seriesName:string){
        try{
            const firstPath = path.join(__dirname,'..','..','..',`public/images`);
            const ext = path.extname(file.originalname);
            const pathName = path.join(firstPath,seriesName + ext);
            const extensions = ['jpg', 'png', 'jpeg', 'webp','avif'];
            for (const ext of extensions) {
                const potentialPath = `${firstPath}/${seriesName}.${ext}`; // Используем текущее расширение
                try {
                    await fs.access(potentialPath); // Проверяем наличие файла
                    await fs.rm(potentialPath,{force:true}); // Удаляем файл

                } catch (err) {
                    console.error(`File not found: ${potentialPath}`); // Сообщаем, что файл не найден
                }
            }
            
            await fs.writeFile(pathName,file.buffer).catch((err)=>{
                throw new BadRequestException(`Can't save file to path!\n${err}`);
            })
        }catch(err){
            console.error(err);
            
            throw new BadRequestException(`Error when tried to upload an image!\nMessage: ${err.message}`);
        }
    }
}