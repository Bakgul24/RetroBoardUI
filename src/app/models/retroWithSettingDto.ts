import { RetroSettingDto } from "./retroSettingDto";

export interface RetroWithSettingDto {
    name: string,
    teamId: string,
    settings: RetroSettingDto[],
}