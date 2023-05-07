import {
    SERVER_NAME_AVMNITE_02H,
    SERVER_NAME_CSEC,
    SERVER_NAME_FULCRUMASSETS,
    SERVER_NAME_I_I_I_I,
    SERVER_NAME_RUN4THEH111Z
} from "/constants/ServerNames";
import {
    AUGMENTATION_DATA_JACK,
    AUGMENTATION_NEMEAN_SUBDERMAL_WEAVE,
    AUGMENTATION_NEURALSTIMULATOR,
    CITY_AEVUM,
    CITY_CHONGQING,
    CITY_ISHIMA,
    CITY_NEW_TOKYO,
    CITY_SECTOR_12,
    CITY_VOLHAVEN
} from "/constants/Singularity";
import {
    COMPANY_NAME_BACHMAN_AND_ASSOCIATES,
    COMPANY_NAME_BLADE_INDUSTRIES,
    COMPANY_NAME_CLARKE_INCORPORATED,
    COMPANY_NAME_ECORP,
    COMPANY_NAME_FOUR_SIGMA,
    COMPANY_NAME_FULCRUM_SECRET_TECHNOLOGIES,
    COMPANY_NAME_KUAIGONG_INTERNATIONAL,
    COMPANY_NAME_MEGACORP,
    COMPANY_NAME_NWO,
    COMPANY_NAME_OMNITEK_INCORPORATED
} from "/constants/Company";

//////////////////////////
//FACTION NAME CONSTANTS//
//////////////////////////

export const FACTION_NAME_CYBERSEC = 'CyberSec';
export const FACTION_NAME_TIAN_DI_HUI = 'Tian Di Hui';
export const FACTION_NAME_NETBURNERS = 'Netburners';
export const FACTION_NAME_SHADOWS_OF_ANARCHY = 'Shadows of Anarchy';
export const FACTION_NAME_SECTOR_12 = 'Sector-12';
export const FACTION_NAME_CHONGQING = 'Chongqing';
export const FACTION_NAME_NEW_TOKYO = 'New Tokyo';
export const FACTION_NAME_ISHIMA = 'Ishima';
export const FACTION_NAME_AEVUM = 'Aevum';
export const FACTION_NAME_VOLHAVEN = 'Volhaven';
export const FACTION_NAME_NITESEC = 'NiteSec';
export const FACTION_NAME_THE_BLACK_HAND = 'The Black Hand';
export const FACTION_NAME_BITRUNNERS = 'BitRunners';
export const FACTION_NAME_ECORP = 'ECorp';
export const FACTION_NAME_MEGACORP = 'MegaCorp';
export const FACTION_NAME_KUAIGONG_INTERNATIONAL = 'KuaiGong International';
export const FACTION_NAME_FOUR_SIGMA = 'Four Sigma';
export const FACTION_NAME_NWO = 'NWO';
export const FACTION_NAME_BLADE_INDUSTRIES = 'Blade Industries';
export const FACTION_NAME_OMNITEK_INCORPORATED = 'OmniTek Incorporated';
export const FACTION_NAME_BACHMAN_AND_ASSOCIATES = 'Bachman & Associates';
export const FACTION_NAME_CLARKE_INCORPORATED = 'Clarke Incorporated';
export const FACTION_NAME_FULCRUM_SECRET_TECHNOLOGIES = 'Fulcrum Secret Technologies';
export const FACTION_NAME_SLUM_SNAKES = 'Slum Snakes';
export const FACTION_NAME_TETRADS = 'Tetrads';
export const FACTION_NAME_SILHOUETTE = 'Silhouette';
export const FACTION_NAME_SPEAKERS_FOR_THE_DEAD = 'Speakers for the Dead';
export const FACTION_NAME_THE_DARK_ARMY = 'The Dark Army';
export const FACTION_NAME_THE_SYNDICATE = 'The Syndicate';
export const FACTION_NAME_THE_COVENANT = 'The Covenant';
export const FACTION_NAME_DAEDALUS = 'Daedalus';
export const FACTION_NAME_ILLUMINATI = 'Illuminati';

///////////////////////////
//FACTION GROUP CONSTANTS//
///////////////////////////
export const FACTIONS_EARLY_GAME = [
    FACTION_NAME_CYBERSEC,
    FACTION_NAME_TIAN_DI_HUI,
    FACTION_NAME_NETBURNERS,
    FACTION_NAME_SHADOWS_OF_ANARCHY,
];

export const FACTIONS_CITY = [
    FACTION_NAME_SECTOR_12,
    FACTION_NAME_CHONGQING,
    FACTION_NAME_NEW_TOKYO,
    FACTION_NAME_ISHIMA,
    FACTION_NAME_AEVUM,
    FACTION_NAME_VOLHAVEN,
];

export const FACTIONS_HACKING = [
    FACTION_NAME_NITESEC,
    FACTION_NAME_THE_BLACK_HAND,
    FACTION_NAME_BITRUNNERS,
];

export const FACTIONS_MEGACORPORATIONS = [
    FACTION_NAME_ECORP,
    FACTION_NAME_MEGACORP,
    FACTION_NAME_KUAIGONG_INTERNATIONAL,
    FACTION_NAME_FOUR_SIGMA,
    FACTION_NAME_NWO,
    FACTION_NAME_BLADE_INDUSTRIES,
    FACTION_NAME_OMNITEK_INCORPORATED,
    FACTION_NAME_BACHMAN_AND_ASSOCIATES,
    FACTION_NAME_CLARKE_INCORPORATED,
    FACTION_NAME_FULCRUM_SECRET_TECHNOLOGIES,
];

export const FACTIONS_CRIMINAL = [
    FACTION_NAME_SLUM_SNAKES,
    FACTION_NAME_TETRADS,
    FACTION_NAME_SILHOUETTE,
    FACTION_NAME_SPEAKERS_FOR_THE_DEAD,
    FACTION_NAME_THE_DARK_ARMY,
    FACTION_NAME_THE_SYNDICATE,
];

export const FACTIONS_ENDGAME = [
    FACTION_NAME_THE_COVENANT,
    FACTION_NAME_DAEDALUS,
    FACTION_NAME_ILLUMINATI,
];

export const ALL_FACTIONS = [
    ...FACTIONS_EARLY_GAME,
    ...FACTIONS_CITY,
    ...FACTIONS_HACKING,
    ...FACTIONS_MEGACORPORATIONS,
    ...FACTIONS_CRIMINAL,
    ...FACTIONS_ENDGAME,
];

export const FACTIONS_BACKDOOR_REQUIREMENTS = {
    [FACTION_NAME_CYBERSEC]: SERVER_NAME_CSEC,
    [FACTION_NAME_NITESEC]: SERVER_NAME_AVMNITE_02H,
    [FACTION_NAME_THE_BLACK_HAND]: SERVER_NAME_I_I_I_I,
    [FACTION_NAME_BITRUNNERS]: SERVER_NAME_RUN4THEH111Z,
    [FACTION_NAME_FULCRUM_SECRET_TECHNOLOGIES]: SERVER_NAME_FULCRUMASSETS,
}

export const FACTIONS_DONT_AUTO_JOIN = [
    FACTION_NAME_SECTOR_12,
    FACTION_NAME_CHONGQING,
    FACTION_NAME_NEW_TOKYO,
    FACTION_NAME_ISHIMA,
    FACTION_NAME_AEVUM,
    FACTION_NAME_VOLHAVEN,
];

export const FACTIONS_PREFERRED_ORDER = [
    FACTION_NAME_CYBERSEC,
    FACTION_NAME_NETBURNERS,
    FACTION_NAME_SECTOR_12,
    FACTION_NAME_NITESEC,

    FACTION_NAME_CHONGQING,
    FACTION_NAME_NEW_TOKYO,
    FACTION_NAME_ISHIMA,
    FACTION_NAME_VOLHAVEN,
    FACTION_NAME_TIAN_DI_HUI,

    FACTION_NAME_THE_BLACK_HAND,
    FACTION_NAME_BITRUNNERS,

    FACTION_NAME_SLUM_SNAKES,
    FACTION_NAME_TETRADS,
    FACTION_NAME_THE_SYNDICATE,
    FACTION_NAME_SPEAKERS_FOR_THE_DEAD,
    FACTION_NAME_THE_DARK_ARMY,
    // FACTION_NAME_AEVUM,

    FACTION_NAME_FOUR_SIGMA,
    FACTION_NAME_ECORP,
    FACTION_NAME_CLARKE_INCORPORATED,
    FACTION_NAME_KUAIGONG_INTERNATIONAL,
    FACTION_NAME_BLADE_INDUSTRIES,
    FACTION_NAME_OMNITEK_INCORPORATED,
    FACTION_NAME_BACHMAN_AND_ASSOCIATES,
    FACTION_NAME_FULCRUM_SECRET_TECHNOLOGIES,
    FACTION_NAME_MEGACORP,
    FACTION_NAME_NWO,

    FACTION_NAME_THE_COVENANT,
    FACTION_NAME_ILLUMINATI,
    FACTION_NAME_DAEDALUS,
];

export const FACTIONS_HACKING_STAT_REQUIREMENTS = {
    [FACTION_NAME_TIAN_DI_HUI]: 50,
    [FACTION_NAME_NETBURNERS]: 80,
    [FACTION_NAME_SPEAKERS_FOR_THE_DEAD]: 100,
    [FACTION_NAME_THE_DARK_ARMY]: 300,
    [FACTION_NAME_THE_SYNDICATE]: 200,
    [FACTION_NAME_THE_COVENANT]: 850,
    [FACTION_NAME_DAEDALUS]: 2500,
    [FACTION_NAME_ILLUMINATI]: 1500,
};

export const FACTIONS_BATTLE_STAT_REQUIREMENTS = {
    [FACTION_NAME_SLUM_SNAKES]: 30,
    [FACTION_NAME_TETRADS]: 75,
    [FACTION_NAME_SPEAKERS_FOR_THE_DEAD]: 300,
    [FACTION_NAME_THE_DARK_ARMY]: 300,
    [FACTION_NAME_THE_SYNDICATE]: 200,
    [FACTION_NAME_THE_COVENANT]: 850,
    [FACTION_NAME_ILLUMINATI]: 1200,
};

export const FACTIONS_CITY_REQUIREMENTS = {
    [FACTION_NAME_TIAN_DI_HUI]: CITY_CHONGQING,
    [FACTION_NAME_SECTOR_12]: CITY_SECTOR_12,
    [FACTION_NAME_CHONGQING]: CITY_CHONGQING,
    [FACTION_NAME_NEW_TOKYO]: CITY_NEW_TOKYO,
    [FACTION_NAME_ISHIMA]: CITY_ISHIMA,
    [FACTION_NAME_AEVUM]: CITY_AEVUM,
    [FACTION_NAME_VOLHAVEN]: CITY_VOLHAVEN,
    [FACTION_NAME_TETRADS]: CITY_CHONGQING,
    [FACTION_NAME_THE_DARK_ARMY]: CITY_CHONGQING,
    [FACTION_NAME_THE_SYNDICATE]: CITY_SECTOR_12
};

export const FACTIONS_REP_THRESHOLDS = {
    [FACTION_NAME_CYBERSEC]: [3750],
    [FACTION_NAME_TIAN_DI_HUI]: [10000, 75000],
    [FACTION_NAME_NITESEC]: [30000],
    [FACTION_NAME_SECTOR_12]: [25000],
};

export const FACTIONS_IGNORED_AUGMENTS = {
    [FACTION_NAME_NITESEC]: [AUGMENTATION_DATA_JACK],
    [FACTION_NAME_CHONGQING]: [AUGMENTATION_DATA_JACK],
    [FACTION_NAME_NEW_TOKYO]: [AUGMENTATION_DATA_JACK],
    [FACTION_NAME_THE_SYNDICATE]: [AUGMENTATION_NEMEAN_SUBDERMAL_WEAVE],
    [FACTION_NAME_SECTOR_12]: [AUGMENTATION_NEURALSTIMULATOR],
};

export const FACTIONS_COMPANY_REQUIREMENTS = {
    [FACTION_NAME_FOUR_SIGMA]: COMPANY_NAME_FOUR_SIGMA,
    [FACTION_NAME_MEGACORP]: COMPANY_NAME_MEGACORP,
    [FACTION_NAME_ECORP]: COMPANY_NAME_ECORP,
    [FACTION_NAME_KUAIGONG_INTERNATIONAL]: COMPANY_NAME_KUAIGONG_INTERNATIONAL,
    [FACTION_NAME_NWO]: COMPANY_NAME_NWO,
    [FACTION_NAME_BLADE_INDUSTRIES]: COMPANY_NAME_BLADE_INDUSTRIES,
    [FACTION_NAME_OMNITEK_INCORPORATED]: COMPANY_NAME_OMNITEK_INCORPORATED,
    [FACTION_NAME_BACHMAN_AND_ASSOCIATES]: COMPANY_NAME_BACHMAN_AND_ASSOCIATES,
    [FACTION_NAME_CLARKE_INCORPORATED]: COMPANY_NAME_CLARKE_INCORPORATED,
    [FACTION_NAME_FULCRUM_SECRET_TECHNOLOGIES]: COMPANY_NAME_FULCRUM_SECRET_TECHNOLOGIES,
};