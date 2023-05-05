import {
    HACKNET_UPGRADE_GENERATE_CODING_CONTRACT,
    HACKNET_UPGRADE_IMPROVE_GYM_TRAINING,
    HACKNET_UPGRADE_IMPROVE_STUDYING,
    HACKNET_UPGRADE_INCREASE_MAXIMUM_MONEY,
    HACKNET_UPGRADE_REDUCE_MINIMUM_SECURITY
} from "/constants/Hacknet";

export const DISPATCHER_TIME_INTERVAL = 10000;
export const WEAKEN_TIME_CUTOFF_BASE = 1*60*1000; //1*60*1000 = 1 Minute
export const WEAKEN_TIME_CUTOFF_HACK_LEVEL_INCREMENTS = 200; //Every X hacking level cutoff time increases

export const TIME_BETWEEN_ATTACK_PHASES = 500;
export const NUMBER_OF_BATCH_RUNS_IN_A_SINGLE_ATTACK = 1;
export const MIN_TIME_BETWEEN_ATTACKS_START = TIME_BETWEEN_ATTACK_PHASES * 5;
export const PURCHASED_SERVERS_COST_SAFETY_ADJUSTMENT = 2;
export const PURCHASED_SERVERS_HACKING_LEVEL_REQUIREMENTS = [
    {
        hackingLevel: 100,
        serverRam: 64,
    },
    {
        hackingLevel: 200,
        serverRam: 128,
    },
    {
        hackingLevel: 400,
        serverRam: 256,
    },
    {
        hackingLevel: 700,
        serverRam: 512,
    },
    {
        hackingLevel: 1000,
        serverRam: 1024,
    },
    {
        hackingLevel: 1500,
        serverRam: 2048,
    },
    {
        hackingLevel: 2000,
        serverRam: 4096,
    },
]

export const HASHNET_BASE_PRODUCTION_THRESHOLD = 0.5;

export const ALLOWED_HASHNET_SPENDINGS = [
    HACKNET_UPGRADE_REDUCE_MINIMUM_SECURITY,
    HACKNET_UPGRADE_INCREASE_MAXIMUM_MONEY,
    HACKNET_UPGRADE_IMPROVE_GYM_TRAINING,
    HACKNET_UPGRADE_IMPROVE_STUDYING,
    HACKNET_UPGRADE_GENERATE_CODING_CONTRACT,
];

export const SLEEVE_SHOCK_THRESHOLD = 95;